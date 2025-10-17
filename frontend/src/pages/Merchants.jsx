import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { merchantsAPI } from '../services/api'

function Merchants() {
  const [merchants, setMerchants] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    mobile: '',
    opening_balance: 0
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadMerchants()
  }, [])

  const loadMerchants = async () => {
    try {
      const response = await merchantsAPI.getAll()
      setMerchants(response.data)
    } catch (err) {
      setError('Failed to load merchants')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await merchantsAPI.create(formData)
      setShowModal(false)
      setFormData({ name: '', business_name: '', mobile: '', opening_balance: 0 })
      loadMerchants()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create merchant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Merchants</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add New Merchant
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {merchants.map((merchant) => (
            <Col key={merchant.id} md={6} lg={4} className="mb-4">
              <Card
                className="merchant-card h-100"
                onClick={() => navigate(`/merchants/${merchant.id}`)}
              >
                <Card.Body>
                  <Card.Title>{merchant.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {merchant.business_name || 'No business name'}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Mobile:</strong> {merchant.mobile}<br />
                    <strong>Opening Balance:</strong> ₹{merchant.opening_balance}<br />
                    <strong>Current Balance:</strong> ₹{merchant.current_balance}
                  </Card.Text>
                  <Button variant="outline-primary" size="sm">
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {merchants.length === 0 && (
          <div className="text-center py-5">
            <p>No merchants found. Add your first merchant to get started.</p>
          </div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Merchant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Business Name</Form.Label>
                <Form.Control
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Opening Balance</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="opening_balance"
                  value={formData.opening_balance}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Merchant'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  )
}

export default Merchants
