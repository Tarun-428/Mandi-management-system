# 🌾 Mandi Management System

A **full-stack Mandi Management System** for managing agricultural marketplaces.
It includes a **React frontend**, **Flask backend**, and **PostgreSQL database**. The system provides a **login/authentication system**, bill printing, stock management, and many more features for managing mandis efficiently.

---

## 🧩 Project Overview

This system allows users to:

* Register, login, and manage accounts securely.
* Manage stock entries and transactions.
* Generate and print bills for purchases or sales.
* Track inventory and prices in the mandi system.
* Admin dashboard for monitoring users, transactions, and reports.
* Full authentication & authorization to protect sensitive data.

---


## ⚙️ Tech Stack

**Backend (Flask + Python)**

* Flask for API development
* SQLAlchemy for ORM with PostgreSQL
* JWT / Flask-Login for authentication
* Flask-CORS for frontend communication
* Pandas / ReportLab for bill generation and printing

**Frontend (React)**

* React.js for UI
* React Router for navigation
* Axios for API requests
* React-Bootstrap / Material UI for styling
* Charts and tables for data visualization

**Database**

* PostgreSQL for storing users, transactions, stock, and billing data

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/mandi-management-system.git
cd mandi-management-system
```

---

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

#### Configure Database

* Create a PostgreSQL database (e.g., `mandi_db`)
* Update `.env` with database URI:

```
DATABASE_URL=postgresql://username:password@localhost:5432/mandi_db
SECRET_KEY=<your-secret-key>
```

#### Run Flask Server

```bash
python app.py
```

Server runs at:

```
http://127.0.0.1:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

React app will run at:

```
http://localhost:3000
```

---

## 🔄 How It Works

1. **User Authentication**

   * Login and registration with secure password hashing
   * Role-based access (Admin, Mandi Staff)

2. **Stock Management**

   * Add, edit, delete stock items
   * Track quantities and prices

3. **Billing**

   * Create bills for transactions
   * Print or download PDF invoices
   * Automatic calculations of totals and taxes

4. **Dashboard**

   * Visual representation of stock, sales, and revenue
   * Quick access to recent bills and user management

---

## 🧰 Features

* Secure login & registration system
* Full CRUD operations on stock & transactions
* Bill generation & print functionality
* Admin panel for monitoring users and transactions
* Interactive charts for sales & inventory tracking
* PostgreSQL database integration

---

## 🌐 Deployment

* Backend (Flask) can be deployed on **Heroku**, **AWS**, or **DigitalOcean**.
* Frontend (React) can be hosted on **Netlify**, **Vercel**, or as static files served by Flask.
* Ensure proper environment variables and CORS settings.

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.
See [LICENSE](LICENSE) for details.

---


This README covers **React frontend, Flask backend, PostgreSQL integration, authentication, billing & printing features**.

I can also draft a **visual section with screenshots for dashboard, login, and bills** so your GitHub README looks polished and professional.

Do you want me to add that section?
