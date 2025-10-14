# SaChat 🤖💬

SaChat is a full-stack web application that provides a conversational interface to interact with OpenAI's language models. Unlike a simple UI, SaChat features a robust backend for user authentication, chat management, and message persistence, allowing users to have private, saved conversations over time.

[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](#)

## Tech Stack

**Backend:**
- **Runtime:** Node.js (ESM)
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)
- **Validation:** Joi
- **Logging:** Pino
- **Security:** Bcrypt

**Frontend:**
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing**: Vue Router
- **Styling:** Tailwind CSS
- **Icons:** Feather Icons

**Development & Tooling:**
- **Linting:** ESLint
- **Formatting:** Prettier
- **Committing:** Commitizen
- **Containerization:** Docker

## Project Structure

The project is a monorepo containing both the frontend and the backend.

```
/
├── backend/        # Node.js REST API using Express and Prisma
├── frontend/       # Vue 3 Single Page Application using Vite
├── database/       # PostgreSQL Docker configuration
└── compose.yaml    # Docker Compose for local database
```

## Prerequisites

Ensure you have the following software installed on your machine:

-   [Node.js](https://nodejs.org/) (v20.19+ or v22.12+ recommended)
-   [npm](https://www.npmjs.com/)
-   [Docker](https://www.docker.com/) and Docker Compose
-   An [OpenAI](https://platform.openai.com/) account and API key

## Setup and Installation

Follow these steps to set up the local development environment.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/sachat.git
    cd sachat
    ```

2.  **Install dependencies (all-in-one):**
    ```bash
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    cd backend && npm install && cd ..
    
    # Install frontend dependencies
    cd frontend && npm install && cd ..
    ```

3.  **Set up environment variables:**
    ```bash
    # Create backend .env file
    cp backend/.env.example backend/.env
    
    # Create frontend .env file
    cp frontend/.env.example frontend/.env
    
    # Create database .env file
    cp database/.env.example database/.env
    ```
    - For each service, fill the .env with your values.
    - **Important:** The `.env` files contain sensitive data and are ignored by Git for security reasons. Never commit these files to the repository.

4.  **Start the PostgreSQL database:**
    ```bash
    docker compose up -d
    ```
    
5.  **Set up the database:**
    Make sure your PostgreSQL server is running, then run the database migrations from the backend directory:
    ```bash
    cd backend
    npx prisma migrate dev
    ```
    
6.  **(Optional) Seed the database:**
    To populate the database with initial data, run the seed script:
    ```bash
    cd backend
    npm run seed
    ```

## Running the Project

To start the application, you will need to run the backend and frontend in **two separate terminal sessions**.

1.  **Start the Backend Server (Terminal 1):**
    ```bash
    cd backend
    npm run dev
    ```
    The API server will be listening on `http://localhost:3000` (or the configured port).

2.  **Start the Frontend Development Server (Terminal 2):**
    ```bash
    cd frontend
    npm run dev
    ```
    The Vue application will be accessible at `http://localhost:5173`.
