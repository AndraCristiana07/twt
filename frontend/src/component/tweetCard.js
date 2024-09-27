import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Container, Row, Col, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import heart_icon from "../assets/heart.svg";
import heart_icon_red from "../assets/heart-red.svg";
import comment_icon from "../assets/comment.svg";
import retweet_icon from "../assets/retweet.svg";
import retweet_icon_red from "../assets/retweet-red.svg";
import { Comment } from "./modals/commentPost";
import "../css/tweetCard.css";
import { RetweetTweet } from './modals/RetweetDialog';
import axiosInstance from '../interceptor/axiosInstance';
import "../css/image-grid.css"
import default_profile from "../assets/default_profile.png"
import deleteImg from '../assets/delete.svg';

import { duration, Grid } from "@mui/material";
import { DeleteDialog } from './modals/deleteTweetDialog';
import { VideoPlayer } from './videoPlayer';
import { ImagesGrid } from './imageGrid';


export const TweetCard = ({
    tweet,
    originalTweetImg,
    handleLike,
    handleUnlike,
    handleRetweet,
    handleUnretweet,

}) => {
    const navigate = useNavigate();
    const [showPostCommentDialog, setShowPostCommentDialog] = React.useState(false);
    const [showQuoteDialog, setShowQuoteDialog] = React.useState(false);
    const [quoteContent, setQuoteContent] = React.useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([])
    const [videoInfo, setVideoInfo] = useState();
    const [ogTweetImages, setOgTweetImages] = useState([]);
    const [imageProfile, setImageProfile] = useState(null);
    const [profileImageURL, setProfileImageURL] = useState();
    const [currUserId, setcurrUserId] = useState(localStorage.getItem('user_id'));
    const [tweetIdToDelete, setTweetIdToDelete] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

    const handleOpenDeleteDialog = (tweetId) => {
        setTweetIdToDelete(tweetId);
        setShowDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setShowDeleteDialog(false);
        setTweetIdToDelete(null);
    };

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
        return URL.createObjectURL(response.data);
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
            setProfileImageURL(fetchedProfileImage);

            // fetchProfileImage(profileImage);
        } catch (err) {
            // TODO
        }
    }

    // console.log("time duration " + tweet.duration)
    // var time = tweet.duration.split(":")
    // console.log("time duration days " + time[1].replace(/[\[\]']/g, ''))
    // console.log("timeee " + time[2].split('.')[1].replace('\]', "").replace('\'', ""))
    // var sec = parseInt(time[0].replace('\[', "").replace('\'', "") )* 360 + parseInt(time[1]) * 60 + parseInt(time[2].split('.')[0]) + parseInt(time[2].split('.')[1]) * 0.001 
    // console.log("SECS "  + typeof(sec) + sec)
    // useEffect(() => {
    //     const f = async () => {
    //         const fetchedImages = await Promise.all(
    //             tweet.image_urls.map(async (url) => await imageFetch(url))
    //         );
    //         console.log("???" + JSON.stringify(tweet))
    //         setImages(fetchedImages);


    //         // var images = [];
    //         // const imgUrls = tweet.retweet_id ? tweet.original_tweet.image_urls : tweet.image_urls;
    //         //      for (const url of imgUrls) {
    //         //         var img = await imageFetch(url);
    //         //         images.push(img);
    //         //     }
    //         //     setImages(images)

    //         // if(tweet.image_urls){
    //         //     for (const url of tweet.image_urls) {
    //         //         var img = await imageFetch(url);
    //         //         images.push(img);
    //         //     }
    //         //     setImages(images);
    //         // }



    //         // if(tweet.original_tweet && tweet.original_tweet.image_urls){
    //         //     for (const url of tweet.original_tweet.image_urls) {
    //         //         var img = await imageFetch(url);
    //         //         images.push(img);
    //         //     }
    //         //     setImages(images);
    //         // }


    //     };
    //     // if(tweet.image_urls || (tweet.retweet_id && tweet.original_tweet.image_urls)){
    //     //     f();

    //     // }
    //     if (tweet.image_urls) {
    //         f();
    //     }

    //     // const g = async () => {
    //     //     const fetchedOgImages = await Promise.all(
    //     //         tweet.original_tweet.image_urls.map(async (url) => await imageFetch(url))
    //     //     );
    //     //     setOgTweetImages(fetchedOgImages);
    //     // };

    //     // console.log("BBBBB: " + ogTweetImages)
    //     // if (tweet.original_tweet && tweet.original_tweet.image_urls) {
    //     //     g();
    //     // }
    // }, [tweet]);

    // useEffect(() => {
    //     const f = async () => {
    //         const fetchedImages = await Promise.all(
    //             (tweet.image_urls || []).map(async (url) => await imageFetch(url))
    //         );

    //         if (tweet.original_tweet && tweet.original_tweet.image_urls) {
    //             const fetchedOriginalImages = await Promise.all(
    //                 tweet.original_tweet.image_urls.map(async (url) => await imageFetch(url))
    //             );
    //             setImages([...fetchedImages, ...fetchedOriginalImages]);
    //         } else {
    //             setImages(fetchedImages);
    //         }
    //     };

    //     if (tweet.image_urls || (tweet.original_tweet && tweet.original_tweet.image_urls)) {
    //         f();
    //     }  
    // }, [tweet]);

    const isVideo = (url) => url.endsWith('.mp4') || url.endsWith('.webm')
    const isImage = (url) => url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.jpeg')

    useEffect(() => {
        const mediaUrl = tweet.image_urls
        
        
        const fetchImages = async () => {
            let images = [];
            let ogImages = [];
            let videos = [];
            if(mediaUrl){
                const imageArray = mediaUrl.filter((fileUrl) => isImage(fileUrl))
        

                if (imageArray && imageArray.length > 0 && mediaUrl) {
                    const fetchedImages = await Promise.all(
                        imageArray.map(async (url) => await imageFetch(url))
                    );
                    images = images.concat(fetchedImages)
                    // if (tweet.original_tweet && tweet.original_tweet.image_urls) {
                    //     const fetchedOgImages = await Promise.all(
                    //         tweet.original_tweet.image_urls.map(async (url) => await imageFetch(url))
                    //     );
                    //     ogImages = ogImages.concat(fetchedOgImages)
                    // }

                    setImages(images)
                    // setOgTweetImages(ogImages);
                }
            }


            if (tweet.original_tweet){
                const originalTweetMediaUrl = tweet.original_tweet.image_urls 

                if(originalTweetMediaUrl){
        
                    const originalTweetimageArray = originalTweetMediaUrl.filter((fileUrl) => isImage(fileUrl))
        
            
                    
                    if ( originalTweetMediaUrl && originalTweetimageArray) {
                        const fetchedOgImages = await Promise.all(
                            tweet.original_tweet.image_urls.map(async (url) => await imageFetch(url))
                        );
                        // if (tweet.image_urls && tweet.image_urls.length > 0) {
                        //     const fetchedImages = await Promise.all(
                        //         tweet.image_urls.map(async (url) => await imageFetch(url))
                        //     );
                        //     images = images.concat(fetchedImages)
                        //     setImages(images)
                        // }
                        ogImages = ogImages.concat(fetchedOgImages)
                        setOgTweetImages(ogImages);
                    }
                }
            }

        };
        fetchImages();
        fetchUserInfo(tweet.user_id)
        fetchProfileImage();
        setVideoInfo(tweet.video_info)
        // console.log(videoInfo)

    }, [tweet, profileImageURL])

    const fetchProfileImage = async () => {
        if (profileImageURL) {
            const fetchedprofileImageURL = await imageFetch(profileImageURL);
            setImageProfile(fetchedprofileImageURL);
        } else {
            setImageProfile(default_profile);
        }
    }
    const tweetHeader = (tweet) => {
        return (
            <>
                {tweet && (

                    <><Row>
                        <Col xs={2}>
                            <Card.Title onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${tweet.user_id}`);
                            }}>
                                <img src={imageProfile} alt="icon" style={{ borderRadius: "50%", width: "1.5em", height: "1.5em" }} />
                                @{tweet.username}
                            </Card.Title>
                        </Col>
                        {tweet.user_id === currUserId && (
                            <Col>
                                {tweet.retweet_id === null &&
                                    <img src={deleteImg} style={{ width: "30px", display: "flex", marginLeft: "auto" }} alt="Delete" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(tweet.id); }} />}
                            
                            </Col>
                        )}
                    </Row><Row>
                            <Card.Text>
                                {tweet.content}
                            </Card.Text>
                            <DeleteDialog tweetId={tweet.id} show={showDeleteDialog} handleClose={handleCloseDeleteDialog} />
                        </Row></>
                )}
                {!tweet && (
                    <Row> </Row>
                )}

            </>
        )
    }

    const tweetGrid = (tweet, images) => {

        let duration_index = 0
        // {
        //     "id": "d24757ba-6df1-4831-b86d-b3ece98cad09",
        //     "user_id": "1",
        //     "content": "",
        //     "created_at": "2024-09-26T15:19:30.777000",
        //     "retweet_id": "b8ecd1b8-3617-4b77-b190-286c648f4690",
        //     "image_urls": null,
        //     "duration": null,
        //     "likes": 1,
        //     "comments": 0,
        //     "retweets": 1,
        //     "username": "andra",
        //     "profile_image": "",
        //     "isLiked": false,
        //     "isRetweeted": false,
        //     "like_id": null,
        //     "delete_retweet_id": null,
        //     "video_info": null
        // },
        return (
            <><div style={{ display: "flex", justifyContent: 'center' }}>
                {images.length > 0 && (<ImagesGrid tweet={tweet} images={images} />)}
            </div>
                <div style={{ display: "flex", justifyContent: 'center' }}>
                    {tweet.image_urls && tweet.image_urls.map((media, index) => {
                        if (media.endsWith('.mp4')) {
                            return <VideoPlayer
                                key={index}
                                duration={tweet.duration[duration_index]}
                                video_info={tweet.video_info[duration_index++]} />
                        }
                    })}
                    {/* { videoArray.map((video, index) => (
                    <div key={index}> */}
                    {/* </div>
            ))} */}
                    {/* {videos.length > 0 && (<VideoPlayer tweet={tweet} videos={videos} />)} */}
                </div></>
        )
    }

    const tweetButtons = (tweet, originalTweet) => {
        return (
            <>
                {tweet && (

                    <Row onClick={(e) => e.stopPropagation()}>
                        <Comment show={showPostCommentDialog} handleClose={handleCloseDialog} tweetId={originalTweet.id} />
                        <RetweetTweet show={showQuoteDialog} handleClose={handleCloseQuoteDialog} tweetId={originalTweet.id} />

                        <Button className="but" style={{ background: "transparent", border: "none", width: "80px" }}
                            onClick={handleOpenDialog}>
                            <img src={comment_icon} alt="Comment" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{originalTweet.comments}</span>
                        </Button>

                        <Button className="but" onClick={(e) => {
                            e.stopPropagation();
                            originalTweet.isLiked ? handleUnlike(originalTweet.id, originalTweet.like_id) : handleLike(originalTweet.id);
                        }} style={{ background: "transparent", border: "none", width: "80px" }}>
                            <img src={originalTweet.isLiked ? heart_icon_red : heart_icon} alt="Like" width={"20px"} />
                            <span style={{ color: "black" }} className="ms-1">{originalTweet.likes}</span>
                        </Button>
                        {originalTweet.isRetweeted ? (
                            // <Button className="but" style={{background: "transparent", border: "none", width: "80px"}}
                            //         onClick={(e) => {
                            //             e.stopPropagation();
                            //             handleUnretweet(originalTweet.id, originalTweet.delete_retweet_id)
                            //         }}>
                            //     <img src={retweet_icon_red} alt="Retweet" width={"20px"}/>
                            //     <span style={{color: "black"}} className="ms-1">{originalTweet.retweets}</span>
                            // </Button>
                            <Dropdown onClick={(e) => {
                                e.stopPropagation();
                            }} id="dropdown-basic-button" className="but"
                                style={{ background: "transparent", border: "none", width: "80px" }}>
                                <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                                    <img src={retweet_icon_red} alt="Retweet" width={"20px"} />
                                    <span style={{ color: "black" }} className="ms-1">{originalTweet.retweets}</span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={(e) => {
                                        handleUnretweet(originalTweet.id, originalTweet.delete_retweet_id)
                                    }}>Delete Retweet</Dropdown.Item>
                                    <Dropdown.Item onClick={(e) => {
                                        handleOpenQuoteDialog(e);
                                    }}>Quote Retweet</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) :
                            (
                                <Dropdown onClick={(e) => {
                                    e.stopPropagation();
                                }} id="dropdown-basic-button" className="but"
                                    style={{ background: "transparent", border: "none", width: "80px" }}>
                                    <Dropdown.Toggle style={{ background: "transparent", border: "none", width: "80px" }}>
                                        <img src={retweet_icon} alt="Retweet" width={"20px"} />
                                        <span style={{ color: "black" }} className="ms-1">{originalTweet.retweets}</span>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={(e) => {
                                            handleRetweet(originalTweet.id);
                                        }}>Retweet</Dropdown.Item>
                                        <Dropdown.Item onClick={(e) => {
                                            handleOpenQuoteDialog(e);
                                        }}>Quote Retweet</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
                    </Row>
                )}
            </>


        )
    }

    const tweetDate = (tweet) => {
        return (
            <>
                {tweet && (


                    <Row>
                        <Card.Subtitle className="text-muted">
                            Created at: {new Date(tweet.created_at).toLocaleString()}
                        </Card.Subtitle>
                    </Row>
                )}
            </>
        )
    }


    return (
        <Card key={tweet.id} className="mb-4 tweet-card" onClick={() => {
            navigate(`/tweet/${tweet.id}`)
        }}>
            {tweet.retweet_id !== null && (
                <Card.Body>
                    <Container fluid>
                        <Row>
                            <Col xs={10}>
                                <img src={retweet_icon} alt='Retweet' style={{ width: "2vw" }} />
                                <p>{tweet.username} has retweeted</p>
                            </Col>
                        </Row>
                        {!tweet.content && !tweet.image_urls && (
                            <Container fluid>
                                {console.log("tweet id for retweet" + tweet.id)}
                                {tweet.original_tweet.id === null && tweet.retweet_id &&
                                    <img src={deleteImg} style={{ width: "30px", display: "flex", marginLeft: "auto" }} alt="Delete" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(tweet.id); }} />}

                                {tweetHeader(tweet.original_tweet)}
                                
                                {tweetGrid(tweet.original_tweet, images, videos)}
                                {tweetButtons(tweet, tweet.original_tweet)}
                            </Container>
                        )}
                        {(tweet.content || tweet.image_urls) && (
                            <div>
                                <Row>
                                    <Col>{tweet.content}</Col>
                                </Row>
                                {tweetGrid(tweet, images, videos)}
                                <Card>
                                    {tweetHeader(tweet.original_tweet)}
                                
                                    {/* TODO: change videos for ogtweet */}
                                    {tweetGrid(tweet.original_tweet, ogTweetImages, videos)}
                                    {tweetDate(tweet)}
                                </Card>
                                {tweet.original_tweet && tweetButtons(tweet.original_tweet, tweet)}
                            </div>
                        )}
                    </Container>
                </Card.Body>
            )}
            {tweet.retweet_id === null && (
                // <Card.Body>
                <div>
                    {tweetHeader(tweet)}
                    {tweetGrid(tweet, images, videos)}
                    {tweetDate(tweet)}
                    {tweetButtons(tweet, tweet)}
                </div>
                // </Card.Body>
            )}
        </Card>
    );
};
