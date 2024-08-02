import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Dropdown, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import heart from "../assets/heart.svg";
import heartred from "../assets/heart-red.svg";
import comment from "../assets/comment.svg";
import retweet from "../assets/retweet.svg";
import retweetred from "../assets/retweet-red.svg";
import { Comment } from "./commentPost";
import "../css/tweetCard.css";
import { RetweetTweet } from './RetweetDialog';
import axios from 'axios';
import "../css/image-grid.css"
import { Modal } from 'react-bootstrap';

export const TweetCard = ({ tweet, handleLike, handleUnlike, handleRetweet, handleUnretweet, handleDeleteTweet }) => {
    const navigate = useNavigate();
    const [showPostCommentDialog, setShowPostCommentDialog] = React.useState(false);
    const [showQuoteDialog, setShowQuoteDialog] = React.useState(false);
    const [quoteContent, setQuoteContent] = React.useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

    const handleOpenDialog = (e) => {
        setShowPostCommentDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    };

    const handleOpenQuoteDialog = (e) => {
        setShowQuoteDialog(true);

    }
    const handleCloseQuoteDialog = () => {
        setShowQuoteDialog(false);
    }



    const imageFetch = async (path) => {
        console.log("seaweedUrl" + seaweedUrl)
        const url = `${seaweedUrl}${path}`
        const accessToken = localStorage.getItem('access_token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            responseType: 'blob'
        };
        const response = await axios.get(url, config);
        return URL.createObjectURL(response.data)
    }


    const [images, setImages] = useState([])

    useEffect(() => {
        const f = async () => {
            var images = [];
            for (const url of tweet.image_urls) {
                var img = await imageFetch(url);
                images.push(img);
            }
            setImages(images);

        }
        if (tweet.image_urls != null) {
            f();
        }
    }, []);

    const handleImageNav = (tweet, index) => {

        navigate(`/tweet/${tweet.id}/images/${index}`);
    }

    const tweetheader = (tweet) => {
        return (
            <><Row>
                <Col xs={6}>
                    <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`); }}>
                        {tweet.user_id} @{tweet.username}
                    </Card.Title>
                </Col>
            </Row><Row>
                    <Card.Text>
                        {tweet.content}
                    </Card.Text>
                </Row></>
        )
    }
    const tweetImages = (tweet) => {
        return (
            <Row>
                {tweet.image_urls && (
                    <div className="image-grid" data-count={tweet.image_urls.length}>
                        {tweet.image_urls.map((image, index) => (
                            <img key={index} src={images[index]} alt="tweet image" className="grid-image"
                                onClick={(e) => { e.stopPropagation(); console.log(`selected image ${index}`); handleImageNav(tweet, index) }}
                            />
                        ))}
                    </div>
                )}
            </Row>
        )
    }

    const tweetButtons = (tweet, originalTweet) => {
        return (

            <Row>
                <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={originalTweet.id} />
                <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={originalTweet.id} />

                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                    <img src={comment} alt="Comment" width={"20px"} />
                    <span style={{ color: "black" }} className="ms-1">{originalTweet.comments}</span>
                </Button>

                <Button className="but" onClick={(e) => { e.stopPropagation(); originalTweet.isLiked ? handleUnlike(originalTweet.id, originalTweet.like_id) : handleLike(originalTweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                    <img src={originalTweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                    <span style={{ color: "black" }} className="ms-1">{originalTweet.likes}</span>
                </Button>
                {originalTweet.isRetweeted ? (
                    <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); handleUnretweet(originalTweet.id, tweet.id) }}>
                        <img src={retweetred} alt="Retweet" width={"20px"} />
                        <span style={{ color: "black" }} className="ms-1">{originalTweet.retweets}</span>
                    </Button>
                ) :
                    (
                        <Dropdown onClick={(e) => { e.stopPropagation(); }} id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }}>
                            <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                                <img src={retweet} alt="Retweet" width={"20px"} />
                                <span style={{ color: "black" }} className="ms-1">{originalTweet.retweets}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={(e) => { handleRetweet(originalTweet.id); }}>Retweet</Dropdown.Item>
                                <Dropdown.Item onClick={(e) => { handleOpenQuoteDialog(e); }}>Quote Retweet</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    )}

            </Row>
        )

    }

    return (
        <Card key={tweet.id} className="mb-4 tweet-card" onClick={() => { navigate(`/tweet/${tweet.id}`) }}>
            {tweet.retweet_id !== null && (
                <Card.Body>
                    <Container fluid>
                        <Row>
                            <Col xs={10}>
                                <img src={retweet} alt='Retweet' style={{ width: "2vw" }} />
                                <p>{tweet.username} has retweeted</p>
                            </Col>
                        </Row>
                        {(!tweet.content && !tweet.image_urls) && (
                            <Container fluid>
                                {tweetheader(tweet.original_tweet)}
                                {tweetImages(tweet.original_tweet) && console.log("ff" + tweet.original_tweet.image_urls)}
                                {tweetButtons(tweet, tweet.original_tweet)}
                            </Container>
                        )}
                        {(tweet.content !== "" || tweet.image_urls) && (
                            <div>
                                <Row>
                                    <Col> {tweet.content}
                                    </Col>
                                </Row>
                                <Card>
                                    {tweetheader(tweet.original_tweet)}
                                    {tweetImages(tweet) && console.log(tweet.image_urls)}

                                    <Row>
                                        <Card.Subtitle className="text-muted">
                                            Created at: {new Date(tweet.created_at).toLocaleString()}
                                        </Card.Subtitle>
                                    </Row>

                                </Card>
                                {tweetButtons(tweet.original_tweet, tweet)}
                            </div>
                        )}
                    </Container>
                </Card.Body>

            )}

            {tweet.retweet_id === null && (
                <Card.Body>
                    <Container fluid>
                        {tweetheader(tweet)}
                        {tweetImages(tweet)}
                        <Row>
                            <Card.Subtitle className="text-muted">
                                Created at: {new Date(tweet.created_at).toLocaleString()}
                            </Card.Subtitle>
                        </Row>
                        {tweetButtons(tweet.original_tweet, tweet)}
                    </Container>
                </Card.Body>
            )}

        </Card>
    );
};
