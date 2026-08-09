from django.contrib import admin
from .models import Category, Listing, Room, Hotspot, Favorite, UserProfile, Amenity, Feedback

admin.site.register(Category)
admin.site.register(Listing)
admin.site.register(Room)
admin.site.register(Hotspot)
admin.site.register(Favorite)
admin.site.register(UserProfile)
admin.site.register(Amenity)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)