import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center mb-5">About SaaS Cafe Service</h1>
        </Col>
      </Row>
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h3>Our Mission</h3>
          <p>
            We believe every local cafe deserves a strong online presence. Our AI-powered 
            platform helps cafe owners focus on what they do best - serving great coffee 
            and creating community - while we handle their digital marketing.
          </p>
          <h3>What We Do</h3>
          <p>
            SaaS Cafe Service provides comprehensive digital solutions including social 
            media management, web store creation, and SEO optimization specifically 
            designed for cafes and coffee shops.
          </p>
        </Col>
        <Col md={6}>
          <Image 
            src="https://source.unsplash.com/600x400/?team,office" 
            alt="Our Team" 
            fluid 
            rounded 
          />
        </Col>
      </Row>
    </Container>
  );
};

export default About;