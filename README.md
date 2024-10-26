
<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">  BirdApp</h3>

  <p align="center">
    A Twitter like application
    <br />
   
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#acknowledgments">Acknoledgments</a></li>
    
    
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

A place where you can post whatever your heart desires, whether it's a photo, a video or simply just your thoughts. You can also comment on other's posts (or your own if you would like to), quote or like posts. You can also follow other people!

**Pages**
![Home image](https://github.com/AndraCristiana07/twt/blob/main/images/home.png?raw=true)

 * On the home page you can find all the posts you and your friends made.   You can also post something from here. 
 ![Post image](https://github.com/AndraCristiana07/twt/blob/main/images/post_img.png?raw=true)

On almost every page there is a side bar with home, search, profile, post,  notifications and logout buttons

![Profile image](https://github.com/AndraCristiana07/twt/blob/main/images/profile.png?raw=true)


* On the profile page you have all your information (or another person's profile).
You can find how many people the user follows, how many are following him and how many posts the user has. 
You can change your profile and header images here.
![Profile img image](https://github.com/AndraCristiana07/twt/blob/main/images/profile_img.png?raw=true)

You can also follow another person while on their profile. 

* There's also a likes page, where you can see what posts a user liked.

**Notification system**

There is a notification system made with Kafka and WebSocket, so when one user follows another one, they get a notification. If you click on the notification button on the side bar, you will see a list with all your notifications and the number of unseen notifications will go back to 0.

**Media**

You can post videos or images as media. You can put a maximum of 4 media files in a post. All files are stored in SeaweedFS and they are retrieved directly from the frontend. 
When you make a post, the media is uploaded by the backend to SeaweedFS and also stores the path in Cassandra. If the media is a video, first of all, the media is converted to MP4 with FFmpeg, than we get the duration (also with FFmeg), split the file using Apple’s HLS muxer into 5MB segments and finally upload them to SeaweedFS.
In the frontend, the videos are handled with MediaSource. We fetch the durations and the chunks and then we load the chunks accordingly to be able to load and seek the video correctly (we remove a time range to be able to load another)

**Search**

![Search image](https://github.com/AndraCristiana07/twt/blob/main/images/search.png?raw=true)


There's a search user implemented with ElasticSearch. You can search by name or username and you will get a list of the users containing the string you searched for. From here you can click on them and go to that user's profile page.

**Repost**

You can repost any post you want and add your own input to it (or not!). You can repost it without anything in addition or quote the post and add your thoughts or/and media.

**Storing data**

* All tweets and their informations are stored in Cassandra (also likes and comments). Cassandra is also used as a filer for SeaweedFS.

* The users and their information (email, name, username, hashed password) are stored in SQLite

* All media (including a user's profile and header images) are stored in SeaweedFS

### Built With

These are what I used to build the app:

* ![JavaScript](https://img.shields.io/badge/JavaScript%20-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
*  ![Python](https://img.shields.io/badge/Python%20-%2314354C.svg?style=for-the-badge&logo=python&logoColor=white)
* ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
* ![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
*  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
* ![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
* ![ApacheCassandra](https://img.shields.io/badge/cassandra-%231287B1.svg?style=for-the-badge&logo=apache-cassandra&logoColor=white)
* ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)
* ![Elasticsearch](https://img.shields.io/badge/elasticsearch-%230377CC.svg?style=for-the-badge&logo=elasticsearch&logoColor=white)
* ![FFmpeg](https://shields.io/badge/FFmpeg-%23171717.svg?logo=ffmpeg&style=for-the-badge&labelColor=171717&logoColor=5cb85c)

* SeaweedFS

* ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)
*  ![CSS3](https://img.shields.io/badge/CSS%20-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)







<!-- GETTING STARTED -->
## Getting Started

To be able to use this project you will need some stuff first.

### Prerequisites

* You need to install npm and node.js
* You need to install Django
* You need to install Docker and Docker-compose




<!-- ROADMAP -->
## Roadmap
- [x] Make login and register methods
- [x] Make login and register pages
- [x] Make tweet card
- [x] Make home page
- [x] Make sidebar
- [x] Make logout method
- [x] Make post tweet method 
- [x] Make get tweet method
- [x] Make delete tweet method
- [x] Make comments possible
- [x] Make like post method
- [x] Make user profile page
- [x] Make likes page
- [x] Make repost methods
- [x] Sort tweets based on post time
- [x] Implement search user method
- [x] Implement the ability to post images 
- [x] Image previews before posting
- [x] Delete media method from preview for posting 
- [x] Make profile and header images for users
- [x] Store files in SeaweedFS
- [x] Get files directly in frontend with SeaweedFS and Nginx
- [x] Make image carousel for images page
- [x] Implement follow methods
- [x] Make notification system with Kafka ans WebSockets
- [x] Notification bell with number of notifications
- [x] Notification page to see all notifications
- [x] Make video upload possible
- [x] Fragment and convert video in backend
- [x] Make video in frontend with MediaSouce
- [x] Make video seekable
- [x] Make it possible to have multiple videos in a post
- [x] Video previews before posting
- [x] Make file grid in a post
- [x] Videos in comments 
- [x] Comments on comments possibillity
- [x] Pagination for every page with posts
- [] Messages







<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Some things that helped me while making this project :
* [MediaSouce](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource)
* [MediaSouce Extensions](https://www.w3.org/TR/media-source-2/)
* [Kafka](https://kafka.apache.org/documentation/)
* [Nginx](https://nginx.org/en/docs/)
* [Cassandra](https://cassandra.apache.org/doc/stable/)
* [Django](https://docs.djangoproject.com/en/5.1/)
* [FFmpeg](https://ffmpeg.org/ffmpeg.html)
* [ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
* [SeaweedFS](https://github.com/seaweedfs/seaweedfs/wiki)
* [Docker](https://docs.docker.com/)







