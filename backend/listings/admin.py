from django.contrib import admin
from .models import Category, Listing, Room, Hotspot, Favorite, UserProfile, Amenity, Feedback

admin.site.register(Category)
@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'price', 'is_approved', 'is_demo', 'created_at')
    list_filter = ('is_approved', 'is_demo', 'category')
    search_fields = ('title', 'address')
    actions = ['approve_listings']

    @admin.action(description="Tanlangan e'lonlarni tasdiqlash")
    def approve_listings(self, request, queryset):
        queryset.update(is_approved=True)
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