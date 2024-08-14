import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export const Conversation = ({ messages }) => {
    const { sender } = useParams();
    const filteredMessages = messages.filter(message => message.sender.username === sender).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
    return (
      <div>
        <h2>Conversation with {sender}</h2>
        <Button variant="secondary" href="/">Back</Button>
        <Container>
          <Row>
            {filteredMessages.map((message) => (
              <Col key={message.id} md={4}>
                <Card>
                  <Card.Body>
                    <Card.Title>{message.sender.username}</Card.Title>
                    <Card.Text>{message.content}</Card.Text>
                    <Card.Footer>{new Date(message.created_at).toLocaleString()}</Card.Footer>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    );
  
}