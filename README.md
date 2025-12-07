# 🔐 Full Stack Authentication System  
React + TypeScript + Node.js + Express + MongoDB

---

## 📌 Overview

This project is a complete full-stack authentication system built using modern web technologies.  
It includes features such as:

- User registration (Signup)
- Secure login with JWT authentication
- Remember-me support
- Password validation rules
- Protected API routes
- Protected frontend pages
- User profile page (with name, email, join date)
- Local storage token handling

The goal of this project was to simulate a real-world authentication flow similar to modern web applications.

---

## 🛠️ Tech Stack

| Layer        | Technology Used |
|--------------|----------------|
| **Frontend** | React, TypeScript, Fetch API, CSS |
| **Backend**  | Node.js, Express.js, JSON Web Tokens (JWT), bcrypt |
| **Database** | MongoDB + Mongoose |
| **Other**    | LocalStorage, REST API architecture |

---

## 🚀 Features

✔ Signup with validation (strong password required)  
✔ Login + Remember Me (1-day token persistence)  
✔ JWT-based authentication  
✔ `/profile` page only accessible after login  
✔ Auto redirect after login/signup  
✔ Clean UI with modern styling  
✔ MongoDB storage using schema & middleware  
✔ Passwords are hashed using bcrypt  

---

## 📂 Project Structure

Project/
│
├── auth-frontend/ # React + TypeScript client
│ └── src/
│ ├── App.tsx
│ ├── pages/
│ └── components/
│
├── auth-backend/ # Node.js + Express server
│ └── src/
│ ├── server.ts
│ ├── routes/
│ └── models/
│
└── README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```sh
git clone https://github.com/HashimSaify/react-auth-app.git
cd Project

2️⃣ Install dependencies
cd auth-backend
npm install

Frontend:
cd ../auth-frontend
npm install

3️⃣ Configure Environment Variables
Inside /auth-backend, create a file named:
.env

Add:
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=yourSecretKey123
PORT=5000

4️⃣ Run the project
Start backend:
cd auth-backend
npm run dev

Start frontend:
cd auth-frontend
npm start

🧪 Testing API (Optional)
You can test via Postman / Thunder Client:

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| `POST` | `/api/auth/signup`  | Create new user             |
| `POST` | `/api/auth/login`   | Login + receive JWT         |
| `GET`  | `/api/auth/profile` | Get authenticated user info |


🔐 Security Measures
✔ JWT expiration
✔ bcrypt password hashing
✔ Email uniqueness validation
✔ Protected routes (both frontend + backend)

📌 Future Improvements
✨ User avatar upload

✉️ Email verification

🔁 Refresh token system

🔐 Forgot password (OTP)


⭐ Support
If you found this helpful, feel free to:

⭐ Star the repository

🛠 Fork and improve

💬 Share feedback

🎉 Thank you for checking out this project!

---

