import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Menu from './drawer';

export const Bookmarks = () => {


  return (
    <Container fluid>
      <Row>
        <Col xs={2}>
          <Menu/>
        </Col>
        <Col xs={9}>
          <Container className='container mt-5 text-center'>

          </Container>
        </Col>
      </Row>
    </Container>
  );
  
};