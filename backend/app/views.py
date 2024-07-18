from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse, JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
# from django.contrib.auth.models import User
from app.serializer import UserSerializer
from django.contrib.auth import authenticate
from django.contrib.auth import login
from app.models import User

from app.models import Follow

class HomeView(APIView):
     
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        content = {'message': 'Welcome '}
        return Response(content)


class LogoutView(APIView):
     permission_classes = (IsAuthenticated,)
     def post(self, request):
          
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        

class RegisterView(APIView):
    # queryset = User.objects.all()
    # serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data["email"]
        password = request.data["password"]
        
        try:
            user = User.objects.get(email = email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Account does  not exist")
        if user is None:
            raise AuthenticationFailed("User does not exist")
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect Password")
        access_token = AccessToken.for_user(user)
        refresh_token = RefreshToken.for_user(user)
        return Response({
            "access_token" : access_token,
            "refresh_token" : refresh_token
        })

class GetUserView(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        user = request.user
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
        # user_id = request.data['user_id']

        try:
            # follower = User.objects.get(id=follower_id)
            # user = User.objects.get(id=user_id)
            user_to_follow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        if Follow.objects.filter(follower=follower, followed=user_to_follow).exists():
            return Response({'message': 'You already follow this user'}, status=status.HTTP_400_BAD_REQUEST)

        Follow.objects.create(follower=follower, followed=user_to_follow)
        return Response({'message': 'Followed successfully'}, status=status.HTTP_201_CREATED)

class UnfollowUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, user_id):
        follower = request.user
        # user_id = request.data['user_id']

        try:
            # follower = User.objects.get(id=follower_id)
            # user = User.objects.get(id=user_id)
            user_to_unfollow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        if not Follow.objects.filter(follower=follower, followed=user_to_unfollow).exists():
            return Response({'message': 'You do not follow this user'}, status=status.HTTP_400_BAD_REQUEST)

        Follow.objects.filter(follower=follower, followed=user_to_unfollow).delete()
        return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)

class GetFollowing(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request, user_id):
        # user_id = request.user.id
        user = User.objects.get(id=user_id)
        if user is None:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
        following = user.get_following()
        # serializer = UserSerializer(following, many=True)
        serializer = UserSerializer([follow.followed for follow in following], many=True)
        return Response(serializer.data)


class GetFollowers(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request, user_id):
        # user_id = request.user.id
        user =  User.objects.get(id=user_id)
        if user is None:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        followers = user.get_followers()
        # serializer = UserSerializer(followers, many=True)
        serializer = UserSerializer([follow.follower for follow in followers], many=True)
        
        return Response(serializer.data)
    

    

# class FollowUserView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def post(self, request):
#         follower_id = request.data['follower_id']
#         user_id = request.data['user_id']

#         try:
#             follower = User.objects.get(id=follower_id)
#             user = User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

#         if Follow.objects.filter(follower=follower, followed=user).exists():
#             return Response({'message': 'You already follow this user'}, status=status.HTTP_400_BAD_REQUEST)

#         Follow.objects.create(follower=follower, followed=user)
#         return Response({'message': 'Followed successfully'}, status=status.HTTP_201_CREATED) 

# class UnfollowUserView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def post(self, request):
#         follower_id = request.data['follower_id']
#         user_id = request.data['user_id']

#         try:
#             follower = User.objects.get(id=follower_id)
#             user = User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

#         if not Follow.objects.filter(follower=follower, followed=user).exists():
#             return Response({'message': 'You do not follow this user'}, status=status.HTTP_400_BAD_REQUEST)

#         Follow.objects.filter(follower=follower, followed=user).delete()
#         return Response({'message': 'Unfollowed successfully'}, status=status.HTTP_200_OK)

# class GetWhoTheUserFollowsView(APIView):
#     def get(self, request,user_id):
#         # user_id = request.data['user_id']
#         # user_id = request.data.get('user_id')

#         user = User.objects.get(id=user_id)
#         follows = Follower.objects.filter(follower=user)
#         serializer = UserSerializer(follows, many=True)
#         return Response(serializer.data)

# class GetWhoTheUserFollowsView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def get(self, request, user_id):
#         user = User.objects.get(id=user_id)
#         follows = Follow.objects.filter(follower=user)
#         serializer = UserSerializer(follows, many=True)
#         return Response(serializer.data)
    
    # class GetFollowedUSersView(APIView):
    # permission_classes = (IsAuthenticated,)

    # def get(self, request, user_id):
    #     try:
    #         user = User.objects.get(id=user_id)
    #     except User.DoesNotExist:
    #         return Response({'message' : 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        
    #     followed_users = Follower.objects.filter(follower=user).values_list('user')
    #     users = User.objects.filter(id__in=followed_users)
    #     serializer = UserSerializer(users, many=True)
    #     return Response(serializer.data, status=status.HTTP_200_OK)




class GetAllUsersView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class SearchUserView(APIView):
    def get(self, request):
        query = request.data['q']
        users = User.objects.filter(name__icontains=query)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    


# class FollowUserView(APIView):
#     permission_classes = (IsAuthenticated,)

#     def post(self, request):
#         user_id = request.data['user_id']
#         follower_id = request.data['follower_id']
#         # user_id = request.data.get('user_id')
#         # follow_id = request.data.get('follow_id')

#         user = User.objects.get(id=user_id)
#         follower = User.objects.get(id=follower_id)

#         if Follower.objects.filter(user=user, follower=follower).exists():
#             return Response({'message': 'You are already following this user'}, status=status.HTTP_400_BAD_REQUEST)

#         Follower.objects.create(user=user, follower=follower)
#         return Response({'message': 'User followed successfully'}, status=status.HTTP_201_CREATED)  
    

# class UnfollowUSerView(APIView):
#     def post(self, request):
#         user_id = request.data['user_id']
#         follower_id = request.data['follower_id']
#         # user_id = request.data.get('user_id')
#         # follower_id = request.data.get('follower_id')

#         user = User.objects.get(id=user_id)
#         follower = User.objects.get(id=follower_id)
#         if not Follower.objects.filter(user=user, follower=follower).exists():
#             return Response({'message': 'You are not following this user'}, status=status.HTTP_400_BAD_REQUEST)
        

#         Follower.objects.filter(user=user, follower=follower).delete()
#         return Response({'message': 'User unfollowed successfully'}, status=status.HTTP_200_OK)
