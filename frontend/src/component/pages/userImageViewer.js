import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel, Button, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axiosInstance from '../../interceptor/axiosInstance';
import 'bootstrap/dist/css/bootstrap.css';
import "../../css/image-grid.css"
import back from "../../assets/back-arrow.svg";
import default_profile from "../../assets/default_profile.png"
import default_header from "../../assets/default_header.jpg"
import close from "../../assets/close.svg"

export const UserImageViewer = () => {
    const {userId, name} = useParams();
    const [image, setImage] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileImageURL, setProfileImageURL] = useState();
    const [headerImageURL, setHeaderImageURL] = useState();
    const [imageProfile,setImageProfile] = useState(null);
    const [imageHeader, setImageHeader] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL;
    const seaweedUrl = process.env.REACT_APP_SEAWEED_URL;
    const navigate = useNavigate();

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
        } catch (err) {
            // TODO
            console.log(err)
        }
        
    }

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
        return URL.createObjectURL(response.data);
    };

    const fetchProfileImage = async () => {
        console.log("profileImageURL: " + profileImageURL)
        if (profileImageURL) {
            const fetchedProfileImage = await imageFetch(profileImageURL);
            setImageProfile(fetchedProfileImage);
        } else {
            setImageProfile(default_profile);
        }
    }

    const fetchHeaderImage = async () => {
        console.log("headerImageUR: " + headerImageURL)
        if(headerImageURL){
            const fetchedHeaderImage = await imageFetch(headerImageURL);
            setImageHeader(fetchedHeaderImage);
        } else {
            setImageHeader(default_header);
        }
    }

    useEffect(()=> {
        fetchUserInfo(userId)
        if(name === "profile"){
            fetchProfileImage();

        } else if (name == "header") {
            fetchHeaderImage();
        }
    },[userId, profileImageURL, headerImageURL])

    return (
        <><img src={close} alt='close' style={{ width: "5vh", cursor:"pointer" }} onClick={(e) => navigate(-1)} /><Container style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {name === "header" && (
                <div>
                    <img src={imageHeader} style={{ width: "89vh"}} alt='header' />

                </div>

            )}
            {name === "profile" && (
                <div>
                    <img src={imageProfile} style={{ width: "40vh", height: "40vh",  borderRadius: "50%" }} alt='profile' />

                </div>
            )}
        </Container></>
    )
}