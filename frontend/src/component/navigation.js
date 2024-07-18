import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDrawer from './drawer';
import Button from '@mui/material/Button'; 

export function Navigation() {

   const [isAuth, setIsAuth] = useState(false);
   useEffect(() => {
     if (localStorage.getItem('access_token') !== null) {
        setIsAuth(true); 
      }
    }, [isAuth]);

    // const [drawerOpen, setDrawerOpen] = useState(false);

    // const handleDrawerOpen = () => {
    //     setDrawerOpen(true);
    // };
    // const handleDrawerClose = () => {
    //     setDrawerOpen(false);
    // };
    // const navigate = useNavigate();

     return ( 
      <div>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="/"> Authentification</Navbar.Brand>            
          {/* <Button variant="contained" onClick={handleDrawerOpen}>
                    Open Drawer
          </Button>
          <CustomDrawer open={drawerOpen} onClose={handleDrawerClose}  /> */}
         
          <Nav className="me-auto"> 
          {isAuth ? <Nav.Link href="/">Home</Nav.Link> : null}
          </Nav>
          <Nav>
            {isAuth ? <Nav.Link href="/board">Board</Nav.Link> : null}
          </Nav>
          <Nav>
          {isAuth ? <Nav.Link href="/logout">Logout</Nav.Link> :  
                    <Nav.Link href="/login">Login</Nav.Link>}
          </Nav>
        </Navbar>
       </div>
     );
}