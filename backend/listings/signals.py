from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Listing, Room


@receiver(post_delete, sender=Listing)
def delete_listing_floor_plan(sender, instance, **kwargs):
    """E'lon o'chirilganda, uning sxema rasmini ham Cloudinary/diskdan o'chiradi"""
    if instance.floor_plan_image:
        instance.floor_plan_image.delete(save=False)


@receiver(post_delete, sender=Room)
def delete_room_panorama(sender, instance, **kwargs):
    """Xona o'chirilganda, uning panorama rasmini ham Cloudinary/diskdan o'chiradi"""
    if instance.panorama_image:
        instance.panorama_image.delete(save=False)