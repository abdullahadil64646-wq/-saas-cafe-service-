import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const WebStore = () => {
  return (
    <Container className="mt-5">
      <h2 className="mb-4">Web Store Management</h2>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4>Your Online Store</h4>
              <p>Manage your cafe's online presence and menu.</p>
              <Button variant="primary">Edit Store</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Store Stats</h5>
              <p>Orders this month: 45</p>
              <p>Revenue: $1,250</p>
              <p>Top item: Cappuccino</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WebStore;