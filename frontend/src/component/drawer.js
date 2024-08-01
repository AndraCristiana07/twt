
import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Tweet } from './tweet_post';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { performLogout } from './logout'; 
import Button from '@mui/material/Button';
import home from "../assets/home.svg";
import login from "../assets/login.svg"
import logout from "../assets/logout.svg"
import logo from "../assets/twitter.svg";
import search from "../assets/search.svg";
import notifications from "../assets/notifications.svg";
import notifications_alert from "../assets/notifications-alert.svg";
import profile from "../assets/profile.svg";
import quill from "../assets/quill.svg";
import messages from "../assets/messages.svg";
import bookmarks from "../assets/bookmark.svg";
import settings from "../assets/settings.svg";
import add from "../assets/add.svg";

const Menu = ({ }) => {
    const navigate = useNavigate();
    const handleItemClick = (path) => {
        navigate(path);
    };

    const [isAuth, setIsAuth] = useState(false);
    useEffect(() => {
     if (localStorage.getItem('access_token') !== null) {
        setIsAuth(true); 
      }
    }, [isAuth]);

    const [showPostTweetDialog, setShowPostTweetDialog] = useState(false);

    const handleOpenDialog = () => {
        setShowPostTweetDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostTweetDialog(false);
    };

    // const handleLogout = () => {
    //     performLogout();
    // };

    const items = [
        { text: "Logo", path: '/', src: logo },
        { text: "Home", path: '/', src: home },
        { text: "Notifications", path: '/notifications', src: notifications },
        { text: "Profile", path: '/profile', src: profile },
        { text: "Search", path: '/search', src: search}
    ];

    return (
        <div style={{ border: "2px", borderColor: "black" }} >
            <List>
                {items.map((item) => (
                    <ListItem key={item.text} onClick={() => handleItemClick(item.path)}>
                        <ListItemText>
                            <img src={item.src} title={item.text} alt={item.text} style={{ cursor: "pointer", width: "5vh", height: "5vh"}} />
                        </ListItemText>
                    </ListItem>
                ))}
                <ListItem>
                    <img src={quill} title="Post tweet" alt="Post tweet" onClick={handleOpenDialog} style={{ cursor: "pointer", width: "5vh", height: "5vh" }} />
                </ListItem>
                {isAuth ? 
                <ListItem>
                    <Nav.Link href="/logout">
                        <img src={logout} alt='Logout' style={{ cursor: "pointer", width: "5vh", height: "5vh" }}/>
                    </Nav.Link> 
                    
                </ListItem>
                :  
                    <ListItem>
                        <Nav.Link href="/login">
                            <img src={login} alt='Login' style={{ cursor: "pointer", width: "5vh", height: "5vh" }} />
                        </Nav.Link>
                        
                    </ListItem>
                }
                <Tweet show={showPostTweetDialog} handleClose={handleCloseDialog} />
            </List>
        </div>
    );
};

export default Menu;
