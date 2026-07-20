from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ListingViewSet, RoomViewSet, HotspotViewSet,
    RegisterView, FavoriteViewSet, MeView, AmenityViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('listings', ListingViewSet)
router.register('rooms', RoomViewSet)
router.register('hotspots', HotspotViewSet)
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('amenities', AmenityViewSet)


urlpatterns = router.urls + [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
]