import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const SocialMedia = () => {
  return (
    <Container className="mt-5">
      <h2 className="mb-4">Social Media Management</h2>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4>AI Content Generator</h4>
              <p>Generate engaging social media content for your cafe.</p>
              <Button variant="primary">Generate Content</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Quick Stats</h5>
              <p>Posts this month: 15</p>
              <p>Engagement rate: 4.2%</p>
              <p>New followers: 25</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SocialMedia;