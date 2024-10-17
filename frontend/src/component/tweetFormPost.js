import { useState } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Tooltip } from "@mui/material"; // TODO replace with X icon
import close_icon from '../assets/add.svg'
import media from '../assets/media.svg';
import axiosInstance from "../interceptor/axiosInstance";

export const TweetForm = () => {
    const [message, setMessage] = useState(null)
    const [content, setContent] = useState("");
    
    const [files, setFiles] = useState([])
    const [previews, setPreviews] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
    
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...previewUrls]);
    };

    const handleTweetPost = async (e) => {
        setMessage("Tweet loading")
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
            // setError("")
            setMessage("Tweet posted successfully!");
        } catch (error) {
            setMessage("Failed to post tweet.");
            // setMessage("");
            console.error('Error posting tweet:', error);
        }
        };
        
    const capture = (file, index) => {
        const canvas = document.getElementById('canvas');
        const video = document.getElementById('video');
        // video.src = file;
        // video.muted = true;

        if (!canvas || !video) return;

        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        
        const thumbnail = canvas.toDataURL('image/png');
        
        
        setPreviews(prevPreviews => {
        const newPreviews = [...prevPreviews]
        newPreviews[index] = thumbnail
        return newPreviews

        });
    };
    return (
        <><Form onSubmit={handleTweetPost}>
            <Form.Group controlId="formTweet">
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={content}
                    placeholder="What's happening?"
                    onChange={(e) => setContent(e.target.value)}
                    required />
            </Form.Group>
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
                        }} />
                    <img src={media} alt="media" title="media content"
                        style={{
                            width: '100%', // TODO
                            height: '100%', // TODO
                            position: 'absolute',
                            zIndex: 1
                        }} />
                </div>
            </Tooltip>


            <div key='tweetbutton' style={{ display: "flex", justifyContent: "end" }}>
                <Button variant="primary" type="submit">
                    Tweet
                </Button>
            </div>
            {/* {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>} */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </Form>
            <div>
                {previews.map((preview, index) => {
                    // const isVideo = files[index].endsWith('.mp4')
                    const isVideo = files[index].type.startsWith('video');



                    return (
                        <div key={index}
                            style={{ display: "inline-block" }}
                            onMouseOver={event => {
                                document.getElementById(`${index}-x`).style.opacity = 100;
                            } }
                            onMouseOut={event => {
                                document.getElementById(`${index}-x`).style.opacity = 0;
                            } }>
                            <img id={`${index}-x`} src={close_icon} onClick={() => {
                                // TODO
                                setFiles(files.filter((value, index2) => {
                                    return index2 !== index;
                                }));
                                setPreviews(previews.filter((value, index1) => {
                                    return index1 !== index;
                                }));
                            } } style={{
                                transform: "rotateY(0deg) rotate(45deg)",
                                position: 'absolute',
                                zIndex: 2,
                                width: '25px',
                                height: '25px',
                                margin: '10px',
                                opacity: 0
                            }} alt={"X"} />

                            {isVideo ? (
                                <>
                                    <video
                                        id={`${index}-video`}
                                        src={preview}
                                        style={{ width: '100px', height: '100px', margin: '10px' }}
                                        // controls
                                        muted
                                        onLoadedData={() => capture(files[index], index)}
                                    ></video>
                                    <canvas id={`${index}-canvas`} style={{ display: 'none' }}></canvas>

                                </>
                            ) : (
                                <img
                                    id={`${index}-post-img`}
                                    src={preview}
                                    alt="preview"
                                    style={{ width: '100px', height: '100px', margin: '10px' }} />
                            )}
                        </div>
                    );
                })}
            </div></>
    )
}