from django.contrib import admin
from .models import Category, Listing, Room, Hotspot, Favorite, UserProfile, Amenity

admin.site.register(Category)
admin.site.register(Listing)
admin.site.register(Room)
admin.site.register(Hotspot)
admin.site.register(Favorite)
admin.site.register(UserProfile)
admin.site.register(Amenity)