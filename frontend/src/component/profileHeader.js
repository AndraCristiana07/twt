import { Card, Button, Container, Row, Col, Dropdown } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import back from "../assets/back-arrow.svg";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../interceptor/axiosInstance";
import "../css/home.css";
import default_profile from "../assets/default_profile.png"
import default_header from "../assets/default_header.jpg"

import { EditProfile } from "./modals/editProfile";

export const ProfileHeader = ({tweetsNumber, username, profileImageURL, headerImageURL}) => {
    const {userId} = useParams(); 
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const navigate = useNavigate();
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [imageProfile,setImageProfile] = useState(null);
    const [imageHeader, setImageHeader] = useState(null);
    const [currUserId, setcurrUserId] = useState(localStorage.getItem('user_id'));

    const handleOpenDialog = () => {
        setShowEditDialog(true);
    };

    const handleCloseDialog = () => {
        setShowEditDialog(false);
    };

    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;

    useEffect(() => {
        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
        } else {
            fetchFollowers();
            fetchFollowing();
            
            fetchProfileImage();
            fetchHeaderImage();
        }
    }, [userId, profileImageURL, headerImageURL]);

    const fetchProfileImage = async () => {
        if (profileImageURL) {
            const fetchedProfileImage = await imageFetch(profileImageURL);
            setImageProfile(fetchedProfileImage);
        } else {
            setImageProfile(default_profile);
        }
    }

    const fetchHeaderImage = async () => {
        if(headerImageURL){
            const fetchedHeaderImage = await imageFetch(headerImageURL);
            setImageHeader(fetchedHeaderImage);
        } else {
            setImageHeader(default_header);
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

    const fetchFollowers = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/get_followers/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            const followersArray= response.data
            setFollowers(followersArray);

            const isUserFollowing = followersArray.some(follower => (follower.id).toString() === currUserId);
            setIsFollowing(isUserFollowing);
        } catch (error) {
            console.error('Error fetching followers:', error);
        }
    };

    const fetchFollowing = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`${apiUrl}/get_following/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setFollowing(response.data);
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const handleFollow = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/follow/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setIsFollowing(true)
        } catch (error) {
            console.error('Error following user:', error);
        }
    };
    const handleUnfollow = async () => {
        
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await axiosInstance.post(`${apiUrl}/unfollow/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setIsFollowing(false)
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };
    

    const handleImageNav = (userId, name) => {
        navigate(`/image/${userId}/${name}`);
    }

    return (
        <Container fluid style={{justifyContent:'center', alignItems:'center'}}>
            <Row style={{ position: "fixed", backgroundColor: "brown", width: "48.3%", overflow: "auto"}}>
                <Col xs={2}>
                    <img src={back} alt="Back" width={"20px"} onClick={() => navigate(-1)} />
                </Col>
                <Col xs={10}>
                    <h4> {username}</h4>
                </Col>
            </Row>
        
        <Row>
            <Col >
                <div style={{ position: 'relative', width: '100%', height: '20vh', marginTop: '100px' }}>
                    <img
                        src={imageHeader}
                        alt="Header"
                        onClick={(e) => handleImageNav(userId, "header")}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    />
                    <img
                        src={imageProfile}
                        alt="Profile pic"
                        onClick={(e) => handleImageNav(userId, "profile")}
                        style={{
                            position: 'absolute',
                            bottom: '-50px',  
                            left: '20px',  
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            border: '3px solid white', 
                            cursor: 'pointer'
                        }}
                    />
                </div>
            </Col>
        </Row>
            <Row>
            
                <Col >
                {userId === currUserId && (
                    <Button style={{display: "flex" ,marginLeft: "auto", marginRight:'5vw' ,marginTop:"5vh"}} onClick={handleOpenDialog}>Edit profile</Button>
            
                )}
                    <EditProfile show={showEditDialog} handleClose={handleCloseDialog} profileImage={imageProfile} headerImage={imageHeader}/>
                {userId !== currUserId && (
                    <Button className='btn'  style={{display: "flex" ,marginLeft: "auto", marginTop:"5vh"}} onClick={isFollowing ? handleUnfollow : handleFollow}>{isFollowing ? 'Unfollow': 'Follow'}</Button>
                )}
                </Col>
            </Row>
            {/* <Row>
                <Col xs={4}>
                    <h4>{userId}</h4>
                </Col>
            </Row> */}
            <Row>
                <Col xs={4}>
                    <p>@{username}</p>
                </Col>
            </Row>
            <Row>
                <Col xs={4}>
                    <p>Sample bio</p>
                </Col>
            </Row>

            <Row style={{display:'flex', justifyContent:'space-around',}}>
                <Col xs={4} style={{textAlign:'center'}}>
                    <p>Following</p>
                    <p>{following.length} </p>
                </Col>
                <Col xs={4} style={{textAlign:'center'}}>
                    <p>Followers</p>
                    <p>{followers.length} </p>
                </Col>
                <Col xs={4} style={{textAlign:'center'}}>
                    <p>Tweets</p>
                    <p>{tweetsNumber}</p>
                </Col>
            </Row>

        </Container>
    )
}
