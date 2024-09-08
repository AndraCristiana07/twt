import React, { useEffect, useState } from 'react';
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

import { Grid } from "@mui/material";
import { DeleteDialog } from './modals/deleteTweetDialog';

export const ImagesGrid = ({ tweet, images }) => {
    const navigate = useNavigate();

    let gridSize = [150, 300] // w&h

    const handleImageNav = (tweet, index) => {
        navigate(`/tweet/${tweet.id}/images/${index}`);
    }

  
    if (images.length === 1) {
        return <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
            <img key={0} src={images[0]} alt="tweet image" className="grid-image"
                onClick={(e) => {
                    e.stopPropagation();
                    handleImageNav(tweet, 0)
                }}
                style={{
                    objectFit: "cover",
                    width: `100%`,
                    height: `100%`
                }}
            />
        </div>
    }
    if (images.length === 2) {
        return <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
            <img key={0} src={images[0]} alt="tweet image" className="grid-image"
                onClick={(e) => {
                    e.stopPropagation();
                    handleImageNav(tweet, 0)
                }}
                style={{
                    objectFit: "cover",
                    width: `50%`,
                    height: `100%`
                }}
            />
            <img key={1} src={images[1]} alt="tweet image" className="grid-image"
                onClick={(e) => {
                    e.stopPropagation();
                    handleImageNav(tweet, 1)
                }}
                style={{
                    objectFit: "cover",
                    width: `50%`,
                    height: `100%`
                }}
            />
        </div>
    }
    if (images.length === 3) {
        return <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
            <div style={{
                width: `50%`,
                height: `100%`
            }}>
                <img key={0} src={images[0]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 0)
                    }} 
                    style={{
                        objectFit: "cover",
                        width: `100%`,
                        height: `100%`
                    }}
                />
            </div>
            <div style={{
                display: 'flex', flexDirection: 'column',
                width: `50%`,
                height: `100%`
            }}>
                <img key={1} src={images[1]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 1)
                    }} 
                    style={{
                        objectFit: "cover",
                        width: `100%`,
                        height: `50%`
                    }}
                />
                <img key={2} src={images[2]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 2)
                    }} 
                    style={{
                        objectFit: "cover",
                        width: `100%`,
                        height: `50%`
                    }}
                />
            </div>
        </div>
    }
    if (images.length === 4) {
        return <div id='images-grid' style={{  padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
            <div style={{
                width: `100%`,
                height: `50%`,
                display: 'flex',
                flexDirection: 'row'
            }}>
                <img key={0} src={images[0]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 0)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
                <img key={1} src={images[1]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 1)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
            </div>
            <div style={{
                display: 'flex', flexDirection: 'row',
                width: `100%`,
                height: `50%`
            }}>
                <img key={2} src={images[2]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 2)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
                <img key={3} src={images[3]} alt="tweet image" className="grid-image"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleImageNav(tweet, 3)
                    }}
                    style={{
                        objectFit: "cover",
                        width: `50%`,
                        height: `100%`
                    }}
                />
            </div>
        </div>
    }


    // return (<div>
    //     {/*<h1>WIP</h1>*/}
    //     <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
    //         {images.map((image, index) => (
    //             //     <div key={index}>


    //             //    {handleExtension(image,index)}
    //             //    </div>

    //             <img key={index} src={image} alt="tweet image" className="grid-image"
    //                 onClick={(e) => {
    //                     e.stopPropagation();
    //                     handleImageNav(tweet, index)
    //                 }} // TODO
    //                 style={{ width: `${imageSize[0]}px`, height: `${imageSize[1]}px`, objectFit: "cover" }}
    //             />


    //         ))}
    //     </div>
    // </div>)
}



// export const ImagesGrid = ({ tweet, media }) => {
//     const navigate = useNavigate();

//     let gridSize = [150, 300] // w&h
//     const handleImageNav = (tweet, index) => {
//         navigate(`/tweet/${tweet.id}/images/${index}`);
//     };

//     const renderMedia = (url, index) => {
//         const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') 
//         const isImage =  url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') 
//         if (isVideo) {
//             return (

//             <video
//                 key={index}
//                 controls
//                 onClick={(e)=> {e.stopPropagation(); handleImageNav(tweet,index)}}
//                 style={{
//                     objectFit: "cover",
//                     width: '100%',
//                     height: '100%'
//                 }}>
//                      <source src={url} type="video/mp4" />
                       
//                 </video>
//             )

//         } else if(isImage) {
//             return (
//                 <img
//                     key={index}
//                     src={url}
//                     alt="tweet media"
//                     className="grid-media"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         handleImageNav(tweet, index);
//                     }}
//                     style={{
//                         objectFit: "cover",
//                         width: '100%',
//                         height: '100%'
//                     }}
//                 />
//             )
//         }
//     };

    
//     if (media.length === 1) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", justifyContent: 'center' }}>
//                 {renderMedia(media[0], 0)}
//             </div>
//         );
//     }

//     if (media.length === 2) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", justifyContent: 'center' }}>
//                 {renderMedia(media[0], 0)}
//                 {renderMedia(media[1], 1)}
//             </div>
//         );
//     }

//     if (media.length === 3) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
//                 <div style={{ width: '50%', height: '100%' }}>
//                     {renderMedia(media[0], 0)}
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'column', width: '50%', height: '100%' }}>
//                     {renderMedia(media[1], 1)}
//                     {renderMedia(media[2], 2)}
//                 </div>
//             </div>
//         );
//     }

