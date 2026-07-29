# 🚀 CRM Project — Event-Driven AI-Powered CRM

A production-grade Customer Relationship Management (CRM) system built with a modern full-stack architecture, real-time event streaming, and AI-powered insights.

> ⚡ Built to demonstrate real-world backend engineering, system design, and scalable architecture.

---

## 🧠 Overview

This project is a **full-stack CRM platform** that allows teams to:

- Manage customers and leads
- Track sales pipelines and activities
- Receive real-time notifications
- Generate AI-powered lead insights and summaries

It is designed with an **event-driven architecture using Kafka**, making it scalable, decoupled, and production-ready.

---

## 🏗️ Architecture

```

Frontend (React)
↓
Backend API (Node.js + Express)
↓
MongoDB (Database)
↓
Kafka (Event Streaming)
↓
Consumers (Notifications, AI processing)

```

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication
- Secure password hashing with bcrypt

### 📇 CRM Core
- Customer & Lead management
- Sales pipeline tracking
- Activity logging (calls, emails, notes)

### ⚡ Real-Time System
- Event-driven architecture using Kafka
- Real-time notifications when lead status changes

### 🤖 AI Features
- Lead scoring system
- AI-generated summaries for leads
- Insight panel for decision-making

### 🧪 Testing & Quality
- Unit tests (Jest)
- Integration tests (Supertest)
- Full QA workflow

### 🚀 Deployment Ready
- Dockerized services
- Scalable microservice-friendly structure

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
|------------------|------------------------------------|
| Frontend         | React (Vite)                       |
| Backend          | Node.js + Express                  |
| Database         | MongoDB (Atlas)                    |
| Event Streaming  | Apache Kafka (KafkaJS)             |
| Auth             | JWT + bcrypt                       |
| AI Integration   | OpenAI / Anthropic API             |
| Containers       | Docker + Docker Compose            |
| Testing          | Jest + Supertest                   |

---

## 📂 Project Structure

```

crm-project/
│
├── client/            # React frontend
├── server/            # Express backend
├── kafka/             # Producers & consumers
├── docker/            # Docker configs
├── docs/              # Architecture + notes
└── README.md

````

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/harsraj1/crm-project.git
cd crm-project
````

---

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

---

### 3. Setup environment variables

Create `.env` files in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
OPENAI_API_KEY=your_key
```

---

### 4. Run the app

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

---

### 5. (Optional) Run with Docker

```bash
docker-compose up --build
```

---

## 🔄 Development Workflow

This project follows a **professional Git workflow**:

* `main` → production-ready code
* `dev` → integration branch
* `feature/*` → individual features

Example:

```bash
git checkout dev
git checkout -b feature/lead-management
```

---

## 📈 Roadmap

This project is being built over **60 days**:

* Phase 1: Foundations & Planning
* Phase 2: Core CRM Features
* Phase 3: Event-Driven System (Kafka)
* Phase 4: AI Features
* Phase 5: Testing & Debugging
* Phase 6: Deployment & Optimization

---

## 🎯 Goals of This Project

* Build a **production-level full-stack app**
* Learn **event-driven architecture with Kafka**
* Integrate **AI into real-world workflows**
* Demonstrate **scalable backend design**
* Create a **portfolio-ready flagship project**

---

## 🧠 Key Learnings

* Designing scalable distributed systems
* Building event-driven pipelines
* Handling real-time data flows
* Securing APIs and authentication
* Writing testable, maintainable code

---

## 📸 Demo (Coming Soon)

* 🎥 Demo video walkthrough
* 🌐 Live deployment link

---

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Harsh Raj**
Aspiring Software Engineer | Backend & Systems Enthusiast

---

## ⭐ If you like this project

Give it a star ⭐ — it helps a lot!