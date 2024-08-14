import React, { useEffect, useState } from "react";
import axiosInstance from "../../interceptor/axiosInstance";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Menu from "../drawer";


const Messages = () => {
    const navigate = useNavigate()
    const apiUrl = process.env.REACT_APP_API_URL;

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: {
                username: 'ana'
            },
            receiver: {
                username: 'me'
            },
            content: 'Hello, world!',
            created_at: '2023-05-01 01:00:00'

        },
        {
            id: 2,
            sender: {
                username: 'ana'
            },
            receiver: {
                username: 'me'
            },
            content: 'Hi there!',
            created_at: '2024-01-01 01:00:00'
        },
        {
            id: 3,
            sender: {
                username: 'matei'
            },
            receiver: {
                username: 'me'
            },
            content: 'How are you?',
            created_at: '2024-01-01 03:00:00'

        }
    ]);
    const getLastMessages = (messages) => {
        const latestMessages = {};

        messages.forEach((message) => {
          const senderUsername = message.sender.username;

          if (!latestMessages[senderUsername] || new Date(message.created_at) > new Date(latestMessages[senderUsername].created_at)) {
            latestMessages[senderUsername] = message;
          }
        });



        return Object.values(latestMessages);
      };

      const handleCardClick = (senderUsername) => {
        navigate(`/conversation/${senderUsername}`);
      };
      const latestMessages = getLastMessages(messages);
    // useEffect(() => {
    //     const fetchMessages = async () => {
    //         try {
    //             const accessToken = localStorage.getItem('access_token');
    //             const response = await axiosInstance.get(`${apiUrl}/messages/get`, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${accessToken}`
    //                 }
    //             });
    //             setMessages(response.data);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };

    //     fetchMessages();
    // }, []);

    return (
        <Container fluid  style={{position:"relative"}}>
          <Row>
            <Col  xs={2} style={{position:"fixed", height:"100vh", overflow:"auto", borderRight:"1px solid black"}}>
              <Menu />
            </Col>
            <Col xs={{span:9, offset:2}}>
              <h2>Messages</h2>
              <Container>
                <Row>
                  {latestMessages.map((message) => (
                    <Row key={message.id} className="mt-4">
                      <Card onClick={()=> handleCardClick(message.sender.username)}>
                        <Card.Body>
                          <Card.Title>{message.sender.username}</Card.Title>
                          <Card.Text>{message.content}</Card.Text>
                          <Card.Footer>{new Date(message.created_at).toLocaleString()}</Card.Footer>
                        </Card.Body>
                      </Card>
                    </Row>
                  ))}
                </Row>
              </Container>
            </Col>
          </Row>

        </Container>
    );
};

export default Messages;
