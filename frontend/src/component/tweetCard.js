import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col,Dropdown, DropdownButton } from "react-bootstrap";
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
import { Grid } from '@mui/material';

export const TweetCard = ({ tweet, handleLike, handleUnlike, handleRetweet, handleUnretweet }) => {
    const navigate = useNavigate();
    const [showPostCommentDialog, setShowPostCommentDialog] = React.useState(false);
    const [showQuoteDialog, setShowQuoteDialog] = React.useState(false);
    const [quoteContent, setQuoteContent] = React.useState("");
    const apiUrl = process.env.REACT_APP_API_URL;
    const handleOpenDialog = (e) => {
        e.stopPropagation();
        setShowPostCommentDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostCommentDialog(false);
    };

    const handleOpenQuoteDialog = (e) => {
        e.stopPropagation();
        setShowQuoteDialog(true);
        // setQuoteContent(tweet.content);
    
    }
    const handleCloseQuoteDialog = () => {
        setShowQuoteDialog(false);
    }

    
    const getLikes = (tweet) => tweet.likes;
    const getComments = (tweet) => tweet.comments;
    const getRetweets = (tweet) => tweet.retweets;
    // const test = 'https://api.mywebsite.com/profiles/123/avatar';
    // const options = {
    // headers: {
    //     'Some-Header': '...'
    // }
    // };
    // fetch(test, options)
    // .then(res => res.blob())
    // .then(blob => {
    // imgElement.src = URL.createObjectURL(blob);
    // });

    // const imageFetcher = (url) => {
    //     return new Promise((resolve, reject) => {
    //         const src = `http://localhost:80/${url}`;
    //         const accessToken = localStorage.getItem('access_token');
    //         const options = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${accessToken}`
    //             }
    //         };
    
    //         fetch(src, options)
    //             .then(res => res.blob())
    //             .then(blob => {
    //                 const imgSrc = URL.createObjectURL(blob);
    //                 resolve(imgSrc);
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching image:', error);
    //                 reject(error);
    //             });
    //     });
    // };
    
    const imageFetch = async (path) => {
        const url = `http://192.168.0.190:1234${path}`
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
            // console.log(tweet.id + ' ' + tweet.image_urls)
            for (const url of tweet.image_urls) {
                var img = await imageFetch(url);
                images.push(img);
            }
            setImages(images);
        }
        // console.log(tweet.image_urls) 
        // console.log((tweet.image_urls != null))
        if (tweet.image_urls != null) {
            f();
        }
    }, []);

    return (
        <Card key={tweet.id} className="mb-4 tweet-card" onClick={() => { navigate(`/tweet/${tweet.id}`) }}>
            {tweet.retweet_id !== null && (
                 <Card.Body>
                 <Container fluid>
                    <Row>
                        <Col xs={10}>
                        <img src={retweet} alt='Retweet' style={{width:"2vw"}}/>
                        <p>{tweet.username} has retweeted</p>
                        </Col>
                    </Row>
                    {tweet.content === "" && tweet.image_urls === "" (
                        <Container fluid>
                            <Row>
                                
                                <Col xs={6}>
                                    <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                        {tweet.original_tweet.user_id} @{tweet.original_tweet.username}
                                    </Card.Title>
                                </Col>
                            </Row>
                            <Row>
                                <Card.Text>
                                    {tweet.original_tweet.content}
                                </Card.Text>
                            </Row>
                            <Row>
                            {tweet.original_tweet.image_urls && tweet.original_tweet.image_urls.map((image, index) => (
                                <Grid key={index} xs={6}>
                                <img key={index} src={images[index]} alt="tweet image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />
                                    
                                </Grid>
                                // <img src onerror="fetch(`http://localhost:80/${image}`,{headers: {hello:'World!'}}).then(r=>r.blob()).then(d=> this.src=window.URL.createObjectURL(d));" />

                           ))}
                            </Row>
                           
                            <Row>
                                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                    <img src={comment} alt="Comment" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.comments}</span>
                                </Button>
                                <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.original_tweet.id} />

                                <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.original_tweet.isLiked ? handleUnlike(tweet.original_tweet.id, tweet.original_tweet.like_id) : handleLike(tweet.original_tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                    <img src={tweet.original_tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.likes}</span>
                                </Button>
                                {tweet.original_tweet.isRetweeted ? (
                                     <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation();  handleUnretweet(tweet.original_tweet.id, tweet.id) }}>
                                        <img src={ retweetred } alt="Retweet" width={"20px"} />
                                        <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.retweets}</span>
                                    </Button> 
                                    
                                ):
                                (
                                    <div>

                                        <Dropdown  id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }} >
                                            
                                            <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }} >
                                                <img src={retweet} alt="Retweet" width={"20px"} />
                                                <span style={{ color: "black" }} className="ms-1">{tweet.original_tweet.retweets}</span>
                                        
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={(e) => { e.stopPropagation();  handleRetweet(tweet.original_tweet.id); }}>Retweet</Dropdown.Item>
                                                <Dropdown.Item onClick={(e) => { e.stopPropagation();  handleOpenQuoteDialog();}}>Quote Retweet</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.original_tweet.id} />
                                    </div>

                                )}
                               
                                {/* </Button> */}
                                
                                
                            </Row>
                            {/* <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.original_tweet.id} /> */}
                       
                            
                        </Container>
                    )}
                    {(tweet.content !== "" || tweet.image_urls) && (
                        <div>
                            <Row>
                                <Col> {tweet.content}
                                </Col>
                            </Row>
                            <Card>
                                <Row>
                                    <Col></Col>
                                    <Col xs={6}>
                                        <Card.Title onClick={(e) => { e.stopPropagation(); navigate(`/profile/${tweet.user_id}`) }}>
                                            {tweet.original_tweet.user_id} @{tweet.original_tweet.username}
                                        </Card.Title>
                                    </Col>
                                </Row>
                                {tweet.content && (
                                    <Row>
                                    <Card.Text>
                                        {tweet.original_tweet.content}
                                    </Card.Text>
                                </Row>
                                )}
                                <Row>
                                    {tweet.image_urls && tweet.image_urls.map((image, index) => (
                                        <Grid key={index} xs={6}>
                                            <img key={index} src={images[index]} alt="tweet image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />
                                            
                                        </Grid>
                                    ))}
                                </Row>
                                <Row>
                                    <Card.Subtitle className="text-muted">
                                        Created at: {new Date(tweet.created_at).toLocaleString()}
                                    </Card.Subtitle>
                                </Row>
                                
                            </Card>
                            <Row>
                                <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                                    <img src={comment} alt="Comment" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                                </Button>
                                <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} /> 
                                <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                                    <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                                </Button>
                                {tweet.isRetweeted ? (
                                     <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation();  handleUnretweet(tweet.original_tweet.id, tweet.id) }}>
                                        <img src={ retweetred } alt="Retweet" width={"20px"} />
                                        <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                    </Button> 
                                    
                                ):
                                (
                                    <div>

                                        <Dropdown  id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }} >
                                            
                                            <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }} >
                                                <img src={retweet} alt="Retweet" width={"20px"} />
                                                <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                        
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={(e) => { e.stopPropagation();  handleRetweet(tweet.id); }}>Retweet</Dropdown.Item>
                                                <Dropdown.Item onClick={(e) => { e.stopPropagation();  handleOpenQuoteDialog();}}>Quote Retweet</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} />
                                    </div>

                                )}
                                {/* <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.original_tweet.isRetweeted ? handleUnretweet(tweet.original_tweet.id, tweet.original_tweet.retweet_id) : handleRetweet(tweet.original_tweet.id); }}>
                                   </Button> */}
                                {/* <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} /> */}
                                {/* <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id, tweet.retweet_id) : handleRetweet(tweet.id); }}>
                                    <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                </Button> */}
                            </Row>
                            
                            {/* <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} /> */}
                        
                        </div>

                    )}
                 </Container>
             </Card.Body>
            
            )}
            {/* tweet */}
            {tweet.retweet_id === null && (
            <Card.Body>
                <Container fluid>
                    <Row>
                        <Col xs={6}>
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
                    <Row>
                        {tweet.image_urls && tweet.image_urls.map((image, index) => (
                            <Grid key={index} xs={6}>
                            <img key={index} src={images[index]} alt="tweet image" style={{ maxWidth: '100%', margin: '10px 0', width: '30vw' }} />
                                
                            </Grid>
                        ))}
                    </Row>
                    <Row>
                        <Card.Subtitle className="text-muted">
                            Created at: {new Date(tweet.created_at).toLocaleString()}
                        </Card.Subtitle>
                    </Row>
                    <Row>
                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={handleOpenDialog}>
                            <img src={comment} alt="Comment" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{tweet.comments}</span>
                        </Button>
                        <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} /> 
                        <Button className="but" onClick={(e) => { e.stopPropagation(); tweet.isLiked ? handleUnlike(tweet.id, tweet.like_id) : handleLike(tweet.id); }} style={{ background: "transparent", border: "none", width: "80px" }}>
                            <img src={tweet.isLiked ? heartred : heart} alt="Like" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{tweet.likes}</span>
                        </Button>
                        {tweet.isRetweeted ? (
                            <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation();  handleUnretweet(tweet.id, tweet.delete_retweet_id) }}>
                                <img src={ retweetred } alt="Retweet" width={"20px"} />
                                <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                            </Button> 
                            
                        ):
                        (
                            <div>

                                <Dropdown  id="dropdown-basic-button" className="but" style={{ background: "transparent", border: "none", width: "80px" }} >
                                    
                                    <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }} >
                                        <img src={retweet} alt="Retweet" width={"20px"} />
                                        <span style={{ color: "black" }} className="ms-1">{tweet.retweets}</span>
                                
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={(e) => { e.stopPropagation();  handleRetweet(tweet.id, tweet.original_tweet); }}>Retweet</Dropdown.Item>
                                        <Dropdown.Item onClick={(e) => { e.stopPropagation();  handleOpenQuoteDialog();}}>Quote Retweet</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} />
                            </div>

                        )}
                        {/* <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }} onClick={(e) => { e.stopPropagation(); tweet.isRetweeted ? handleUnretweet(tweet.id, tweet.retweet_id) : handleRetweet(tweet.id); }}>
                            <img src={tweet.isRetweeted ? retweetred : retweet} alt="Retweet" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{getRetweets(tweet)}</span>
                        </Button> */}
                        
                    </Row>
                    {/* <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={tweet.id} /> */}

                    {/* <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={tweet.id} /> */}
                </Container>
            </Card.Body>
            )}

        </Card>
    );
};
