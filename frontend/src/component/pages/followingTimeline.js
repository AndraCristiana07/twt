import React, {useState, useEffect} from "react";
import {Container, Row, Col, Button, Card, Form} from "react-bootstrap";
import "../../css/home.css";
import Menu from "../drawer";
import axiosInstance from "../../interceptor/axiosInstance";
import media from '../../assets/media.svg';
import {TweetCard} from "../tweetCard";
import {useNavigate} from "react-router-dom";
import close_icon from '../../assets/add.svg'
import {Tooltip} from "@mui/material"; // TODO replace with X icon
export const FollowingTimeline = () => {
    const [tweets, setTweets] = useState([]);
    const [page,setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalTweets, setTotalTweets] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        setLoading(true);

        if (localStorage.getItem('access_token') === null) {
            // window.location.href = '/login';
            navigate('/login');
        } else {
            fetchAllTweets();
        }
    }, []);

    const fetchAllTweets = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/tweets/following_timeline/`, 
                {
                    params: {
                        page:page,
                        page_size: pageSize
                    }
                },
                {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            setTweets(response.data.tweets)
            setTotalTweets(response.data.total_tweets)
            setTotalPages(response.data.total_pages)
            console.log("fll imgurl: " + JSON.stringify(response.data.tweets))
            setLoading(false);
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                // window.location.href = '/login';
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

            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
                ...tweet,
                isLiked: true,
                likes: tweet.likes + 1
            } : tweet));

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
                withCredentials: true
            });

            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
                ...tweet,
                isLiked: false,
                likes: tweet.likes - 1
            } : tweet));
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetweet = async (tweetId, originalTweetId) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });

            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
                ...tweet,
                isRetweeted: true,
                retweets: tweet.retweets + 1
            } : tweet));
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
                withCredentials: true
            });

            setTweets(prevTweets => prevTweets.map(tweet => tweet.id === tweetId ? {
                ...tweet,
                isRetweeted: false,
                retweets: tweet.retweets - 1
            } : tweet));
        } catch (error) {
            console.log(error);
        }
    };

    const [content, setContent] = useState("");
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([]);
    const handleTweetPost = async (e) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('access_token');
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append(`images`, files[i]);
            }
            formData.append(`content`, content);

            await axiosInstance.post(
                `${apiUrl}/tweets/post`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                }
            );
            setSuccess("Tweet posted successfully!");
        } catch (error) {
            setError("Failed to post tweet.");
            console.error('Error posting tweet:', error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...previewUrls]);
    };


    return (
        <Container fluid style={{position: "relative"}}>
            <Row>

                <Col xs={3} style={{position: "fixed", height: "100vh", overflow: "auto", borderRight: "1px solid black"}}>
                    <Menu/>
                </Col>
                <Col xs={{span: 6, offset: 3}}>
                    <Container fluid>
                        <Card className="mt-5">
                            <Card.Body>
                                <Form onSubmit={handleTweetPost}>
                                    <Form.Group controlId="formTweet">
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={content}
                                            placeholder="What's happening?"
                                            onChange={(e) => setContent(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Tooltip title="Media">
                                        <div style={{position: "relative", width: '4vw', height: '4vh'}}>
                                            <input
                                                onChange={handleFileChange}
                                                type="file"
                                                title=""
                                                multiple
                                                style={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    opacity: 0,
                                                    zIndex: 2,
                                                    cursor: 'pointer'
                                                }}/>
                                            <img src={media} alt="media" title="media content"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'absolute',
                                                    zIndex: 1
                                                }}/>
                                        </div>
                                    </Tooltip>

                                    <div style={{display: "flex", justifyContent: "end"}}>
                                        <Button variant="primary" type="submit">
                                            Tweet
                                        </Button>
                                    </div>
                                    {error && <p style={{color: 'red'}}>{error}</p>}
                                    {success && <p style={{color: 'green'}}>{success}</p>}
                                </Form>
                                <div>
                                    {previews.map((preview, index) => (
                                        // TODO
                                        <div
                                            style={{display: "inline-block"}}
                                            onMouseOver={event => {
                                                document.getElementById(`${index}-img`).style.opacity = 100
                                            }}
                                            onMouseOut={event => {
                                                document.getElementById(`${index}-img`).style.opacity = 0
                                            }}>
                                            <img key={`${index}-img`} id={`${index}-img`} src={close_icon} onClick={() => {
                                                setPreviews(previews.filter((value, index1) => {
                                                    return index1 !== index
                                                }));
                                            }} style={{
                                                transform: "rotateY(0deg) rotate(45deg)",
                                                position: 'absolute',
                                                zIndex: 2,
                                                width: '25px',
                                                height: '25px',
                                                margin: '10px',
                                                opacity: 0
                                            }} alt={"X"}></img>
                                            <img key={`${index}-img`} src={preview} alt="preview"
                                                style={{width: '100px', height: '100px', margin: '10px'}}/>
                                        </div>
                                    ))}
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
                    <Container className="container mt-5 text-center">
                        {loading ? <p key="loading_tweets"> Loading... </p> : (
                            <div>
                                {Array.isArray(tweets) && tweets.length > 0 ? (
                                    tweets.map(tweet => (
                                        <TweetCard
                                            key={tweet.id}
                                            originalTweetImg={tweet.original_tweet}
                                            tweet={tweet}
                                            handleLike={handleLike}
                                            handleUnlike={handleUnlike}
                                            handleRetweet={handleRetweet}
                                            handleUnretweet={handleUnretweet}
                                        />
                                    ))
                                ) : (
                                    <p>No tweets available.</p>
                                )}
                                <Row className="pagination-controls">
                                    <Col>
                                        <Button disabled={page <= 1} onClick={()=> setPage(page-1)}> Previous</Button>

                                    </Col>
                                    <Col>
                                    <p>{page}</p>

                                    </Col>
                                    <Col>
                                    <Button disabled={page >= totalPages} onClick={()=> setPage(page+1)}>Next</Button>
                                    
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Container>
                </Col>
                <Col xs={{span:3, offset:9}}
                     style={{position: "fixed", height: "100vh", overflow: "auto", borderLeft: "1px solid black"}}>
                        
                </Col>
            </Row>

        </Container>
    );
};
