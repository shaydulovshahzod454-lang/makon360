from django.shortcuts import render
from rest_framework import viewsets, permissions, generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters as drf_filters, status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db.models import Exists, OuterRef
from .models import Category, Listing, Room, Hotspot, Favorite, UserProfile, Amenity, Feedback
from .serializers import (
    CategorySerializer, ListingListSerializer, ListingDetailSerializer,
    RoomSerializer, HotspotSerializer, FavoriteSerializer, AmenitySerializer,
    FeedbackSerializer, RegisterSerializer, FavoriteSerializer, MeSerializer, 

)
from .filters import ListingFilter
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import AllowAny
import requests
import threading

class IsAgentOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'profile', None)
        return bool(profile and profile.is_agent)
    
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    """Qulayliklar ro'yxati - faqat o'qish uchun, admin panel orqali boshqariladi"""
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class ListingViewSet(viewsets.ModelViewSet):
    queryset = Listing.objects.all().select_related('category', 'created_by').prefetch_related('rooms', 'amenities').order_by('-created_at')
    permission_classes = [IsAgentOrReadOnly]

    filter_backends = [DjangoFilterBackend, drf_filters.SearchFilter, drf_filters.OrderingFilter]
    filterset_class = ListingFilter
    search_fields = ['title', 'address', 'description']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user and user.is_authenticated:
            qs = qs.annotate(
                is_favorited_db=Exists(Favorite.objects.filter(user=user, listing=OuterRef('pk')))
            )
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return ListingListSerializer
        return ListingDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.created_by != self.request.user:
            raise PermissionDenied("Siz faqat o'zingiz qo'shgan e'lonni tahrirlay olasiz.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise PermissionDenied("Siz faqat o'zingiz qo'shgan e'lonni o'chira olasiz.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_favorite(self, request, pk=None):
        listing = self.get_object()
        favorite, created = Favorite.objects.get_or_create(user=request.user, listing=listing)
        if not created:
            favorite.delete()
            return Response({'is_favorited': False})
        return Response({'is_favorited': True})


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAgentOrReadOnly]


class HotspotViewSet(viewsets.ModelViewSet):
    queryset = Hotspot.objects.all()
    serializer_class = HotspotSerializer
    permission_classes = [IsAgentOrReadOnly]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Har bir foydalanuvchi faqat o'zining sevimlilarini ko'radi
        return Favorite.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

def _send_feedback_email(feedback_name, feedback_email, feedback_message):
    """Email yuborishni asosiy so'rovdan ajratib, orqa fonda bajaradi -
    shunda Resend sekinlashsa ham, foydalanuvchi va boshqa tashrif
    buyuruvchilar kutib turishga majbur bo'lmaydi."""
    try:
        requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": "Makon360 <onboarding@resend.dev>",
                "to": [settings.FEEDBACK_RECEIVER_EMAIL],
                "subject": f"Makon360 - Yangi fikr-mulohaza: {feedback_name}",
                "text": (
                    f"Ism: {feedback_name}\n"
                    f"Email: {feedback_email}\n\n"
                    f"Xabar:\n{feedback_message}"
                ),
            },
            timeout=5,
        )
    except Exception:
        pass


class FeedbackCreateView(APIView):
    """Foydalanuvchi fikr-mulohaza yuborishi uchun - login shart emas"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            feedback = serializer.save()

            # Email yuborishni orqa fon oqimiga topshiramiz va darhol javob
            # qaytaramiz - foydalanuvchi Resend javobini kutib turmaydi
            threading.Thread(
                target=_send_feedback_email,
                args=(feedback.name, feedback.email, feedback.message),
                daemon=True,
            ).start()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)