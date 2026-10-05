# FX Trading Dashboard

A full-stack foreign exchange trading dashboard built with **Java, Spring Boot, React, TypeScript, and PostgreSQL**.

The project simulates a small FX trading environment where users can monitor market prices, place orders, view order history, and manage order lifecycle actions through a responsive web interface.

> This is an independent portfolio project designed to demonstrate full-stack engineering, backend architecture, REST APIs, database persistence, and financial-market domain concepts.

## Overview

The application follows a simple full-stack architecture:

```text
React / TypeScript
        ↓
     REST API
        ↓
Java / Spring Boot
        ↓
   PostgreSQL
```

The backend exposes market-data and order-management APIs, while the React frontend provides the trading dashboard and user interface.

## Features

### Market Data

* FX prices for EUR/USD, GBP/USD, and USD/JPY
* Bid / ask prices
* Spread calculation
* Simulated live price movement
* Interactive price chart
* Pair selection
* High / low price tracking

### Order Management

* Buy and sell orders
* Market-price execution
* Order validation
* Order persistence in PostgreSQL
* Order history
* Order filtering by:

  * Currency pair
  * Side
  * Status
* Order sorting and pagination
* Order lifecycle:

  * NEW
  * FILLED
  * CANCELLED
* Order cancellation
* Order filling

### Engineering

* RESTful API design
* DTO validation
* Global exception handling
* JPA / Hibernate persistence
* Integration and unit tests
* CORS configuration
* Dockerized development environment
* PostgreSQL database

## Tech Stack

### Backend

* Java 21
* Spring Boot 4
* Spring Web
* Spring Data JPA
* Hibernate
* PostgreSQL
* Maven
* JUnit
* Lombok

### Frontend

* React 19
* TypeScript
* Vite
* CSS
* pnpm

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL

## API

### Market Prices

```http
GET /api/market
```

Returns the available FX market prices.

Example:

```json
[
  {
    "symbol": "EUR/USD",
    "bid": 1.1725,
    "ask": 1.1727,
    "spread": 0.0002
  }
]
```

### Create Order

```http
POST /api/orders
Content-Type: application/json
```

Example request:

```json
{
  "symbol": "EUR/USD",
  "side": "BUY",
  "quantity": 10000
}
```

### Get Orders

```http
GET /api/orders
```

### Fill Order

```http
PUT /api/orders/{orderId}/fill
```

### Cancel Order

```http
DELETE /api/orders/{orderId}
```

## Project Structure

```text
fx-trading-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   └── java/com/chaima/fxtrading/
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── pnpm-lock.yaml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Running Locally

### Option 1 — Docker Compose

The easiest way to run the complete application is with Docker Compose.

```bash
docker compose up --build
```

The services are exposed at:

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:8080`
* PostgreSQL: `localhost:5432`

To stop the application:

```bash
docker compose down
```

### Option 2 — Run Backend and Frontend Separately

Start the Spring Boot backend:

```bash
cd backend
./mvnw spring-boot:run
```

Then start the frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Testing

Backend tests can be executed with:

```bash
cd backend
./mvnw clean test
```

The test suite covers order management and API behavior, including validation and order lifecycle transitions.

## Design Considerations

The project intentionally separates responsibilities between the API, business logic, persistence layer, and frontend.

The backend uses a service-oriented structure:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Order state transitions are explicitly controlled so that invalid lifecycle operations are rejected.

For example, an order can transition from:

```text
NEW → FILLED
NEW → CANCELLED
```

but a completed or cancelled order cannot be filled again.

## What This Project Demonstrates

This project focuses on practical software-engineering skills relevant to fintech and financial-market applications:

* Java backend development
* Spring Boot
* REST API design
* Domain modelling
* Database persistence
* Input validation
* Exception handling
* React and TypeScript
* Full-stack integration
* Automated testing
* Docker
* Git / GitHub
* Financial-market concepts such as bid, ask, spread, and order lifecycle

## Future Improvements

Possible extensions include:

* WebSocket-based market data
* Authentication and authorization
* Real-time order updates
* Portfolio and P&L calculations
* More advanced order types
* Market-data provider integration
* Kafka-based event processing
* Redis caching
* Kubernetes deployment
* CI/CD pipeline

## Author

**Chaima Dhaouadi**

Software Engineer focused on **Java, React, FinTech, and financial-market applications**.

* GitHub: https://github.com/chaimadhd
* LinkedIn: https://www.linkedin.com/
