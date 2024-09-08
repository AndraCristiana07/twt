from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from django.db.models.signals import post_save

# Create your models here.

# Custom user manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
       
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password, **extra_fields):
        
        extra_fields.setdefault('is_s   taff', False)
        extra_fields.setdefault('is_superuser', False)
        return self.create_user(email, password, **extra_fields)
    
    def create_superuser(self, email, password=None, **extra_fields):
     
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

    
class User(AbstractUser):
    username = models.CharField(max_length=120, unique=True)
    name = models.CharField(max_length=120, default='User name')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=120)
    profile_image = models.URLField(default="", blank=True, null=True)
    header_image = models.URLField(default="",blank=True,null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def follow(self, user):
        if not Follow.objects.filter(follower=self, followed=user).exists():
            Follow.objects.create(follower=self, followed=user)

    def unfollow(self, user):
        Follow.objects.filter(follower=self, followed=user).delete()
    
    def get_following(self):
        return Follow.objects.filter(follower=self)
    
    def get_followers(self):
        return Follow.objects.filter(followed=self)
    
    # def get_isFollowing(self, obj):
    #     request = self.context.get('request')
    #     if request and request.user.is_authenticated:
    #         return Follow.objects.filter(follower=self, followed=user).exists()
    #     return False

    def profile(self):
        profile = Profile.objects.get(user=self)
        

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) #delete user == delete profile
    full_name = models.CharField(max_length=120)
    bio = models.TextField(blank=True)
    verified = models.BooleanField(default=False)


                                  
    def _str_(self):
        return self.user.name

class Follow(models.Model):
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'followed'], name='unique_following')
        ]

    def _str_(self):
        return self.follower.name + ' is following ' + self.followed.name

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def _str_(self):
        return f"From {self.sender.username} to {self.receiver.username} ({self.timestamp})"


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)



def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)