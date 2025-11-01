import React, { useState, useEffect } from 'react'
import { Container, Card, Table, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { merchantsAPI } from '../services/api'

function MerchantProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [merchant, setMerchant] = useState(null)
  const [trades, setTrades] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [creditData, setCreditData] = useState({
    amount: '',
    payment_mode: 'Cash',
    description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMerchantData()
  }, [id])

  const loadMerchantData = async () => {
    try {
      const response = await merchantsAPI.getById(id)
      setMerchant(response.data.merchant)
      setTrades(response.data.trades)
      setTransactions(response.data.transactions)
    } catch (err) {
      setError('Failed to load merchant data')
    }
  }

  const handleCreditChange = (e) => {
    setCreditData({ ...creditData, [e.target.name]: e.target.value })
  }

  const openAddCreditModal = () => {
    setEditingTransaction(null)
    setCreditData({ amount: '', payment_mode: 'Cash', description: '' })
    setShowCreditModal(true)
  }

  const openEditCreditModal = (transaction) => {
    setEditingTransaction(transaction)
    setCreditData({
      amount: transaction.amount,
      payment_mode: transaction.payment_mode,
      description: transaction.description || ''
    })
    setShowCreditModal(true)
  }

  const handleCreditSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (editingTransaction) {
        // Update credit
        await merchantsAPI.updateCredit(id, editingTransaction.id, creditData)
      } else {
        // Add new credit
        await merchantsAPI.addCredit(id, creditData)
      }
      setShowCreditModal(false)
      setCreditData({ amount: '', payment_mode: 'Cash', description: '' })
      setEditingTransaction(null)
      loadMerchantData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add/update credit')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCredit = async (transaction) => {
    if (window.confirm('Are you sure you want to delete this credit entry?')) {
      try {
        await merchantsAPI.deleteCredit(id, transaction.id)
        loadMerchantData()
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete credit')
      }
    }
  }

  const totalTrade = trades.reduce((sum, trade) => sum + trade.amount, 0)
  const totalCredit = transactions.reduce((sum, t) => sum + (t.transaction_type === 'credit' ? t.amount : 0), 0)
  const balance = totalTrade - totalCredit
  const commission = totalTrade * 0.02

  if (!merchant) return <div>Loading...</div>

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{merchant.name} - Profile</h2>
          <Button variant="secondary" onClick={() => navigate('/merchants')}>
            Back to Merchants
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-4">
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Total Trade</h5>
                <h3>₹{totalTrade.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Total Credit</h5>
                <h3>₹{totalCredit.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Balance</h5>
                <h3>₹{balance.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="summary-card">
              <Card.Body className="text-center">
                <h5>Commission (2%)</h5>
                <h3>₹{commission.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Trade History */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Trade History</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill Number</th>
                  <th>Farmer</th>
                  <th>Vegetable</th>
                  <th>Weight(kg)</th>
                  <th>Bags</th>
                  <th>Rate (₹/kg)</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id}>
                    <td>{new Date(trade.date).toLocaleDateString()}</td>
                    <td>{trade.bill_number}</td>
                    <td>{trade.farmer_name}</td>
                    <td>{trade.vegetable}</td>
                    <td>{trade.weight}</td>
                    <td>{trade.bags}</td>
                    <td>₹{trade.rate}</td>
                    <td>₹{trade.amount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {trades.length === 0 && <div className="text-center py-3">No trades found</div>}
          </Card.Body>
        </Card>

        {/* Credit Entries */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Credit Entries</h5>
            <Button variant="primary" size="sm" onClick={openAddCreditModal}>
              Add Credit Entry
            </Button>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (₹)</th>
                  <th>Payment Mode</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                    <td>₹{transaction.amount}</td>
                    <td>{transaction.payment_mode}</td>
                    <td>{transaction.description || '-'}</td>
                    <td>
                      {transaction.payment_mode !== 'Opening Balance' && (
                        <>
                          <Button size="sm" variant="warning" onClick={() => openEditCreditModal(transaction)}>Edit</Button>{' '}
                          <Button size="sm" variant="danger" onClick={() => handleDeleteCredit(transaction)}>Delete</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {transactions.length === 0 && <div className="text-center py-3">No credit entries found</div>}
          </Card.Body>
        </Card>

        {/* Add/Edit Credit Modal */}
        <Modal show={showCreditModal} onHide={() => setShowCreditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingTransaction ? 'Edit Credit Entry' : 'Add Credit Entry'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreditSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="amount"
                  value={creditData.amount}
                  onChange={handleCreditChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select
                  name="payment_mode"
                  value={creditData.payment_mode}
                  onChange={handleCreditChange}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={creditData.description}
                  onChange={handleCreditChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowCreditModal(false)} className="me-2">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (editingTransaction ? 'Updating...' : 'Adding...') : (editingTransaction ? 'Update Credit' : 'Add Credit')}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  )
}

export default MerchantProfile
