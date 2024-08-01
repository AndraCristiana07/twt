import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import React from 'react';
import media from '../assets/media.svg'
export const Tweet = ({show, handleClose}) => {

    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null)
    const [files, setFiles] = useState([]);
  
    const apiUrl = process.env.REACT_APP_API_URL
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (localStorage.getItem('access_token') === null) {
            window.location.href = '/login';
            return;
        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const formdata = new FormData();
            formdata.append('content', content)
            for(let i=0; i<files.length; i++){
                formdata.append(`images`, files[i]);
            }
            const response = await axios.post(`${apiUrl}/tweets/post`, 
                // { 
                //     content: content,
                //     images: files
                // }, 
                formdata,
                // {images:images},
             {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${accessToken}`
                },
                
            }); // nu e folosit 

            setContent("");
            setSuccess("Tweet posted successfully!");
            handleClose();
        } catch (error) {
            console.error(error);
            setError("Failed to post tweet.");
            if (error.response && error.response.status === 401) {
                window.location.href = '/login';
            }
        }
    };


    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Tweet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formTweetContent">
                        <Form.Label>Tweet</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </Form.Group>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>}
                    {/* <img src={media} alt="media" title="media content" style={{width:"4vw", height:"4vh"}}/> */}
                    <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                        <input  onChange={(e)=> {setFiles(e.target.files)}} type="file" multiple  
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            zIndex: 2,
                            cursor: 'pointer'
                        }} />
                        <img src={media} alt="media" title="media content" 
                            style={{
                            width: '100%', 
                            height: '100%', 
                            position: 'absolute',
                            zIndex: 1
                        }} />

                    </div>
                    <Button variant="primary" type="submit">
                        Post Tweet
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}