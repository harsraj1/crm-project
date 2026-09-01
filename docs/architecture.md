# Architecture Documentation

## System Overview

This CRM is built with an event-driven architecture using Apache Kafka for real-time data streaming and asynchronous processing.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Express   │────▶│   MongoDB   │────▶│    Kafka    │
│   (React)   │     │   (Node)    │     │   (Atlas)   │     │  (Streaming)│
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                     │
                    ┌─────────────┐     ┌─────────────┐              │
                    │  AI Worker  │◀────│  Consumers  │◀─────────────┘
                    │  (OpenAI)   │     │(Notifications)           │
                    └─────────────┘     └─────────────┘
```

## Components

### Frontend (client/)
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State**: React Context + Zustand (lightweight)
- **Styling**: Tailwind CSS
- **API**: Axios with interceptors

### Backend (server/)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT + bcrypt
- **Validation**: Zod schemas
- **Event Streaming**: KafkaJS
- **AI**: OpenAI GPT-4o-mini

### Kafka Topics
| Topic | Purpose |
|-------|---------|
| `lead.created` | New lead created |
| `lead.updated` | Lead status/data changed |
| `lead.deleted` | Lead removed |
| `customer.created` | New customer |
| `activity.logged` | Activity recorded |
| `ai.summary.request` | Request AI summary |
| `ai.summary.response` | AI summary result |
| `notification.send` | Send notification |

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum[admin, manager, sales],
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Lead
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  company: String,
  status: Enum[new, contacted, qualified, proposal, negotiation, closed-won, closed-lost],
  value: Number,
  source: Enum[website, referral, cold_call, email, social, event, other],
  assignedTo: ObjectId -> User,
  tags: [String],
  notes: String,
  aiSummary: String,
  aiInsights: [String],
  score: Number,
  lastContacted: Date,
  nextFollowUp: Date
}
```

### Customer
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  company: String,
  address: { street, city, state, zipCode, country },
  status: Enum[prospect, active, inactive, churned],
  lifetimeValue: Number,
  totalOrders: Number,
  assignedTo: ObjectId -> User
}
```

### Activity
```javascript
{
  lead: ObjectId -> Lead,
  type: Enum[call, email, meeting, note, task],
  subject: String,
  description: String,
  duration: Number,
  outcome: String,
  user: ObjectId -> User
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/update-password` - Change password

### Leads
- `GET /api/leads` - List leads (paginated, filterable)
- `GET /api/leads/stats` - Pipeline statistics
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create lead
- `PATCH /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead (admin/manager)
- `POST /api/leads/:id/activities` - Log activity
- `POST /api/leads/:id/ai-summary` - Request AI summary

### Customers
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer
- `POST /api/customers` - Create customer
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

## Development Workflow

### Branching Strategy
```
main (protected, production-ready)
  ↑
dev (integration branch)
  ↑
feature/* (individual features)
```

### Starting a Feature
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### Committing
```bash
git add .
git commit -m "feat(scope): description"
# Types: feat, fix, docs, style, refactor, test, chore
```

### Pull Request
1. Push feature branch
2. Create PR to `dev`
3. Code review
4. Merge after approval

## Environment Setup

### Local Development
```bash
# Start all services
docker-compose up -d

# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev
```

### Environment Variables
Copy `.env.example` to `.env` in both `server/` and `client/` directories.

### Testing
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test
```

## Deployment

### Docker Production Build
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Environment-Specific Configs
- **Development**: Local MongoDB, Kafka, Redis
- **Staging**: Atlas MongoDB, Confluent Cloud Kafka
- **Production**: Atlas MongoDB, Confluent Cloud, Redis Cluster

## Security Considerations

- JWT tokens with HttpOnly cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- Helmet.js for security headers
- CORS configured for specific origins
- Input validation with Zod
- MongoDB injection prevention via Mongoose