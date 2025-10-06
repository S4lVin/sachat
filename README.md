# SaChat 🤖💬

SaChat is a full-stack web application that provides a conversational interface to interact with OpenAI's language models. Unlike a simple UI, SaChat features a robust backend for user authentication, chat management, and message persistence, allowing users to have private, saved conversations over time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Key Features

- **Secure Authentication**: JWT-based login and registration system (Access Token + Refresh Token).
- **Persistent Conversations**: Chats and messages are saved to a PostgreSQL database.
- **OpenAI Integration**: Direct interaction with OpenAI APIs to generate intelligent responses.
- **Reactive Interface**: A smooth and modern user experience built with Vue 3.
- **Monorepo Structure**: Separate frontend and backend codebases managed within a single repository for better organization.

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
- **Styling:** Tailwind CSS
- **HTTP Requests:** Axios
- **Icons:** Feather Icons

**Development & Tooling:**
- **Linting:** ESLint
- **Formatting:** Prettier
- **Committing:** Commitizen

## Project Structure

The project is a monorepo containing both the frontend and the backend.

```
/
├── backend/        # Node.js REST API using Express and Prisma
├── frontend/       # Vue 3 Single Page Application using Vite
├── .gitignore
└── package.json    # Root-level dependencies (e.g., Commitizen)
```

- **`/backend`**: Contains all server-side logic, API routes, database interactions, and authentication.
- **`/frontend`**: Contains the client-side application. For specific details, please refer to the `frontend/README.md` file.

## Prerequisites

Ensure you have the following software installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/)
- A running instance of [PostgreSQL](https://www.postgresql.org/)
- An [OpenAI](https://platform.openai.com/) account and API key.

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
    - In `/backend`, create a `.env` file by copying the template from `.env.example` and fill it with your values.
    - In `/frontend`, do the same, creating a `.env` from its `.env.example`.
    - **Important:** The `.env` files contain sensitive data and are ignored by Git for security reasons. Never commit these files to the repository.

4.  **Set up the database:**
    Make sure your PostgreSQL server is running, then run the database migrations from the backend directory:
    ```bash
    cd backend
    npx prisma migrate dev
    ```
5.  **(Optional) Seed the database:**
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
