from rest_framework import serializers
from .models import Category, Listing, Room, Hotspot, Favorite, UserProfile, Amenity, Feedback
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password


class HotspotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotspot
        fields = ['id', 'room', 'target_room', 'yaw', 'pitch', 'label']

class RoomSerializer(serializers.ModelSerializer):
    hotspots = HotspotSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'listing', 'name', 'panorama_image', 'is_entry_point', 'hotspots']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if not (request and request.user and request.user.is_authenticated):
            representation['panorama_image'] = None
        return representation
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']

class ListingListSerializer(serializers.ModelSerializer):
    """Ro'yxat sahifasi uchun - qisqa ma'lumot (tezroq yuklanadi)"""
    category = CategorySerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = ['id', 'title', 'price', 'address', 'category', 'main_image', 'is_favorited']

    def get_main_image(self, obj):
        first_room = obj.rooms.first()
        if first_room and first_room.panorama_image:
            url = first_room.panorama_image.url
            # Cloudinary CDN orqali kelayotgan bo'lsa, kichik/optimallashtirilgan
            # versiyasini so'raymiz - katalog kartochkasi uchun to'liq hajm shart emas
            if 'res.cloudinary.com' in url:
                url = url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/')
                return url
            request = self.context.get('request')
            return request.build_absolute_uri(url)
        return None

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    


class ListingDetailSerializer(serializers.ModelSerializer):
    """Bitta e'lon sahifasi uchun - to'liq ma'lumot, barcha xonalar bilan"""
    rooms = RoomSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    amenities = serializers.PrimaryKeyRelatedField(many=True, queryset=Amenity.objects.all(), required=False)

    class Meta:
        model = Listing
        fields = [
            'id', 'title', 'description', 'price', 'address',
            'category', 'contact_phone', 'rooms', 'created_at', 'is_favorited', 'created_by',
            'amenities', 'floor', 'total_floors', 'year_built',
            'has_documents', 'has_gas', 'has_electricity', 'has_internet',
            'room_count', 'area', 'floor_plan_image',
        ]
        extra_kwargs = {
            'created_by': {'read_only': True},
        }

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['amenities'] = AmenitySerializer(instance.amenities.all(), many=True).data
        representation['category'] = CategorySerializer(instance.category).data if instance.category else None
        return representation

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Bu email allaqachon ro'yxatdan o'tgan.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user, is_agent=False)
        return user


class FavoriteSerializer(serializers.ModelSerializer):
    listing_detail = ListingListSerializer(source='listing', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'listing', 'listing_detail', 'created_at']
        extra_kwargs = {
            'listing': {'write_only': True},
        }

    def validate_listing(self, value):
        request = self.context.get('request')
        if request and Favorite.objects.filter(user=request.user, listing=value).exists():
            raise serializers.ValidationError("Bu e'lon allaqachon sevimlilarga qo'shilgan.")
        return value
    
class MeSerializer(serializers.ModelSerializer):
    is_agent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_agent']

    def get_is_agent(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.is_agent if profile else False

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'name', 'email', 'message', 'created_at']
        extra_kwargs = {
            'created_at': {'read_only': True},
        }