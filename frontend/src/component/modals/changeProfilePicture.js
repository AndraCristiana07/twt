import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import close_icon from '../../assets/add.svg'
import camera from '../../assets/camera.svg'
import deleteImg from '../../assets/delete.svg'
import {Tooltip} from "@mui/material"; 
import { DeleteProfileImageDialog } from "./deleteProfileImageDialog";

export const ChangeProfilePicture = ({show, handleClose}) => {
    const [profileImage, setProfileImage] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState();
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL
    const [showProfileDialog, setShowProfileDialog] = useState(false)

    const handleCloseDeleteDialog = () => {
        setShowProfileDialog(false)
    };
    const handleOpenProfileDialog = () => {
        setShowProfileDialog(true);
    };
    

    const handleUpload = async (e) => {
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
            formdata.append('profileImage', profileImage);

            await axiosInstance.post(`${apiUrl}/upload_profile_picture`,

                formdata,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        'Authorization': `Bearer ${accessToken}`
                    },

                });
            setSuccess("profile image uploaded successfully!");
            handleClose();

        } catch (error) {
            setError("Failed to upload profile image.");
        }
    }

    const handleProfileFileChange = (e) => {
        const file = e.target.files[0];
        console.log("aaaaaaaaaaaaaa" + file)

        if(file){
            setProfileImage(file);
            setProfilePreview(URL.createObjectURL(file));
        }

    }
    const removeProfileImage = () => {
        setProfileImage(null);
        setProfilePreview(null);
    }

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title> Edit Profile Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form onSubmit={handleUpload}> 

                <Tooltip title="Media profile" style={{margin:"50px"}}>
                    <div style={{position:"relative", width: '4vw', height: '4vh' }}>
                        <input
                            onChange={handleProfileFileChange}
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
                        <img src={camera} alt="Profile" title="media content"
                            style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            zIndex: 1
                        }} />
                    </div>
                    </Tooltip>
                    <Tooltip title="Delete image" onClick={handleOpenProfileDialog}>
                        <img style={{width:"5vw"}} src={deleteImg} />
                    </Tooltip>
                    <DeleteProfileImageDialog show={showProfileDialog} handleClose={handleCloseDeleteDialog} />

                    <div>
                        {profilePreview && (
                            <div
                                style={{ display: "inline-block" }}
                                onMouseOver={event => { document.getElementById('close-icon').style.opacity = 100 }}
                                onMouseOut={event => { document.getElementById('close-icon').style.opacity = 0 }}>
                                <img id="close-icon" src={close_icon} onClick={removeProfileImage}
                                    style={{ transform: "rotateY(0deg) rotate(45deg)", position: 'absolute', zIndex: 2, width: '25px', height: '25px', margin: '10px', opacity: 0 }} alt={"X"} />
                                <img src={profilePreview} alt="preview"
                                    style={{ width: '100px', height: '100px', margin: '10px' }} />
                            </div>
                        )}
                    </div>

                <Button type="submit">Save Changes</Button>

            </Form>
            
                
            
            </Modal.Body>
        </Modal>
    )
}