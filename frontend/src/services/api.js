import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log("Attaching token to request:", token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

export const merchantsAPI = {
  getAll: () => api.get('/merchants'),
  getById: (id) => api.get(`/merchants/${id}`),
  create: (data) => api.post('/merchants', data),
  update: (id, data) => api.put(`/merchants/${id}`, data),
  delete: (id) => api.delete(`/merchants/${id}`),
  addCredit: (id, data) => api.post(`/merchants/${id}/credit`, data),
  updateCredit: (merchantId, transactionId, data) => 
      api.put(`/merchants/${merchantId}/credit/${transactionId}`, data),
  deleteCredit: (merchantId, transactionId) => 
      api.delete(`/merchants/${merchantId}/credit/${transactionId}`),
  getSummary: (date) => api.get('/merchants/summary', { params: { date } })
}


export const billsAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  print: (id) =>
    api.get(`/bills/print/${id}`, {
      responseType: "text",
    }).then(response => response.data),
}

export const farmersAPI = {
  getAll: (date) => api.get('/farmers', { params: { date } })
}

export const incomeAPI = {
  getAll: (params) => api.get('/income', { params }),
  getSummary: (params) => api.get('/income/summary', { params })
}

export default api
