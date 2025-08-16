import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';

const MainNavbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const guestLinks = (
    <>
      <Nav.Link as={Link} to="/pricing">Pricing</Nav.Link>
      <Nav.Link as={Link} to="/about">About</Nav.Link>
      <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
      <Nav.Link as={Link} to="/register">Register</Nav.Link>
      <Nav.Link as={Link} to="/login">Login</Nav.Link>
    </>
  );

  const authLinks = (
    <>
      <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
      <Nav.Link as={Link} to="/social-media">Social Media</Nav.Link>
      <Nav.Link as={Link} to="/web-store">Web Store</Nav.Link>
      <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
      <Nav.Link as={Link} to="/billing">Billing</Nav.Link>
      <Nav.Link onClick={logout} href="#!">Logout</Nav.Link>
    </>
  );

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">SaaS Cafe Service</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            {isAuthenticated ? authLinks : guestLinks}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;