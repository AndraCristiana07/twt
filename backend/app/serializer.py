# serializers.py
from rest_framework import serializers
from app.models import User, Follow, Message
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        password = validated_data.pop('password')
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
        # user = User.objects.create_user(
        #     # username=validated_data['username'],
        #     # password=validated_data['password'],
        #     email=validated_data['email'],
        #     first_name=validated_data['name'],
        #     password=make_password(validated_data['password'])
        # )
        # return user

    class Meta:
        model = User
        fields = ('id','username', 'name', 'email', 'password')  

class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ('id', 'follower', 'followed', 'created_at')
        
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'content', 'timestamp')