## 🧱 Architecture

The project follows a **modular, layered architecture** designed for clarity, scalability, and ease of maintenance.

### **HTTP Layer (`/http`)**

Handles all external communication (REST API).
Includes:

- **Routers** – define endpoints and link them to controllers.
- **Controllers** – parse HTTP requests and call the appropriate use cases or managers.
- **Middlewares** – handle cross-cutting concerns like authentication, validation, error handling, logging, and rate limiting.
- **Schemas** – define request validation logic.
- **Server** – initializes and configures the Express app.

### **Use Cases (`/actions`)**

Contain the **application-level logic**.
Each action represents a complete business flow (e.g., authentication, conversation handling) and orchestrates multiple managers and services to perform it.

### **Managers (`/managers`)**

Implement the **domain logic** and database interactions.
Each manager handles one domain entity (e.g., user, message, chat) and exposes CRUD operations or entity-specific behavior.

### **Services (`/services`)**

Provide **technical or external integrations**, such as:

- password hashing and verification
- JWT token generation and validation
- logging utilities
- AI or third-party API access

They are reusable and independent from the domain layer.

### **Root (`/`)**

Holds the main setup and configuration files:

- `main.js` – application entry point
- `db.js` – database initialization
- `errors.js` – shared custom error definitions

---

## ⚙️ Core Principles

- **Separation of concerns** – each layer has a single, clear responsibility.
- **Unidirectional dependencies** – `http → actions → managers/services`.
- **Modularity** – each feature (auth, chat, messages, etc.) is isolated and self-contained.
- **Extensibility** – easy to add new features or replace services without breaking existing logic.
