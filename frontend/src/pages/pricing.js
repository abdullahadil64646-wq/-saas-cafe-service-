import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <Container className="mt-5">
      <h2 className="text-center mb-5">Choose Your Plan</h2>
      <Row>
        <Col md={4}>
          <Card className="mb-4 shadow">
            <Card.Header className="text-center bg-primary text-white">
              <h4>Basic</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="mb-3">$29<small>/month</small></h1>
              <ul className="list-unstyled">
                <li>✓ Social Media Management</li>
                <li>✓ 10 Posts per month</li>
                <li>✓ Basic Analytics</li>
                <li>✓ Email Support</li>
              </ul>
              <Button as={Link} to="/register" variant="primary" className="w-100">
                Get Started
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4 shadow border-primary">
            <Card.Header className="text-center bg-success text-white">
              <h4>Pro <span className="badge bg-warning">Popular</span></h4>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="mb-3">$59<small>/month</small></h1>
              <ul className="list-unstyled">
                <li>✓ Everything in Basic</li>
                <li>✓ 30 Posts per month</li>
                <li>✓ Advanced Analytics</li>
                <li>✓ Web Store</li>
                <li>✓ Priority Support</li>
              </ul>
              <Button as={Link} to="/register" variant="success" className="w-100">
                Get Started
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4 shadow">
            <Card.Header className="text-center bg-dark text-white">
              <h4>Enterprise</h4>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="mb-3">$99<small>/month</small></h1>
              <ul className="list-unstyled">
                <li>✓ Everything in Pro</li>
                <li>✓ Unlimited Posts</li>
                <li>✓ Custom Analytics</li>
                <li>✓ Multiple Locations</li>
                <li>✓ 24/7 Support</li>
              </ul>
              <Button as={Link} to="/register" variant="dark" className="w-100">
                Get Started
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Pricing;