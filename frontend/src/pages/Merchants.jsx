import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Form, Alert, InputGroup, FormControl } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { merchantsAPI } from '../services/api'

function Merchants() {
  const [merchants, setMerchants] = useState([])
  const [filteredMerchants, setFilteredMerchants] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    mobile: '',
    opening_balance: 0
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadMerchants()
  }, [])

  useEffect(() => {
    setFilteredMerchants(
      merchants.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.business_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, merchants])

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

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({ name: '', business_name: '', mobile: '', opening_balance: 0 })
    setShowModal(true)
  }

  const handleEdit = (merchant) => {
    setIsEditing(true)
    setSelectedMerchant(merchant)
    setFormData({
      name: merchant.name || '',
      business_name: merchant.business_name || '',
      mobile: merchant.mobile || '',
      opening_balance: merchant.opening_balance || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (merchantId) => {
    if (window.confirm('Are you sure you want to delete this merchant?')) {
      try {
        await merchantsAPI.delete(merchantId)
        setMerchants(prev => prev.filter(m => m.id !== merchantId))
      } catch (err) {
        setError(err.response?.data?.message || 'Delete failed')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing && selectedMerchant) {
        await merchantsAPI.update(selectedMerchant.id, formData)
      } else {
        await merchantsAPI.create(formData)
      }

      setShowModal(false)
      setFormData({ name: '', business_name: '', mobile: '', opening_balance: 0 })
      setSelectedMerchant(null)
      setIsEditing(false)
      loadMerchants()
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed')
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
          <div className="d-flex gap-2">
            <InputGroup>
              <FormControl
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Button variant="primary" onClick={handleAdd}>
              Add New Merchant
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {filteredMerchants.map((merchant) => (
            <Col key={merchant.id} md={6} lg={4} className="mb-4">
              <Card
                className="merchant-card h-100 cursor-pointer"
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

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleEdit(merchant) }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(merchant.id) }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredMerchants.length === 0 && (
          <div className="text-center py-5">
            <p>No merchants found.</p>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Edit Merchant' : 'Add New Merchant'}</Modal.Title>
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
                  {loading
                    ? (isEditing ? 'Updating...' : 'Adding...')
                    : (isEditing ? 'Update Merchant' : 'Add Merchant')}
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
