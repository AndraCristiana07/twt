
import React, { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useNavigate } from 'react-router-dom';
import { TweetPost } from './modals/tweetPost';
import { Nav } from 'react-bootstrap';
import home from "../assets/home.svg";
import login from "../assets/login.svg"
import logout from "../assets/logout.svg"
import logo from "../assets/twitter.svg";
import search from "../assets/search.svg";
import notificationsImg from "../assets/notifications.svg";
import profile from "../assets/profile.svg";
import quill from "../assets/quill.svg";

const Menu = ({  }) => {
    const navigate = useNavigate();
    const handleItemClick = (path) => {
        navigate(path);
    };
    const wsUrl = process.env.REACT_APP_WEBSOCKET_URL;

    const accessToken = localStorage.getItem('access_token');
    const [isAuth, setIsAuth] = useState(false);

    // const [notificationsCount,setNotificationsCount] = useState(0);
    const [notificationsCount,setNotificationsCount] = useState(parseInt(localStorage.getItem('notifications_count')) || 0)
    const [sock, setWebSocket] = useState(null) 


    useEffect(() => {
        if (accessToken !== null) {
            setIsAuth(true); 
        }
        if(sock && sock.readyState === sock.OPEN){
            sock.close();
        }
            

        const ws = new WebSocket(`${wsUrl}/ws/notifications/?access_token=${accessToken}`)
        setWebSocket(ws)
       
        ws.onopen = (e) => {
            console.log(`onopen ${JSON.stringify(e)}`)
        }
    
        ws.onmessage = function(e) {
            const data = JSON.parse(e.data);
            
            console.info(`Received ${JSON.stringify(data)} via WS`)
            // setNotifications((prevNotifications) => [...prevNotifications, data]);
            // if (setNotifications) {
            //     setNotifications((prevNotifications) => [...prevNotifications, data]);
            //     console.log(`Notifications updated: ${JSON.stringify(data)}`);
            
            // In loc de
            // localStorage.setItem('notifications', JSON.stringify(data))
            // trebuia
            if (localStorage.getItem('notifications') === null) {
                localStorage.setItem('notifications', JSON.stringify([data]))
            } else {
                localStorage.setItem('notifications', JSON.stringify([data, ...JSON.parse(localStorage.getItem('notifications'))]))
            }

            console.log(`Notifications updated: ${JSON.stringify(localStorage)}`)
            // }
            setNotificationsCount(prevCount => {
                const newCount = prevCount + 1;
                localStorage.setItem('notifications_count', newCount);
                return newCount;
            });
        };
    
        ws.onclose = function(err) {
            console.error(JSON.stringify(err, ["message", "arguments", "type", "name"]))
        };

        return () => {
            console.log('nu mai exista drawer')
            ws.close()
        }
    }, [])

    

    // useEffect(() => {
    //  if (accessToken !== null) {
    //     setIsAuth(true); 
    //   }
    // }, [accessToken]);

    const [showPostTweetDialog, setShowPostTweetDialog] = useState(false);

    const handleOpenDialog = () => {
        setShowPostTweetDialog(true);
    };

    const handleCloseDialog = () => {
        setShowPostTweetDialog(false);
    };

    const handleNotifClick = () => {
        setNotificationsCount(0);
        localStorage.setItem('notifications_count', '0');
        navigate('/notifications')
    }
    const [userId, setUserId] = useState(localStorage.getItem('user_id'))

    const items = [
        { text: "Logo", path: '/', src: logo },
        { text: "Home", path: '/', src: home },
        { text: "Search", path: '/search', src: search},
        { text: "Profile", path: `/profile/${userId}`, src: profile },
    ];

    return (
        < >
            <List>
                {items.map((item) => (
                    <ListItem key={item.text}>
                            <img src={item.src} title={item.text} alt={item.text} onClick={() => handleItemClick(item.path)} style={{ cursor: "pointer", width: "2rem", height: "2rem", display:"flex", marginLeft:"auto"}} />
                    </ListItem>
                ))}
                <ListItem style={{display:"flex", justifyContent:"flex-end"}} >
                    <div style={{position:"relative", display:"flex", alignItems:"center"}} onClick={handleNotifClick}>
                        <img src={notificationsImg} title='Notifications' alt='Notifications' 
                            style={{ cursor: "pointer", width: "2rem", height: "2rem", display:"flex", marginLeft:"auto"}}/>
                        {notificationsCount > 0 && notificationsCount <= 10 && (
                            <span style={{
                                position: "absolute",
                                top: "-10px",
                                right: "-10px",
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "50%",
                                padding: "5px 10px",
                                fontSize: "10px",
                                fontWeight: "bold",
                                height:"1.5rem",
                                width:"1.5rem",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                textAlign:"center"
                            }}>
                                
                                {notificationsCount}
                                
                            </span>
                        )} 
                        {notificationsCount > 10 && (
                            <span style={{
                                position: "absolute",
                                top: "-10px",
                                right: "-10px",
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "50%",
                                padding: "5px 10px",
                                fontSize: "10px",
                                fontWeight: "bold",
                                height:"1.5rem",
                                width:"1.5rem",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                textAlign:"center"
                            }}>10+</span>
                        )}
                    </div>
                </ListItem>
                <ListItem>
                    <img src={quill} title="Post tweet" alt="Post tweet" onClick={handleOpenDialog} style={{ cursor: "pointer", width: "2rem", height: "2rem",  display:"flex", marginLeft:"auto" }} />
                </ListItem>
                {isAuth ? 
                <ListItem>
                    <Nav.Link href="/logout" style={{display:"flex", marginLeft:"auto"}}>
                        <img src={logout} alt='Logout' style={{ cursor: "pointer", width: "2rem", height: "2rem", display:"flex", marginLeft:"auto" }}/>
                    </Nav.Link> 
                    
                </ListItem>
                :  
                    <ListItem>
                        <Nav.Link href="/login" style={{display:"flex", marginLeft:"auto"}}>
                            <img src={login} alt='Login' style={{ cursor: "pointer", width: "2rem", height: "2rem", display:"flex", marginLeft:"auto" }} />
                        </Nav.Link>
                        
                    </ListItem>
                }
                <TweetPost show={showPostTweetDialog} handleClose={handleCloseDialog} />
            </List>
        </>
    );
};

export default Menu;
