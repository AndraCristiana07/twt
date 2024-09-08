import { useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import close_icon from '../../assets/add.svg'
import {Tooltip} from "@mui/material"; 
import { ChangeProfilePicture } from "./changeProfilePicture";
import { ChangeHeaderPicture } from "./changeHeaderPicture";

export const EditProfile = ({ show, handleClose,profileImage, headerImage }) => {
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [headerFile, setHeaderFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState();
    const [headerPreview, setHeaderPreview] = useState();

    const apiUrl = process.env.REACT_APP_API_URL

    const [showProfileDialog, setShowProfileDialog] = useState(false)
    const [showHeaderDialog, setShowHeaderDialog] = useState(false)

    const handleOpenProfileDialog = () => {
        setShowProfileDialog(true);
    };

    const handleCloseProfileDialog = () => {
        setShowProfileDialog(false);
    };

    const handleOpenHeaderialog = () => {
        setShowHeaderDialog(true);
    };

    const handleCloseHeaderDialog = () => {
        setShowHeaderDialog(false);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title> Edit profile</Modal.Title>
            </Modal.Header>

                <Modal.Body>
                    

                        <Row xs={8}>
                            <img src={headerImage} alt="twt header" style={{ marginTop: "100px", width:"100%", maxHeight:"20vh", cursor:"pointer" }} onClick={handleOpenHeaderialog}/>
                            <ChangeHeaderPicture show={showHeaderDialog} handleClose={handleCloseHeaderDialog}/>
                        </Row>
                        

                        <Row>
                            <img src={profileImage} style={{width:"100px", height:"100px", borderRadius:"50%", cursor:"pointer"}} alt="Profile pic"  onClick={handleOpenProfileDialog}/>
                        </Row>
                        <ChangeProfilePicture show={showProfileDialog} handleClose={handleCloseProfileDialog} />
                      

                    <Button type="submit" onClick={handleClose}>Save Changes</Button>

                
                </Modal.Body>
        </Modal>
    )
}