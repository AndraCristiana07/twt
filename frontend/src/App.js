import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { Login } from './component/pages/login';
import { Logout } from './component/logout';
import { Register } from './component/pages/register';
import 'bootstrap/dist/css/bootstrap.min.css';
import TweetView from './component/pages/tweetView';
import { Search } from './component/pages/search';
import { Notifications } from './component/pages/notifications';
import Messages from './component/pages/messages';
import { Bookmarks } from './component/bookmarks';
import { Profile } from './component/pages/profile';
import React, { useState } from "react";
import { Conversation } from './component/pages/conversation';
import { TweetPost } from './component/modals/tweetPost';
import CommentView from './component/commentView';
import { FollowingTimeline } from './component/pages/followingTimeline';
import { LikesPage } from './component/pages/likesPage';
import ImageViewer from './component/pages/imageView';
import { CarouselView } from './component/testCarousel';
import { UserImageViewer } from './component/pages/userImageViewer';
import Menu from './component/drawer';
import Layout from './component/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/logout" element={<Logout/>} />
          <Route path="/register" element={<Register/>} />
        <Route element={<Layout/>}>
          <Route path="/" element={<FollowingTimeline/>} />
          <Route path="/tweet/:tweetId" element={<TweetView/>} />
          <Route path="/tweet/comment/:commentId" element={<CommentView/>} />
         
          <Route path="/notifications" element={<Notifications/>} />
          {/* <Route path="/messages" element={<Messages />} /> */}
          <Route path="/conversation/:sender" element={<Conversation/>}/>
          <Route path="/profile" element={<Profile/>} />
          <Route path="/postTweet" element={<TweetPost/>} />
          <Route path="/profile/:userId" element={<Profile/>} />
          <Route path="/following" element={<FollowingTimeline/>} />
          <Route path="/likes/:userId" element={<LikesPage/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/tweet/:tweetId/images/:imageNumber" element={<ImageViewer/>} />
          <Route path="/image/:userId/:name" element={<UserImageViewer/>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
