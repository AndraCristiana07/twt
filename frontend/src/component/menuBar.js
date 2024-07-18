import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import '../css/menuBar.css';
import { useNavigate } from 'react-router-dom';

export const MenuBar = () => {
    const navigate = useNavigate();
   
  return (
    <Nav className="bottombar">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/search" className="nav-link">Search</Link>
      <Link to="/notifications" className="nav-link">Notifications</Link>
      <Link to="/messages" className="nav-link">Messages</Link>
    </Nav>
  );
};
