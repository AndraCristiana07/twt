import React, { useState } from "react";
import { Container, Col, Row, Form, Button, Card } from 'react-bootstrap';
import Menu from './drawer';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import search from '../assets/search.svg'

export const Search = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessToken  = localStorage.getItem('access_token');
      const response = await axios.get(`${apiUrl}/search_user?q=${q}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      setSearchResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    setQ(e.target.value);
  };





  return (
    <Container fluid style={{position:"relative"}} >
      <Row>
        <Col xs={2} style={{position:"fixed", height:"100vh", overflow:"auto"}}>
          <Menu/>
        </Col>
        <Col xs={{span:9, offset:2}}>
          <Container className='container' fluid style={{marginTop:"7vh"}}>
              
              <Form onSubmit={handleSearch}>
              <Container fluid>
                <Row>
                  <Col>
                    <Form.Group controlId="q">
                      <Form.Control type="text" placeholder="Search" value={q} onChange={handleInputChange} />
                  </Form.Group>
                  </Col>
                  <Col>
                    <Button variant="primary" type="submit">
                      <img src={search} alt="Search" style={{width:"25px", height:"25px"}}/>
                    </Button>
                  </Col>
                </Row>
              </Container>
              </Form>
              {loading && <p>Loading...</p>}
              {searchResult.length > 0 && (
                <div style={{marginTop:"8vh"}}>
                  {searchResult.map((result) => ( 
                    <Card key={result.id} style={{marginTop:"2vh", cursor:"pointer"}} onClick={()=> navigate(`/profile/${result.id}`)}>
                      <Card.Body>
                        <Card.Title>{result.name}</Card.Title>
                        <Card.Text>{result.username}</Card.Text>
                      </Card.Body>
                    </Card>
                   
                  ))}
                </div>
              )}
              {!loading && searchResult.length === 0 && <p style={{marginTop:"8vh"}}>No results found.</p>}
             


             
            
            
          </Container>
          
        </Col>
      </Row>

    </Container>



  )
};