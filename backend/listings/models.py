from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100)  # masalan: "Kvartira", "Hovli uy", "Ofis"

    def __str__(self):
        return self.name


class Amenity(models.Model):
    name = models.CharField(max_length=100)  # masalan: "Wi-Fi", "Konditsioner", "Avtoturargoh"

    class Meta:
        verbose_name_plural = "Amenities"

    def __str__(self):
        return self.name


class Listing(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    address = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='listings')

    amenities = models.ManyToManyField(Amenity, blank=True, related_name='listings')

    # Qo'shimcha ma'lumot
    floor = models.PositiveIntegerField(null=True, blank=True)
    total_floors = models.PositiveIntegerField(null=True, blank=True)
    year_built = models.PositiveIntegerField(null=True, blank=True)
    has_documents = models.BooleanField(default=False)
    has_gas = models.BooleanField(default=False)
    has_electricity = models.BooleanField(default=False)
    has_internet = models.BooleanField(default=False)

    # Sotuv ofisi bilan bog'lanish uchun
    contact_phone = models.CharField(max_length=20)
    
    # Kim qo'shganini bilish uchun (admin/agent)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Room(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=100)  # masalan: "Oshxona", "Yotoqxona 1"
    panorama_image = models.ImageField(upload_to='panoramas/')
    
    # Agar shu xona virtual tur boshlanadigan asosiy xona bo'lsa
    is_entry_point = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.listing.title} - {self.name}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'listing')  # bitta foydalanuvchi bir e'lonni faqat bir marta sevimliga qo'sha oladi

    def __str__(self):
        return f"{self.user.username} - {self.listing.title}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_agent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} ({'agent' if self.is_agent else 'user'})"

class Hotspot(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='hotspots')
    target_room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='+')
    
    # Panorama ustida hotspot qayerda joylashgani
    yaw = models.FloatField()    # gorizontal burchak (0-360)
    pitch = models.FloatField()  # vertikal burchak (-90 dan +90 gacha)
    
    label = models.CharField(max_length=100, blank=True)  # masalan: "Yotoqxonaga o'tish"

    def __str__(self):
        return f"{self.room.name} -> {self.target_room.name}"