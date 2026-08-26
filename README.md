#  Order Tracking System

A containerized Order Tracking System designed to manage customers, orders, order statuses, and status history through a RESTful backend with a basic React frontend.

##  Tech Stack

### Backend

* Node.js
* Express.js
* PostgreSQL
* REST API

### Infrastructure

* Docker
* Docker Compose
* MongoDB
* Redis

### Frontend

* React
* Vite

##  Architecture

```text
                    ┌──────────────────┐
                    │   React Frontend │
                    │   Order Dashboard│
                    └────────┬─────────┘
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │  Node.js/Express │
                    │     Backend      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ PostgreSQL │ │  MongoDB   │ │   Redis    │
       │ Orders &   │ │  Event/    │ │   Cache    │
       │ Users      │ │  History   │ │            │
       └────────────┘ └────────────┘ └────────────┘
```

##  Current Features

* User creation through REST API
* Order creation
* Order listing
* Order details retrieval
* Order status history retrieval
* PostgreSQL transactions for order creation
* Automatic initial `PLACED` status history entry
* Dockerized PostgreSQL, MongoDB, and Redis services
* Basic React order tracking dashboard

## 📡 API Endpoints

### Users

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| POST   | `/api/users` | Create a user |
| GET    | `/api/users` | Get all users |

### Orders

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | `/api/orders`             | Create an order          |
| GET    | `/api/orders`             | Get all orders           |
| GET    | `/api/orders/:id`         | Get order details        |
| GET    | `/api/orders/:id/history` | Get order status history |
| PATCH  | `/api/orders/:id/status`  | Update order status      |

##  Database Design

### PostgreSQL

The PostgreSQL database contains the core relational data:

* `users`
* `orders`
* `order_status_history`

The `orders` table maintains the current order status, while `order_status_history` records status transitions and the user responsible for the change.

### MongoDB

MongoDB is included in the Docker infrastructure for document-oriented data and future event/history requirements.

### Redis

Redis is included for caching and future real-time/performance-related requirements.

##  Running the Project

### Prerequisites

Make sure the following are installed:

* Node.js
* Docker Desktop
* Git

### Start Database Services

From the project root:

```bash
docker compose up -d
```

This starts:

* PostgreSQL
* MongoDB
* Redis

### Start Backend

```bash
cd server
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start Frontend

```bash
cd client
npm install
npm run dev
```

The frontend will be available at the Vite development URL shown in the terminal.

## 🧪 Example API Request

### Create User

```http
POST /api/users
Content-Type: application/json
```

```json
{
  "name": "Prathibha",
  "email": "prathibha@example.com"
}
```

### Create Order

```http
POST /api/orders
Content-Type: application/json
```

```json
{
  "order_number": "ORD-1001",
  "customer_id": "<user-id>"
}
```

A successfully created order receives the default status:

```text
PLACED
```

and an initial status-history record is created automatically.

##  Transaction Handling

Order creation uses a PostgreSQL transaction:

```text
BEGIN
  ↓
Create Order
  ↓
Create Initial Status History
  ↓
COMMIT
```

If either database operation fails, the transaction is rolled back to prevent inconsistent order data.

##  Current Development Status

The core order creation and retrieval workflow has been implemented and tested successfully.

The status-transition endpoint is currently under development due to a mismatch between the currently configured PostgreSQL `order_status` enum and the status values expected by the API controller.

The project is therefore being submitted as an **in-progress implementation**, with the core PostgreSQL order-management workflow functional.

##  Difficulties Faced

During development, several environment and integration issues were encountered:

* Docker CLI was initially unavailable until Docker Desktop was restarted.
* Docker Compose initially failed because the Docker daemon was not running.
* WSL2 was involved in the Docker environment setup.
* PostgreSQL, MongoDB, and Redis were successfully brought up using Docker Compose.
* A PostgreSQL authentication/connection conflict occurred because a native Windows PostgreSQL 18 service was also running and listening on port `5432`.
* The project was configured to use the Docker PostgreSQL instance with the `order_app` database user.
* The initial order creation implementation did not match the final `order_status_history` database schema. This was identified by inspecting the PostgreSQL table definitions and corrected in the backend controller.
* PostgreSQL transactions were used to ensure that an order and its initial status-history record are created atomically.

##  Example Workflow

```text
Create User
    ↓
Create Order
    ↓
Order receives PLACED status
    ↓
Initial status history is recorded
    ↓
Order can be retrieved through REST API
    ↓
Order history can be retrieved
    ↓
Frontend displays order information
```

##  Future Improvements

* Complete order status transition validation
* Add authentication and authorization
* Use authenticated user identity for `changed_by`
* Integrate Redis caching
* Integrate MongoDB event/history storage
* Add real-time order tracking using WebSockets
* Add frontend status-update controls
* Add automated tests
* Improve frontend UI and error handling

##  Author

**Prathibha R**

Artificial Intelligence and Machine Learning
Alva's Institute of Engineering and Technology

---

**Project Status:**  In Development
