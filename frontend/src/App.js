import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { Navigation } from './component/navigation';
import { MenuBar } from './component/menuBar';
import { Home } from './component/home';
import { Login } from './component/login';
import { Logout } from './component/logout';
import { Register } from './component/register';
import 'bootstrap/dist/css/bootstrap.min.css';
import TweetView from './component/tweetView';
import { Search } from './component/search';
import { Notifications } from './component/notifications';
import Messages from './component/messages';
import { Bookmarks } from './component/bookmarks';
import { Profile } from './component/profile';
import UserProfile from './component/userProfile';
import React, { useState } from "react";
import { Conversation } from './component/conversation';
import { Tweet } from './component/tweet_post';
import CustomDrawer from './component/drawer';
import CommentView from './component/commentView';
import { FollowingTimeline } from './component/followingTimeline';
import { RepliesPage } from './component/repliesPage';
import { LikesPage } from './component/likesPage';
import ImageViewer from './component/imageView';
import { CarouselView } from './component/testCarousel';
function App() {


  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<FollowingTimeline/>} />
        <Route path="/tweet/:tweetId" element={<TweetView />} />
        <Route path="/tweet/comment/:commentId" element={<CommentView  />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* <Route path="/messages" element={<Messages />} /> */}
        <Route path="/conversation/:sender" element={<Conversation/>}/>
        <Route path="/profile" element={<Profile />} />
        <Route path="/postTweet" element={<Tweet />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/following" element={<FollowingTimeline />} />
        <Route path="/replies" element={<RepliesPage />} />
        <Route path="/likes" element={<LikesPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/tweet/:tweetId/images/:imageNumber" element={<ImageViewer />} />
        <Route path="/car" element={<CarouselView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
