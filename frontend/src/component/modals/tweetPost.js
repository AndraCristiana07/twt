import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";
import { Modal, Button, Form } from "react-bootstrap";
import React from 'react';
import media from '../../assets/media.svg'
import close_icon from '../../assets/add.svg'
import {Tooltip} from "@mui/material"; 
import { TweetForm } from "../tweetFormPost";

export const TweetPost = ({show, handleClose}) => {

    const [content, setContent] = useState("");

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const apiUrl = process.env.REACT_APP_API_URL
    // const handleSubmit = async (e) => {
    //     setMessage("Tweet loading")

    //     e.preventDefault();
    //     setError(null);
    //     setSuccess(null);

    //     if (localStorage.getItem('access_token') === null) {
    //         window.location.href = '/login';
    //         return;
    //     }

    //     try {
    //         const accessToken = localStorage.getItem('access_token');
    //         const formdata = new FormData();
    //         formdata.append('content', content)
    //         for(let i=0; i<files.length; i++){
    //             formdata.append(`images`, files[i]);
    //         }
    //         await axiosInstance.post(`${apiUrl}/tweets/post`, 
            
    //             formdata,
    //         {
    //             headers: {
    //                 "Content-Type": "multipart/form-data",
    //                 'Authorization': `Bearer ${accessToken}`
    //             },
                
    //         }); 

    //         setContent("");
    //         setSuccess("Tweet posted successfully!");
    //         handleClose();
    //     } catch (error) {
    //         console.error(error);
    //         setError("Failed to post tweet.");
    //         if (error.response && error.response.status === 401) {
    //             window.location.href = '/login';
    //         }
    //     }
    // };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Tweet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <TweetForm/>
                <div>
                    {previews.map((preview, index) => (
                        <div
                            style={{display: "inline-block"}}
                            onMouseOver={event => {document.getElementById(`${index}-post-img`).style.opacity=100}}
                            onMouseOut={event => {document.getElementById(`${index}-post-img`).style.opacity=0}}>
                            <img key={`${index}-x`} src={close_icon} onClick={() => {
                                setPreviews(previews.filter((value, index1) => { return index1 !== index }));
                            }} style={{ transform: "rotateY(0deg) rotate(45deg)", position: 'absolute', zIndex: 2, width: '25px', height: '25px', margin: '10px', opacity: 0 }} alt={"X"}></img>
                            <img key={`${index}-post-img`} src={preview} alt="preview"
                                    style={{ width: '100px', height: '100px', margin: '10px' }} />
                        </div>
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    )
}