import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Tooltip } from "@mui/material"; 
import media from '../assets/media.svg';


export const TestThumbnail = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [showVideo, setShowVideo] = useState(false)

    const capture = () => {
        const canvas = document.getElementById('canvas');
        const video = document.getElementById('video');

        if (!canvas || !video) return;

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        
        const dataURL = canvas.toDataURL('image/png');
        
        
        setPreview(dataURL);
    };



    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl); 
        setVideoLoaded(false); 
    };

    return (
        <div>
            <Card className="mt-5">
                <Card.Body>
                    <Form>
                        <Form.Group controlId="formTweet"></Form.Group>
                        <Tooltip title="Media">
                            <div style={{ position: "relative", width: '4vw', height: '4vh' }}>
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
                                    }}
                                />
                                <img
                                    src={media} alt="media" title="media content"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        zIndex: 1
                                    }}
                                />
                            </div>
                        </Tooltip>
                    </Form>
                </Card.Body>
            </Card>

            
            {file && (
                <video muted 
                    id="video"
                    // style={{display:'none'}}
                    style={{visibility:'hidden'}}
                    src={URL.createObjectURL(file)}
                    type="video/mp4"
                    controls
                    onLoadedData={() => setVideoLoaded(true)} 
                ></video>
            )}
            <br />

            
            {videoLoaded && (
                <button onClick={capture}>Capture Thumbnail</button>
            )}
            <br /><br />

            
            <canvas id="canvas" style={{ display: 'none' }}></canvas> 
            <br /><br />

            
            {preview && (
                <img src={preview} alt="Captured Thumbnail" />
            )}
        </div>
    );
};