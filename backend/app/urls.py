from django.urls import path

from . import views

urlpatterns = [
    path('home/', views.HomeView.as_view(), name ='home'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('follow/<user_id>', views.FollowUserView.as_view(), name='follow'),
    path('unfollow/<user_id>', views.UnfollowUserView.as_view(), name='unfollow'),
    path('get_user/', views.GetUserView.as_view(), name='get_user'),
    path('delete_user', views.DeleteUserView.as_view(), name='delete_user'),
    path('update_user/', views.UpdateUserView.as_view(), name='update_user'),
    path('get_all_users/', views.GetAllUsersView.as_view(), name='get_all_users'),
    path('search_user/', views.SearchUserView.as_view(), name='search_user'),
    path('get_following/<int:user_id>', views.GetFollowing.as_view(), name='get_following'),
    path('get_followers/<int:user_id>', views.GetFollowers.as_view(), name='get_followers'),
    
    # path('follow/', follow_user, name='follow'),
    # path('unfollow/', unfollow_user, name='unfollow'),

]