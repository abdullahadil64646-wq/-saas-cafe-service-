import React from 'react';
import { Container, Row, Col, Button, Card, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Grow Your Cafe's Online Presence</h1>
              <p className="lead">
                We provide AI-powered tech solutions and social media management 
                specifically designed for local cafes.
              </p>
              <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
                Get Started
              </Button>
              <Button as={Link} to="/pricing" variant="outline-light" size="lg">
                View Plans
              </Button>
            </Col>
            <Col md={6} className="text-center">
              <Image 
                src="https://source.unsplash.com/random/600x400/?cafe" 
                alt="Cafe" 
                fluid 
                rounded 
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Our Services</h2>
        <Row>
          <Col md={4}>
            <Card className="mb-4 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-instagram" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Title>Social Media Management</Card.Title>
                <Card.Text>
                  AI-generated content for your social media channels. We create engaging posts, 
                  find trending hashtags, and schedule everything automatically.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-shop" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Title>Online Web Store</Card.Title>
                <Card.Text>
                  Get your own beautiful web store where customers can browse your menu,
                  place orders, and learn about your cafe.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 shadow-sm h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-graph-up" style={{ fontSize: '2rem' }}></i>
                </div>
                <Card.Title>SEO & Marketing</Card.Title>
                <Card.Text>
                  Improve your cafe's visibility online with our SEO services. We help 
                  customers find you when they search for cafes in your area.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Testimonials Section */}
      <div className="bg-light py-5 mb-5">
        <Container>
          <h2 className="text-center mb-4">What Our Customers Say</h2>
          <Row>
            <Col md={4}>
              <Card className="mb-4 border-0 bg-light">
                <Card.Body>
                  <blockquote className="blockquote mb-0">
                    <p>"SaaS Cafe Service has transformed our online presence. Our Instagram 
                       followers have doubled in just three months!"</p>
                    <footer className="blockquote-footer">
                      Ahmad from <cite title="Source Title">Cafe Delight</cite>
                    </footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 border-0 bg-light">
                <Card.Body>
                  <blockquote className="blockquote mb-0">
                    <p>"The web store feature helped us reach new customers we couldn't 
                       before. Now we get online orders every day."</p>
                    <footer className="blockquote-footer">
                      Sara from <cite title="Source Title">Coffee Haven</cite>
                    </footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 border-0 bg-light">
                <Card.Body>
                  <blockquote className="blockquote mb-0">
                    <p>"Their AI-generated social media posts are amazing. They save 
                       us so much time and our engagement has never been better."</p>
                    <footer className="blockquote-footer">
                      Fahad from <cite title="Source Title">Urban Beans</cite>
                    </footer>
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action */}
      <Container className="text-center mb-5">
        <Row>
          <Col>
            <h2 className="mb-3">Ready to Transform Your Cafe?</h2>
            <p className="lead mb-4">
              Join hundreds of cafes that are already growing their business with our platform.
            </p>
            <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
              Start Your Free Trial
            </Button>
            <Button as={Link} to="/contact" variant="outline-primary" size="lg">
              Contact Us
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;