import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Menu from '../drawer';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export const Notifications = () => {

  const notifications = JSON.parse(localStorage.getItem('notifications'));
  console.log("cccc" + JSON.stringify(notifications))
  useEffect(() => {
    console.log("Notifications state updated: ", notifications);
  }, [notifications]);
  const navigate = useNavigate();

  return(
        <>
          <h2>Notifications</h2>
          <ul>
              {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                      <Card key={index} className="mb-4 tweet-card" onClick={()=> navigate(`/profile/${notification.follower}`)}>
                          {`User ${notification.follower} started following User ${notification.following}`}
                      </Card>
                    ))
              ) : (
                  <li>No new notifications</li>
              )}
          </ul>
        </>

  )
};