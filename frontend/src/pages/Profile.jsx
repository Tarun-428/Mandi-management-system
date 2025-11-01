import React, { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import Navbar from '../components/Navbar'
import { authAPI } from '../services/api'

function Profile() {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
    partners: []
  })
  const [partner, setPartner] = useState({ name: '', mobile: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setFormData({
        ...response.data,
        password: '',
        partners: response.data.partners || []
      })
    } catch (err) {
      setError('Failed to load profile')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePartnerChange = (e) => {
    setPartner({ ...partner, [e.target.name]: e.target.value })
  }

  const addPartner = () => {
    if (formData.partners.length >= 10) {
      setError('Maximum 10 partners allowed')
      return
    }
    if (partner.name && partner.mobile) {
      setFormData({
        ...formData,
        partners: [...formData.partners, { ...partner }]
      })
      setPartner({ name: '', mobile: '' })
    }
  }

  const removePartner = (index) => {
    const newPartners = formData.partners.filter((_, i) => i !== index)
    setFormData({ ...formData, partners: newPartners })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const updateData = {
        company_name: formData.company_name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        partners: formData.partners
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await authAPI.updateProfile(updateData)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setMessage('Profile updated successfully')
      setFormData({ ...formData, password: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <h2 className="mb-4">Profile Management</h2>
        
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
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
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password (leave blank to keep current)</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4 mb-3">Partners (Max 10)</h5>
              
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Control
                    type="text"
                    name="name"
                    value={partner.name}
                    onChange={handlePartnerChange}
                    placeholder="Partner Name"
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    type="tel"
                    name="mobile"
                    value={partner.mobile}
                    onChange={handlePartnerChange}
                    placeholder="Partner Mobile"
                  />
                </Col>
                <Col md={2}>
                  <Button variant="success" onClick={addPartner} className="w-100">
                    Add
                  </Button>
                </Col>
              </Row>

              {formData.partners.length > 0 && (
                <div className="mb-3">
                  <h6>Current Partners:</h6>
                  {formData.partners.map((p, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <span>{p.name} - {p.mobile}</span>
                      <Button variant="danger" size="sm" onClick={() => removePartner(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default Profile
