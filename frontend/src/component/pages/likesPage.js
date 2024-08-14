import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import Button from '@mui/material/Button';
import deleteImg from '../../assets/delete.svg';
import back from "../../assets/back-arrow.svg";
import heart_icon from "../../assets/heart.svg";
import heart_icon_red from "../../assets/heart-red.svg";
import comment_icon from "../../assets/comment.svg";
import retweet_icon from "../../assets/retweet.svg";
import retweet_icon_red from "../../assets/retweet-red.svg";
import Menu from "../drawer";
import { Comment } from "../modals/commentPost";
import { DeleteDialog } from "../modals/deleteTweetDialog";
import "../../css/home.css";
import { teal } from "@mui/material/colors";
import { ProfileHeader } from "../profileHeader";
import { RetweetTweet } from "../modals/RetweetDialog";
import default_profile from "../../assets/default_profile.png"
import axiosInstance from "../../interceptor/axiosInstance";
import { TweetCard } from "../tweetCard";


export const LikesPage = () => {
    const [tweets, setTweets] = useState([]);
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tweetIdToDelete, setTweetIdToDelete] = useState(null);
    const {userId} = useParams();

    const [username, setUsername] = useState();
    const [user, setUser] = useState({});
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false)
    const [profileImageURL, setProfileImageURL] = useState();
    const [headerImageURL, setHeaderImageURL] = useState();
    const [tweetIcon, setTweetIcon] = useState(null);
    const [images, setImages] = useState([])
    const [ogTweetImages, setOgTweetImages] = useState([]);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

    const [showQuoteDialog, setShowQuoteDialog] = React.useState(false);

    const handleOpenQuoteDialog = (e) => {
        setShowQuoteDialog(true);

    }
    const handleCloseQuoteDialog = () => {
        setShowQuoteDialog(false);
    }

    useEffect(() => {
        setLoading(true)
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchTweets();

            fetchUserInfo(userId);
            fetchProfileImage()
        }
    }, [userId, profileImageURL]);

    const fetchProfileImage = async () => {
        console.log("?" + profileImageURL);
        if (profileImageURL) {
            const fetchedProfileImage = await imageFetch(profileImageURL);
            setTweetIcon(fetchedProfileImage);
        } else {
            setTweetIcon(default_profile)
        }
    }
    const imageFetch = async (path) => {
        const url = `${seaweedUrl}${path}`
        const accessToken = localStorage.getItem('access_token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            responseType: 'blob'
        };
        const response = await axiosInstance.get(url, config);
        return URL.createObjectURL(response.data)
    }

    const fetchUserInfo = async (user_id) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/get_specific_user/${user_id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });
            console.log(response.data);
            const fetchedProfileImage = response.data.profile_image;
            const fetchedHeaderImage = response.data.header_image;
            setProfileImageURL(fetchedProfileImage);
            setHeaderImageURL(fetchedHeaderImage);
            setUsername(response.data.username);
        } catch (err) {
            // TODO
            console.log(err)
        }
    }



    const fetchTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/tweets/get_user_likes/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            if (Array.isArray(response.data.likes)) {
                const sortedTweets = response.data.likes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setTweets(sortedTweets);
            } else {
                console.error('Response data structure is unexpected:', response.data);
            }
            var images = [];
            for (const tweet of response.data.likes) {
                if (tweet.image_urls) {
                    for (const url of tweet.image_urls) {
                        var img = await imageFetch(url);
                        images.push(img);
                    }
                    setImages(images);
                }

            }
            let ogImages = [];
            for (const tweet of response.data.likes) {
                if (tweet.original_tweet && tweet.original_tweet.image_urls) {
                    const fetchedOgImages = await Promise.all(
                        tweet.original_tweet.image_urls.map(async (url) => await imageFetch(url))
                    );

                    ogImages = ogImages.concat(fetchedOgImages)
                    setOgTweetImages(ogImages);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };


    const handleLike = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/like/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, likes: tweet.likes + 1, isLiked: true } : tweet

            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async (tweetId, likeId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, likes: tweet.likes - 1, isLiked: false } : tweet

            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async (tweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets + 1, isRetweeted: true } : tweet

            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async (tweetId, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { tweet_id: tweetId }
            });
            setTweets(tweets.map(tweet =>
                tweet.id === tweetId ? { ...tweet, retweets: tweet.retweets - 1, isRetweeted: false } : tweet

            ));
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteTweet = async (tweetIdToDelete) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/delete/${tweetIdToDelete}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
            });
            setTweets(tweets.filter(tweet => tweet.id !== tweetIdToDelete));
            handleCloseDeleteDialog();
        } catch (error) {
            console.log(error);
        }
    };
    

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setTweetIdToDelete(null);
    };

    

    return (
        <Container fluid className="mt-5 text-center" style={{ position: "relative" }}>
            <Row>
                <Col xs={3} style={{ position: "fixed", height: "100vh", overflow: "auto", borderRight: "1px solid black" }}>
                    <Menu />
                </Col>
                <Col xs={{ span: 6, offset: 3 }}>
                    <ProfileHeader tweets={tweets} username={username} userId={userId} profileImageURL={profileImageURL}
                        headerImageURL={headerImageURL} />
                    <Container fluid>
                        <Row>
                            <Col>
                                <Button style={{ color: "grey", background: "transparent", border: "none" }} onClick={() => navigate(`/profile/${userId}`)}>Posts</Button>
                            </Col>

                            <Col>
                                <Button style={{ textDecoration: "underline", textDecorationThickness: "4px", color: "black", textDecorationColor: "blue", background: "transparent", border: "none" }} onClick={() => navigate("/likes")}>Likes</Button>
                            </Col>
                        </Row>
                    </Container>
                    {loading ? <p> Loading... </p> : (
                        <div>

                            {tweets.length > 0 ? (
                                tweets.map(tweet => (
                      
                                <TweetCard
                                        key={tweet.id}
                                        originalTweetImg={tweet.original_tweet}
                                        tweet={tweet}
                                        handleLike={handleLike}
                                        handleUnlike={handleUnlike}
                                        handleRetweet={handleRetweet}
                                        handleUnretweet={handleUnretweet}
                                        handleDeleteTweet={handleDeleteTweet} />
                    )) ) : (<p>No tweets available</p>)}
                    </div>
                    )}
                </Col>
                <Col xs={{ span: 3, offset: 9 }}
                    style={{ position: "fixed", height: "100vh", overflow: "auto", borderLeft: "1px solid black" }}>

                </Col>
            </Row>
        </Container>
    );
};