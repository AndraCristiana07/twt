import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../interceptor/axiosInstance";
import { Modal, Button, Form } from "react-bootstrap";
import media from '../../assets/media.svg'
import { Tooltip } from "@mui/material";
import close_icon from '../../assets/add.svg'

const apiUrl = process.env.REACT_APP_API_URL;

export const Comment = ({ show, handleClose, tweetId }) => {
    // const { tweetId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState(null)
    const [previews, setPreviews] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // setError(null);
        // setSuccess(null);
        setMessage("Comment loading")

        if (localStorage.getItem('access_token') == null) {
            window.location.href = "/login";
            return;
        }

        try {
            const accessToken = localStorage.getItem('access_token');
            const formData = new FormData();
            // formdata.append('content', content)
            for (let i = 0; i < files.length; i++) {
                formData.append(`images`, files[i]);
            }
            formData.append(`content`, content);
           
            const response = await axiosInstance.post(`${apiUrl}/tweets/comment/${tweetId}`, 
                formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setContent("");
            setMessage("Comment posted successfully!");
            // handleClose();
        } catch (error) {
            console.error(error);
            setMessage("Failed to post comment.");
        }
    }

    const handleModalClick = (e) => {
        e.stopPropagation();
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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prevPreviews => [...prevPreviews, ...previewUrls]);
    }

    return (
        <Modal show={show} onHide={handleClose} onClick={handleModalClick}>
            <Modal.Header closeButton>
                <Modal.Title>Post a Comment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="content">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            value={content}
                        />
                    </Form.Group>
                    {/* {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green' }}>{success}</p>} */}
                    <Tooltip title="Media">
                        <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                            <input
                                onChange={handleFileChange}
                                type="file" multiple
                                title=""
                                
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
                        </Tooltip>
                        <div key='tweetbutton' style={{ display: "flex", justifyContent: "end" }}>
                            <Button variant="primary" type="submit">
                                Post Comment
                            </Button>
                        </div>
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                   
                </Form>
                {/* <div>
                    {previews.map((preview, index) => (
                        <img key={index} src={preview} alt="preview" style={{ width: '100px', height: '100px', margin: '10px' }} />
                    ))}
                </div> */}
                 <div>
                {previews.map((preview, index) => {
                    // const isVideo = files[index].endsWith('.mp4')
                    const isVideo = files[index].type.startsWith('video');



                    return (
                        <><div key={index}
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
                        </div><div>
                                {/* {previews.map((preview, index) => (
                                    <div
                                        style={{ display: "inline-block" }}
                                        onMouseOver={event => { document.getElementById(`${index}-post-img`).style.opacity = 100; } }
                                        onMouseOut={event => { document.getElementById(`${index}-post-img`).style.opacity = 0; } }>
                                        <img key={`${index}-x`} src={close_icon} onClick={() => {
                                            setPreviews(previews.filter((value, index1) => { return index1 !== index; }));
                                        } } style={{ transform: "rotateY(0deg) rotate(45deg)", position: 'absolute', zIndex: 2, width: '25px', height: '25px', margin: '10px', opacity: 0 }} alt={"X"}></img>
                                        <img key={`${index}-post-img`} src={preview} alt="preview"
                                            style={{ width: '100px', height: '100px', margin: '10px' }} />
                                    </div>
                                ))} */}
                            </div></>
                    );
                })}
            </div>
            </Modal.Body>
        </Modal>
    )
}
