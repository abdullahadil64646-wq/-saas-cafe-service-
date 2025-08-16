import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>SaaS Cafe Service</h5>
            <p>AI-powered solutions for cafes worldwide.</p>
          </Col>
          <Col md={3}>
            <h6>Links</h6>
            <ul className="list-unstyled">
              <li><a href="/pricing" className="text-light">Pricing</a></li>
              <li><a href="/about" className="text-light">About</a></li>
              <li><a href="/contact" className="text-light">Contact</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Social</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light">Facebook</a></li>
              <li><a href="#" className="text-light">Twitter</a></li>
              <li><a href="#" className="text-light">Instagram</a></li>
            </ul>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col className="text-center">
            <p>&copy; 2025 SaaS Cafe Service. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;