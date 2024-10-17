import React, { useState, useEffect, useId } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import Button from '@mui/material/Button';
import axiosInstance from "../../interceptor/axiosInstance";
import "../../css/home.css";
import default_profile from "../../assets/default_profile.png"
import { ProfileHeader } from "../profileHeader";
import { RetweetTweet } from "../modals/RetweetDialog";
import { List } from "@mui/material";
import { TweetCard } from "../tweetCard";

export const Profile = (props) => {
    const [tweets, setTweets] = useState([]);
    const [tweetsNumber, setTweetsNumber] = useState() 
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [showPostCommentDialog, setShowPostCommentDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [tweetIdToDelete, setTweetIdToDelete] = useState(null);
    const [currUserId, setcurrUserId] = useState(localStorage.getItem('user_id'));
    const [isCurrUserProfile, setIsCurrUserProfile] = useState(false);
    const { userId } = useParams();
    const [username, setUsername] = useState();
    const [profileImageURL, setProfileImageURL] = useState();
    const [headerImageURL, setHeaderImageURL] = useState();
    const [images, setImages] = useState([])
    const [ogTweetImages, setOgTweetImages] = useState([]);
    const [totalTweets, setTotalTweets] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showQuoteDialog, setShowQuoteDialog] = React.useState(false);
    const [tweetIcon, setTweetIcon] = useState(null);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

    const handleOpenQuoteDialog = (e) => {
        setShowQuoteDialog(true);

    }
    const handleCloseQuoteDialog = () => {
        setShowQuoteDialog(false);
    }

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            // window.location.href = '/login';
            navigate('/login');
        } else {
            if (userId === currUserId) {
                // if(page===1 && tweets.length === 0){
                    fetchTweets(currUserId, page);

                // }

                setIsCurrUserProfile(true);
                fetchUserInfo(currUserId);

            } 
            else {
                // if(page===1 && tweets.length === 0){
                    fetchTweets(userId, page);
                // }
                setIsCurrUserProfile(false);
                fetchUserInfo(userId);

            }
        fetchProfileImage()

        }
    }, [currUserId, userId, page]);


    // useEffect(()=> {
    //     fetchProfileImage()

    // },[])
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop + 1 >=
                document.documentElement.scrollHeight
            ) {
                if (!loading && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            }
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loading, hasMore]);


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


    const fetchProfileImage = async () => {
        if (profileImageURL) {
            const fetchedProfileImage = await imageFetch(profileImageURL);
            setTweetIcon(fetchedProfileImage);
        } else {
            setTweetIcon(default_profile)
        }
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
            const fetchedProfileImage = response.data.profile_image;
            const fetchedHeaderImage = response.data.header_image;
            setProfileImageURL(fetchedProfileImage);
            setHeaderImageURL(fetchedHeaderImage);
            setUsername(response.data.username);
        } catch (err) {
            // TODO
            console.error(err)
        }
    }


    const fetchTweets = async (user_id, page) => {
        try {
            setLoading(true);

            const accessToken = localStorage.getItem('access_token');
            const responseTweets = await axiosInstance.get(`${apiUrl}/tweets/get_user_tweets/${user_id}/?page=${page}`, {
                params: {
                    page: page,
                    page_size: pageSize
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            // const tweets = responseTweets.data.tweets;
            // setTweets(responseTweets.data.tweets);
            const sortedTweets = responseTweets.data.tweets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setTweets(prevItems => [...prevItems, ...sortedTweets]);
            setTweetsNumber(responseTweets.data.tweets.length)

            setTotalTweets(responseTweets.data.total_tweets)
            setTotalPages(responseTweets.data.total_pages)
            setHasMore(page < responseTweets.data.total_pages)

            // var images = [];
            // for (const tweet of responseTweets.data.tweets) {
            //     if (tweet.image_urls) {
            //         for (const url of tweet.image_urls) {
            //             var img = await imageFetch(url);
            //             images.push(img);
            //         }
            //         setImages(images);
            //     }

            // }
            // let ogImages = [];
            // for (const tweet of responseTweets.data.tweets) {
            //     if (tweet.original_tweet && tweet.original_tweet.image_urls) {
            //         const fetchedOgImages = await Promise.all(
            //             tweet.original_tweet.image_urls.map(async (url) => await imageFetch(url))
            //         );

            //         ogImages = ogImages.concat(fetchedOgImages)
            //         setOgTweetImages(ogImages);
            //     }
            // }


        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                // window.location.href = '/login';
            }
        } finally {
            setLoading(false);

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
            console.error(error);
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
            console.error(error);
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
            console.error(error);
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
            console.error(error);
        }
    };





    return (

        <>
            <ProfileHeader tweetsNumber={totalTweets} username={username} userId={currUserId} profileImageURL={profileImageURL}
                headerImageURL={headerImageURL} />
            <Container className="mt-5 text-center" fluid>
                <Row>
                    <Col>
                        <Button style={{
                            textDecoration: "underline",
                            textDecorationThickness: "4px",
                            color: "black",
                            textDecorationColor: "blue",
                            background: "transparent",
                            border: "none"
                        }} onClick={() => navigate('/profile')}>Posts</Button>
                    </Col>

                    <Col>
                        <Button style={{ color: "grey", background: "transparent", border: "none" }}
                            onClick={() => navigate(`/likes/${userId}`)}>Likes</Button>
                    </Col>
                </Row>
            </Container>
            {loading ? <p> Loading... </p> : (
                <div >
                    {console.log("length " + tweets.length)}
                    {tweets.length > 0 ? (
                        tweets.map(tweet => (
                        // <div>
                        //     {console.log("tweets " + JSON.stringify(tweet))}

                            <TweetCard
                                key={tweet.id}
                                originalTweetImg={tweet.original_tweet}
                                tweet={tweet}
                                tweetUrl={'get_tweet'}
                                handleLike={handleLike}
                                handleUnlike={handleUnlike}
                                handleRetweet={handleRetweet}
                                handleUnretweet={handleUnretweet}
                            />
// </div>

                        ))
                    ) : (
                        <p>No tweets available.</p>
                    )}
                </div>
            )}
            {/* <Row className="pagination-controls">
                        <Col>
                            <Button disabled={page <= 1} onClick={()=> setPage(page-1)}> Previous</Button>

                        </Col>
                        <Col>
                        <p>{page}</p>

                        </Col>
                        <Col>
                        <Button disabled={page >= totalPages} onClick={()=> setPage(page+1)}>Next</Button>
                        
                        </Col>
                    </Row> */}
        </>


    );
};
