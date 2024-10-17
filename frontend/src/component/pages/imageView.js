import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import "../../css/image-grid.css"
import back from "../../assets/back-arrow.svg";
import axiosInstance from "../../interceptor/axiosInstance";

import { TweetButtons } from '../tweetButtons';
import { CommentButtons } from '../commentButtons';
import { VideoPlayer } from '../videoPlayer';
import zIndex from '@mui/material/styles/zIndex';

const ImageViewer = ({tweetUrl}) => {
    const { tweetId, imageNumber } = useParams(); 
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [tweet, setTweet] = useState(null);
    const [activeIndex, setActiveIndex] = useState(Number(imageNumber));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;
    console.log("tweetUrl" + tweetUrl)

    const imageFetch = async (path) => {
        const url = `${seaweedUrl}${path}`;
        const accessToken = localStorage.getItem('access_token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            responseType: 'blob',
        };
        const response = await axiosInstance.get(url, config);
        if(isImage(url)){
            return URL.createObjectURL(response.data);

        } else if(isVideo(url)){
            return url;
        }
    };


    const [comments, setComments] = useState([]);

    const [commentsImages, setCommentsImages] = useState([])

    const fetchComments = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/tweets/get_comments_for_tweet/${tweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(response.data.comments);
            var commentsImages = [];
            for (const comment of response.data.comments) {
                if(comment.image_urls){
                    for (const url of comment.image_urls) {
                        var img = await imageFetch(url);
                        commentsImages.push(img);
                    }
                    setCommentsImages(commentsImages);
                }
            
            }
        } catch (error) {
            console.log(error);
        }
    };
    const isImage = (url) => url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg')
    const isVideo = (url) => url.endsWith('.mp4') || url.endsWith('.webm')

    useEffect(() => {

        const fetchImages = async (tweetId) => {
            try {
                const accessToken = localStorage.getItem('access_token');
                // const response = await axiosInstance.get(`${apiUrl}/tweets/get_tweet/${tweetId}`, {
                const response = await axiosInstance.get(`${apiUrl}/tweets/${tweetUrl}/${tweetId}`, {

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
                const tweetData = response.data;
                setTweet(tweetData);
                const mediaUrl = tweetData.image_urls

                if(mediaUrl){
                    const imageArray = mediaUrl.filter((fileUrl) => isImage(fileUrl))
                
                    // if(imageArray && mediaUrl){
                        const images = await Promise.all(tweetData.image_urls.map(imageFetch));
                        setImages(images);
                        setLoading(false);
                    // }
                }
                
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchImages(tweetId);
        fetchComments();
    }, [tweetId, apiUrl]);

    const handleSelect = (selected) => {
        setActiveIndex(selected);
        navigate(`/tweet/${tweetId}/images/${selected}`); 
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <Alert variant="danger">Error: {error}</Alert>;
    }
    const handleImageNav = (tweet, index) => {
        navigate(`/tweet/${tweet.id}/images/${index}`);
    }

    const handleLike = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/like/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweet(tweet => ({ ...tweet, isLiked: true, likes: tweet.likes + 1 }))

        } catch (error) {
            console.log(error);
        }
    };

    const handleCommentLike = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/like_comment/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isLiked: true, likes: comment.likes + 1 } : comment));
       
        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlike = async (tweetId,likeId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweet(tweet => ({ ...tweet, isLiked: false, likes: tweet.likes - 1 }))

        } catch (error) {
            console.log(error);
        }
    };

    const handleUnlikeComment = async (commentId, likeId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unlike/${likeId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isLiked: false, likes: comment.likes - 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweet(tweet => ({ ...tweet, isRetweeted: true, retweets: tweet.retweets + 1 }))

        } catch (error) {
            console.log(error);
        }
    };
    const handleRetweetComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/retweet_comment/${commentId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isRetweeted: true, retweets: comment.retweets + 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweet = async (tweet, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            console.log("retweet: ", retweetId);
            await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setTweet(tweet => ({ ...tweet, isRetweeted: false, retweets: tweet.retweets - 1 }))

        } catch (error) {
            console.log(error);
        }
    };

    const handleUnretweetComment = async (commentId, retweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            await axiosInstance.delete(`${apiUrl}/tweets/unretweet/${retweetId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true,
                data: { comment_id: commentId }
            });
            setComments(prevTweets => prevTweets.map(comment => comment.id === commentId ? { ...comment, isRetweeted: false, retweets: comment.retweets - 1 } : comment));

        } catch (error) {
            console.log(error);
        }
    };
    


    return (
        <div>
            <Button variant="secondary"  onClick={() => navigate("/")}>
                <img src={back} alt="Back" width={"20px"} />
            </Button>
            <Container fluid>
                <Row>
                    <Col md={8} style={{ height: "100vh",overflow: "hidden", borderRight: "1px solid black",  }}>
                    {console.log(images)}
                        <Carousel interval={null} activeIndex={activeIndex} onSelect={handleSelect} style={{justifyContent: 'center',}}>
                            {images.map((image, index) => {
                                if(image.endsWith('.mp4')){
                                    let duration_index = 0
                                    return (
                                        <Carousel.Item key={index} style={{ padding: "5%", justifyContent: 'center', height:'100%' }}>
                                            <div style={{ width: '100%', height: '50%', position:'relative',zIndex:1}} >
                                            
                                            <VideoPlayer
                                                key={index}
                                                duration={tweet.duration[duration_index]}
                                                video_info={tweet.video_info[duration_index++]}
                                                style={{
                                                    objectFit: "cover",
                                                    width: `100%`,
                                                    height: `70vh`,
                                                    position:'relative',
                                                    zIndex:2
                                                }} />
                                            </div>

                                        </Carousel.Item>
                                    )
                                } else{
                                    return (
                                        <Carousel.Item key={index} style={{ padding: "5%", justifyContent: 'center', height:'100%' }}>
                                            <div style={{ width: '100%', height: '50%', position:'relative',zIndex:1}} >

                                                <img src={image} alt={`Slide ${index}`} style={{ width: '100vh', height: '70vh',objectFit: "cover", }} />
                                            </div>
                                        </Carousel.Item>
                                    )
                                
                                }
                                
                        })}
                        </Carousel>
                        {/* {tweetButtons(tweet)} */}
                        <TweetButtons tweet={tweet} handleLike={handleLike} handleUnlike={handleUnlike} handleRetweet={handleRetweet} handleUnretweet={handleUnretweet} />
                    </Col>
                    <Col md={4} style={{ height: "100vh", overflow: "auto" }}>
                        {tweet && (
                            <Card key={tweetId}>
                                <Card.Body>
                                    <Container fluid>
                                        <Row>
                                            <Col xs={12}>
                                                <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                                    {tweet.user_id} @{tweet.username}
                                                </Card.Title>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Card.Text>
                                                {tweet.content}
                                            </Card.Text>
                                        </Row>
                                        {/* {tweetButtons(tweet)} */}
                                        <TweetButtons tweet={tweet} handleLike={handleLike} handleUnlike={handleUnlike} handleRetweet={handleRetweet} handleUnretweet={handleUnretweet} />

                                        <Row>
                                            <Card.Subtitle className="text-muted">
                                                Created at: {new Date(tweet.created_at).toLocaleString()}
                                            </Card.Subtitle>
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>
                        )}
                        <h5>Comments</h5>
                    {Array.isArray(comments) && comments.length > 0 ? (
                        comments.map(comment => (
                            <Card key={comment.id} className="mb-3 comment-card" onClick={() => navigate(`/tweet/comment/${comment.id}`)}>
                                <Card.Body>
                                    <Card.Title>{comment.user_id}</Card.Title>
                                    <Card.Text>{comment.content}</Card.Text>
                                    
                                    <Row>
                                        {comment.image_urls && (
                                            <div className="image-grid" data-count={comment.image_urls.length}>
                                            {comment.image_urls.map((commentImage, index) => (
                                                <img key={index} src={commentsImages[index]} alt="tweet image" className="grid-image" 
                                                onClick={(e) => {e.stopPropagation(); console.log(`selected image ${index}`); handleImageNav(comment, index)}}
                                                />
                                            ))}
                                            </div>
                                        )}
                                    </Row>
                                    <Card.Subtitle className="text-muted">
                                        Created at: {new Date(comment.created_at).toLocaleString()}
                                    </Card.Subtitle>

                                    <CommentButtons comment={comment} handleCommentLike={handleCommentLike} handleUnlikeComment={handleUnlikeComment} handleRetweetComment={handleRetweetComment} handleUnretweetComment={handleUnretweetComment} />
                                    
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p>No comments available.</p>
                    )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ImageViewer;
