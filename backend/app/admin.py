from django.contrib import admin
from .models import App
from django.contrib.auth.models import User

# class Appdmin(admin.ModelAdmin):
#     list_display = ('title', 'description', 'completed')

class UserAdmin(admin.ModelAdmin):
    list_display = ('name' 'email')
    
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user','verified','bio')
# Register your models here.

# admin.site.register(App, Appdmin)
admin.site.register(User, UserAdmin)
