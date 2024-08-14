from django.urls import path

from . import views

urlpatterns = [
    path('home/', views.HomeView.as_view(), name ='home'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('follow/<user_id>', views.FollowUserView.as_view(), name='follow'),
    path('unfollow/<user_id>', views.UnfollowUserView.as_view(), name='unfollow'),
    path('get_user/', views.GetUserView.as_view(), name='get_user'),
    path('delete_user', views.DeleteUserView.as_view(), name='delete_user'),
    # path('get_all_users/', views.GetAllUsersView.as_view(), name='get_all_users'),
    path('get_following/<user_id>', views.GetFollowing.as_view(), name='get_following'),
    path('get_followers/<user_id>', views.GetFollowers.as_view(), name='get_followers'),
    # path('send_message/', views.SendMessageView.as_view(), name='send_message'),
    # path('get_messages/<user_id>', views.GetMessagesView.as_view(), name='get_messages'),
    # path('get_message/<message_id>', views.GetOneMessageView.as_view(), name='get_message'), # TODO ???
    path('get_specific_user/<user_id>', views.GetSpecificUserView.as_view(), name='get_specific_user'),
    path('search_user', views.SearchUserView.as_view(), name='search_user'),
    path('auth', views.IsLoggedIn.as_view(), name='auth'),
    path('upload_profile_picture', views.ProfilePicture.as_view(), name='upload_profile_picture'),
    path('upload_header_picture', views.HeaderPicture.as_view(), name='upload_header_picture'),
    path('delete_profile_picture', views.DeleteProfilePicture.as_view(), name='delete_profile_picture'),
    path('delete_header_picture', views.DeleteHeaderPicture.as_view(), name='delete_header_picture'),
    

]