//     if (media.length === 4) {
//         return (
//             <div id="images-grid" style={{ padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
//                 <div style={{ width: '100%', height: '50%', display: 'flex', flexDirection: 'row' }}>
//                     {renderMedia(media[0], 0)}
//                     {renderMedia(media[1], 1)}
//                 </div>
//                 <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '50%' }}>
//                     {renderMedia(media[2], 2)}
//                     {renderMedia(media[3], 3)}
//                 </div>
//             </div>
//         );
//     }

//     return null;

// };






// export const ImagesGrid = ({ tweet, images }) => {
//     const navigate = useNavigate();

//     let gridSize = [150, 300] // w&h
//     const handleImageNav = (tweet, index) => {
//         navigate(`/tweet/${tweet.id}/images/${index}`);
//     };

//     const renderMedia = (item, index) => {
//         const fileExtension = item.split('.').pop().toLowerCase();
        
//         if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
//             return (
//                 <img
//                     key={index}
//                     src={item}
//                     alt={`tweet media ${index + 1}`}
//                     className="grid-image"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         handleImageNav(tweet, index);
//                     }}
//                     style={{ objectFit: "cover", width: '100%', height: '100%' }}
//                 />
//             );
//         } else if (['mp4', 'webm'].includes(fileExtension)) {
//             return (
//                 <video
//                     key={index}
//                     controls
//                     className="grid-video"
//                     style={{ objectFit: "cover", width: '100%', height: '100%' }}
//                 >
//                     <source src={item} type={`video/${fileExtension}`} />
//                 </video>
//             );
//         } else {
//             return null;
//         }
//     };

//     const renderGrid = () => {
//         if (images.length === 1) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
//                     {renderMedia(images[0], 0)}
//                 </div>
//             );
//         }
//         if (images.length === 2) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", justifyContent: 'center' }}>
//                     <div style={{ width: `50%`, height: `100%` }}>
//                         {renderMedia(images[0], 0)}
//                     </div>
//                     <div style={{ width: `50%`, height: `100%` }}>
//                         {renderMedia(images[1], 1)}
//                     </div>
//                 </div>
//             );
//         } 
//         if (images.length === 3) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "row", justifyContent: 'center' }}>
//                     <div style={{ width: `50%`, height: `100%` }}>
//                         {renderMedia(images[0], 0)}
//                     </div>
//                     <div style={{ display: 'flex', flexDirection: 'column', width: `50%`, height: `100%` }}>
//                         <div style={{ width: `100%`, height: `50%` }}>
//                             {renderMedia(images[1], 1)}
//                         </div>
//                         <div style={{ width: `100%`, height: `50%` }}>
//                             {renderMedia(images[2], 2)}
//                         </div>
//                     </div>
//                 </div>
//             );
//         } 
//         if (images.length === 4) {
//             return (
//                 <div id='images-grid' style={{ padding: "5%", display: 'flex', flexDirection: "column", justifyContent: 'center' }}>
//                     <div style={{ width: `100%`, height: `50%`, display: 'flex', flexDirection: 'row' }}>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[0], 0)}
//                         </div>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[1], 1)}
//                         </div>
//                     </div>
//                     <div style={{ width: `100%`, height: `50%`, display: 'flex', flexDirection: 'row' }}>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[2], 2)}
//                         </div>
//                         <div style={{ width: `50%`, height: `100%` }}>
//                             {renderMedia(images[3], 3)}
//                         </div>
//                     </div>
//                 </div>
//             );
//         }
//     };

//     return renderGrid();
// };

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
    useEffect(() => {
        const fetchImages = async () => {
            let images = [];
            let ogImages = [];

            if (tweet.image_urls && tweet.image_urls.length > 0) {
                const fetchedImages = await Promise.all(
                    tweet.image_urls.map(async (url) => await imageFetch(url))
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


            if (tweet.original_tweet && tweet.original_tweet.image_urls) {
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
        };
        fetchImages();
        fetchUserInfo(tweet.user_id)
        fetchProfileImage();

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
                            } }>
                                <img src={imageProfile} alt="icon" style={{ borderRadius: "50%", width: "1.5em", height: "1.5em" }} />
                                @{tweet.username}
                            </Card.Title>
                        </Col>
                        {tweet.user_id === currUserId && (
                            <Col>
                                {tweet.retweet_id === null &&
                                    <img src={deleteImg} style={{ width: "30px", display: "flex", marginLeft: "auto" }} alt="Delete" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(tweet.id); } } />}
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

    const tweetImages = (tweet, images) => {
        return (
            <div style={{ display: "flex", justifyContent: 'center' }}>
                {images.length > 0 && (<ImagesGrid tweet={tweet} images={images} />)}
            </div>
            
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
        <Card key={tweet.id}  className="mb-4 tweet-card"  onClick={() => {
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
                                {tweetHeader(tweet.original_tweet)}
                                {tweetImages(tweet.original_tweet, images)}
                                {tweetButtons(tweet, tweet.original_tweet)}
                            </Container>
                        )}
                        {(tweet.content || tweet.image_urls) && (
                            <div>
                                <Row>
                                    <Col>{tweet.content}</Col>
                                </Row>
                                {tweetImages(tweet, images)}
                                <Card>
                                    {tweetHeader(tweet.original_tweet)}
                                    {tweetImages(tweet.original_tweet, ogTweetImages)}
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
                    {tweetImages(tweet, images)}
                    {tweetDate(tweet)}
                    {tweetButtons(tweet, tweet)}
                </div>
                // </Card.Body>
            )}
        </Card>
    );
};
