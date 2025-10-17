import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BSNavbar.Brand as={Link} to="/">Mandi Management</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/bills">Bills</Nav.Link>
            <Nav.Link as={Link} to="/merchants">Merchants</Nav.Link>
            <Nav.Link as={Link} to="/farmers">Farmers</Nav.Link>
            <Nav.Link as={Link} to="/merchant-summary">Merchant Summary</Nav.Link>
            <Nav.Link as={Link} to="/adhatiya-income">Adhatiya Income</Nav.Link>
            <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
          </Nav>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar
