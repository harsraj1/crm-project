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
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Express   │────▶│   MongoDB   │────▶│    Kafka    │
│  (React)    │     │  (Node.js)  │     │   (Atlas)   │     │ (Streaming) │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                     ┌─────────────┐     ┌─────────────┐              │
                     │  AI Worker  │◀────│  Consumers  │◀─────────────┘
                     │  (OpenAI)   │     │(Notifications)           │
                     └─────────────┘     └─────────────┘
```

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication with HttpOnly cookies
- Secure password hashing with bcrypt (12 rounds)
- Role-based access control (admin, manager, sales)

### 📇 CRM Core
- Customer & Lead management
- Sales pipeline tracking (7 stages)
- Activity logging (calls, emails, meetings, notes, tasks)

### ⚡ Real-Time System
- Event-driven architecture using Apache Kafka
- Real-time notifications when lead status changes
- Decoupled microservice-friendly structure

### 🤖 AI Features
- Lead scoring system
- AI-generated summaries for leads (OpenAI GPT-4o-mini or Hugging Face free alternative)
- Insight panel for decision-making

### 🧪 Testing & Quality
- Unit tests (Jest)
- Integration tests (Supertest)
- Full QA workflow

### 🚀 Deployment Ready
- Dockerized services with Docker Compose
- Scalable microservice-friendly structure
- Environment-specific configurations

---

## 🛠️ Tech Stack

| Layer            | Technology                          |
|------------------|------------------------------------|
| Frontend         | React 18 + Vite                    |
| Backend          | Node.js + Express                  |
| Database         | MongoDB (Atlas) + Mongoose ODM     |
| Event Streaming  | Apache Kafka (KafkaJS)             |
| Auth             | JWT + bcrypt                       |
| AI Integration   | OpenAI / Hugging Face (free alternative) |
| Containers       | Docker + Docker Compose            |
| Testing          | Jest + Supertest                   |
| Styling          | Tailwind CSS                       |
| Validation       | Zod                                |

---

## 📂 Project Structure

```
crm-project/
│
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leads.jsx
│   │   │   ├── LeadDetail.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/          # API client (Axios)
│   │   ├── App.jsx            # Router + routes
│   │   └── main.jsx
│   ├── Dockerfile
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # Database, Kafka config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, errors
│   │   ├── models/            # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Lead.js
│   │   │   ├── Customer.js
│   │   │   ├── Activity.js
│   │   │   └── Notification.js
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (AI, notifications)
│   │   ├── utils/             # Helpers (AppError, JWT)
│   │   ├── validators/        # Zod schemas
│   │   ├── kafka/             # Producer, consumer, client
│   │   └── index.js           # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── docker/                    # Docker configs (future)
├── docs/                      # Architecture & API docs
│   └── architecture.md
├── docker-compose.yml         # Local development stack
├── README.md
└── .gitignore
```

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/harsraj1/crm-project.git
cd crm-project
```

### 2. Start with Docker (recommended)

```bash
docker compose up --build
```

That single command starts MongoDB, loads idempotent demo data, and starts the API and frontend. Kafka is optional in the baseline so CRM writes remain available without an event broker.

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

Demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@crm.local` | `AdminDemo123!` |
| Sales | `sales@crm.local` | `SalesDemo123!` |

These credentials are for local development only and can be overridden with the `SEED_ADMIN_*` and `SEED_SALES_*` environment variables.

To include the event-driven services, enable the Kafka profile and flag:

```powershell
$env:KAFKA_ENABLED='true'; docker compose --profile kafka up --build
```

```bash
KAFKA_ENABLED=true docker compose --profile kafka up --build
```

### Production-like container run

The production compose file builds immutable API and Nginx frontend images without source bind mounts. Set a strong secret, then start it:

```bash
JWT_SECRET=replace-with-at-least-32-random-characters docker compose -f docker-compose.prod.yml up -d --build
```

Open `http://localhost:8080`. For an internet-facing deployment, terminate TLS at a managed load balancer/reverse proxy, inject secrets through the hosting platform, and use managed MongoDB/Kafka where possible.

### 3. Or Run Locally (Manual)

#### Backend
```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run seed
npm run dev
```

#### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### 4. Environment Variables

**Server (.env)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
KAFKA_ENABLED=false
KAFKA_BROKER=localhost:9092
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your-openai-key
HF_TOKEN=your-hugging-face-token
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2  # optional
AI_PROVIDER=openai  # or huggingface
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_AI_FEATURES=true
```

After the stack is running, the repeatable API acceptance check is:

```bash
cd server
npm run smoke
```

---

## 🔄 Development Workflow

This project follows a **professional Git workflow**:

* `main` → production-ready code (protected)
* `dev` → integration branch
* `feature/*` → individual features

### Starting a Feature

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### Commit Convention

```
feat(scope): description     # New feature
fix(scope): description      # Bug fix
docs(scope): description     # Documentation
style(scope): description    # Formatting
refactor(scope): description # Code restructuring
test(scope): description     # Tests
chore(scope): description    # Maintenance
```

### Pull Request Flow

1. Push feature branch
2. Create PR to `dev`
3. Code review (required)
4. Merge after approval
5. Deploy to staging from `dev`

---

## 📈 Fast-track roadmap

The implementation plan has been condensed into [10 outcome-based phases](docs/10-phase-roadmap.md), based on the current repository state. The original 60-day plan remains useful as learning material, but the 10-phase plan is the delivery source of truth.

<details>
<summary>Original 60-day roadmap</summary>

| Phase | Days | Focus |
|-------|------|-------|
| **Phase 1** | 1-10 | Foundations & Planning ✅ **COMPLETE** |
| **Phase 2** | 11-25 | Core CRM Features |
| **Phase 3** | 26-35 | Event-Driven System (Kafka) |
| **Phase 4** | 36-45 | AI Features |
| **Phase 5** | 46-55 | Testing & Debugging |
| **Phase 6** | 56-60 | Deployment & Optimization |

### Phase 1: Foundations (Days 1-10) ✅
- [x] Project scaffolding (client, server, docker)
- [x] Express + MongoDB + JWT auth
- [x] React + Vite + Tailwind setup
- [x] Kafka producer/consumer structure
- [x] Docker Compose for local dev
- [x] CI/CD pipeline foundation

### Phase 2: Core CRM (Days 11-25)
- [ ] Lead kanban board (drag & drop)
- [ ] Customer 360° view
- [ ] Activity timeline
- [ ] Pipeline analytics dashboard
- [ ] Email integration (SendGrid/Nodemailer)
- [ ] File attachments

### Phase 3: Kafka Events (Days 26-35)
- [ ] Real-time notifications (WebSocket/SSE)
- [ ] Event sourcing for audit trail
- [ ] Dead letter queue handling
- [ ] Consumer groups for scaling
- [ ] Schema registry (Avro/Protobuf)

### Phase 4: AI Features (Days 36-45)
- [ ] Lead scoring algorithm
- [ ] AI email drafting
- [ ] Meeting summarization
- [ ] Predictive forecasting
- [ ] Chat assistant (RAG)

### Phase 5: Testing (Days 46-55)
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Load testing (k6)
- [ ] Chaos engineering

### Phase 6: Deployment (Days 56-60)
- [ ] Kubernetes manifests
- [ ] Helm charts
- [ ] GitOps (ArgoCD/Flux)
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Logging (ELK/Loki)
- [ ] Production hardening

</details>

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

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Harsh Raj**
Aspiring Software Engineer | Backend & Systems Enthusiast

[GitHub](https://github.com/harsraj1) • [LinkedIn](https://linkedin.com/in/harsh-raj)

---

## ⭐ If you like this project

Give it a star ⭐ — it helps a lot!
