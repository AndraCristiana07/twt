from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Follow
from .kafka_producer import follow_user

@receiver(post_save, sender=Follow)
def follow_created(sender, instance, created, **kwargs):
    if created:
        follow_user(instance.follower, instance.followed)
