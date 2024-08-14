from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from app.serializer import UserSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import login
from app.models import User
from app.models import Follow
from app.models import Message
from app.serializer import MessageSerializer
from app.documents import UserDocument
from elasticsearch_dsl.query import MultiMatch
from app.kafka_producer import follow_user
from django.core.files.uploadedfile import InMemoryUploadedFile
import logging
import json
from channels.generic.websocket import WebsocketConsumer


class HomeView(APIView):

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        content = {"message": "Welcome "}
        return Response(content)

class LogoutView(APIView):
    permission_classes = ()
    def post(self, request):
        try:
            print(request.data["refresh_token"])
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            logging.error(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)

class IsLoggedIn(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        return Response({"message": "User is logged in"}, status=status.HTTP_200_OK)

class ProfilePicture(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_id = request.user.id
        profile_image = request.FILES.get("profileImage")
        if profile_image:
            image_path = self.upload_image_to_seaweedfs(profile_image,user_id)
            user.profile_image = image_path
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile picture put Successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"message": "Error putting profile picture", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def upload_image_to_seaweedfs(self, image: InMemoryUploadedFile, user_id):
        url = f"http://seaweedfsfiler:8888/users/{user_id}/profile/profile_image.png"
        path = f"/users/{user_id}/profile/profile_image.png"
        file = {"file": image.file}
        response = requests.post(url, files=file)
        if response.status_code == 201:
            return path

        else:
            return Exception("Failed to upload image to SeaweedFS")

class DeleteProfilePicture(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        profile_image = user.profile_image
        user.profile_image = None
        user.save()
        return Response({"message": "Profile image deleted successfully"}, status=status.HTTP_200_OK)
      
class HeaderPicture(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user_id = request.user.id
        header_image = request.FILES.get("headerImage")
        if header_image:
            image_path = self.upload_image_to_seaweedfs(header_image,user_id)
            user.header_image = image_path
        serializer = UserSerializer(user, data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Header picture put Successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"message": "Error putting header picture", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def upload_image_to_seaweedfs(self, image: InMemoryUploadedFile, user_id):
        url = f"http://seaweedfsfiler:8888/users/{user_id}/header/header_image.png"
        path = f"/users/{user_id}/header/header_image.png"
        file = {"file": image.file}
        response = requests.post(url, files=file)
        if response.status_code == 201:
            return path

        else:
            return Exception("Failed to upload image to SeaweedFS")

class DeleteHeaderPicture(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user_id = request.user.id
        user = User.objects.get(id=user_id)
        header_image = user.header_image
        user.header_image = None
        user.save()
        return Response({"message": "Profile image deleted successfully"}, status=status.HTTP_200_OK)                      
            
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        data = request.data
        username = data.get("username")
        email = data.get("email")

        if User.objects.filter(username=username).exists():
            return Response(
                {"message": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"message": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            
            return Response(
                {"message": "User Created Successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"message": "Error creating user", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

class LoginView(APIView):
    def post(self, request):
        email = request.data["email"]
        password = request.data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Account does  not exist")
        if user is None:
            raise AuthenticationFailed("User does not exist")
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect Password")
        access_token = AccessToken.for_user(user)
        refresh_token = RefreshToken.for_user(user)
        return Response({"access_token": access_token, "refresh_token": refresh_token})

class GetUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

class GetSpecificUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UserSerializer(user)
        return Response(serializer.data)

class DeleteUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UpdateUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FollowUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        follower = request.user

        try:
            user_to_follow = User.objects.get(id=user_id)
            follow_user(follower, user_to_follow)
        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )
        if Follow.objects.filter(follower=follower, followed=user_to_follow).exists():
            return Response(
                {"message": "You already follow this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Follow.objects.create(follower=follower, followed=user_to_follow)
        is_following = Follow.objects.filter(follower=follower, followed=user_to_follow).exists()
        
        return Response(
            {"message": "Followed successfully", "isFollowing": is_following}, status=status.HTTP_201_CREATED
        )

class UnfollowUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        follower = request.user

        try:
            user_to_unfollow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )


        if not Follow.objects.filter(follower=follower, followed=user_to_unfollow).exists():
            return Response(
                {"message": "You do not follow this user"},
                status=status.HTTP_400_BAD_REQUEST,
            )


        Follow.objects.filter(follower=follower, followed=user_to_unfollow).delete()
        is_following = Follow.objects.filter(follower=follower, followed=user_to_unfollow).exists()
        
        return Response(
            {"message": "Unfollowed successfully", "isFollowing": is_following}, status=status.HTTP_200_OK
        )

class GetFollowing(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, user_id):
        user = User.objects.get(id=user_id)
        if user is None:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        following = user.get_following()
        serializer = UserSerializer(
            [follow.followed for follow in following], many=True
        )
        return Response(serializer.data)

class GetFollowers(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, user_id):
        user = User.objects.get(id=user_id)
        if user is None:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )
        followers = user.get_followers()
        serializer = UserSerializer(
            [follow.follower for follow in followers], many=True
        )

        return Response(serializer.data)

class SendMessageView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        sender = request.user
        receiver_id = request.data["receiver_id"]
        content = request.data["content"]

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        message = Message.objects.create(
            sender=sender, receiver=receiver, content=content
        )
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GetMessagesView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, user_id):
        user = request.user
        if user is None:
            return Response(
                {"message": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST
            )

        sent_messages = Message.objects.filter(sender=user)
        received_messages = Message.objects.filter(receiver=user)
        messages = sent_messages.union(received_messages).order_by("-timestamp")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetOneMessageView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response(
                {"message": "Message does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SearchUserView(APIView):
    def get(self, request):
        q = request.GET.get("q")

        if not q:
            return Response(
                {"error": 'Query parameter "q" is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        query = MultiMatch(
            query=q, fields=["name", "email", "username"], type="phrase_prefix"
        )
        
        logging.error(query)
        
        search = UserDocument.search().query(query)

        response = search.execute()

        users = []
        for r in response:
            users.append(
                {"id": r.id, "email": r.email, "name": r.name, "username": r.username}
            )

        return Response(users, status=status.HTTP_200_OK)



class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
    def disconnect(self, close_code):
        pass
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.send(text_data=json.dumps({
            'message': message
        }))