import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useAuth } from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\context/context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Container className="mt-5">
      <h2 className="mb-4">User Profile</h2>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4>Profile Information</h4>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" defaultValue={user?.name} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" defaultValue={user?.email} />
                </Form.Group>
                <Button variant="primary">Update Profile</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;