# Task Manager Web Application

## Project Title and Description

**Task Manager** is a comprehensive web-based application designed to help users efficiently organize, track, and manage their tasks. The system provides a user-friendly interface for creating, updating, and deleting tasks, along with features such as categorization, priority setting, deadline management, and progress tracking. Built with a modern full-stack architecture, it supports both individual and team-based task management, ensuring productivity and collaboration.

### Key Features

- **Task Management**: Create, read, update, and delete tasks with detailed descriptions
- **Categorization**: Organize tasks into customizable categories (e.g., Work, Study, Personal)
- **Priority Levels**: Assign high, medium, or low priority to tasks
- **Deadlines and Notifications**: Set due dates and receive reminders for upcoming tasks
- **Kanban Board**: Visualize tasks in a drag-and-drop Kanban interface (To Do, In Progress, Done)
- **User Authentication**: Secure login and registration with JWT-based authentication
- **Dashboard**: Overview of task statistics, progress tracking, and recent activities
- **Team Collaboration**: Support for team-based task assignment and management
- **Real-time Updates**: Automatic synchronization of task changes across the application

## Tech Stack

### Backend

- **Framework**: FastAPI (Python web framework for building APIs)
- **Language**: Python 3.8+
- **Database**: SQLite or Postgresql (with SQLAlchemy ORM for data modeling)
- **Authentication**: JWT (JSON Web Tokens) for secure user sessions
- **Additional Libraries**: Pydantic for data validation, Uvicorn for ASGI server

### Frontend

- **Framework**: React 19+ with Vite for build tooling
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API for global state
- **UI Components**: Custom components with Lucide React icons
- **Drag & Drop**: @dnd-kit library for Kanban board interactions
- **Animations**: Framer Motion for smooth transitions

### Testing Tools

- **Backend Testing**: pytest for unit and integration tests
- **Frontend Testing**: Jest with React Testing Library for component and user interaction tests
- **Additional Testing**: Coverage reporting, mock libraries for API and external dependencies

### Other Tools

- **Version Control**: Git
- **Package Management**: pip (Python), npm (Node.js)
- **Development Server**: Uvicorn (backend), Vite dev server (frontend)
- **Linting**: ESLint (frontend), Black/Flake8 (backend)
- **Documentation**: FastAPI automatic API docs, Markdown for README

## Project Structure

```
task-manager-backend/
├── app/                          # Backend application code
│   ├── __init__.py
│   ├── main.py                   # FastAPI application entry point
│   ├── init_db.py                # Database initialization
│   ├── api/                      # API route handlers
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── tasks.py              # Task management endpoints
│   │   ├── categories.py         # Category management endpoints
│   │   └── teams.py              # Team management endpoints
│   ├── core/                     # Core utilities and configurations
│   │   ├── config.py             # Application settings
│   │   ├── database.py           # Database connection and session
│   │   ├── security.py           # Authentication utilities
│   │   └── auth.py               # Authentication logic
│   ├── models/                   # Database models
│   │   ├── user.py               # User model
│   │   ├── task.py               # Task model
│   │   ├── category.py           # Category model
│   │   └── team.py               # Team model
│   ├── repositories/             # Data access layer
│   │   ├── base_repo.py          # Base repository class
│   │   ├── user_repo.py          # User repository
│   │   ├── task_repo.py          # Task repository
│   │   └── team_repo.py          # Team repository
│   ├── schemas/                  # Pydantic schemas for API
│   │   ├── user.py               # User schemas
│   │   ├── task.py               # Task schemas
│   │   └── team.py               # Team schemas
│   └── services/                 # Business logic layer
│       ├── auth_service.py       # Authentication services
│       ├── task_service.py       # Task management services
│       └── email_service.py      # Email notification services
├── tests/                        # Backend tests
│   ├── __init__.py
│   ├── conftest.py                # pytest configuration
│   ├── test_api_auth.py           # Authentication API tests
│   ├── test_api_tasks.py          # Task API tests
│   ├── test_api_categories.py     # Category API tests
│   ├── test_api_teams.py          # Team API tests
│   ├── test_auth_service.py       # Authentication service tests
│   └── test_health.py             # Health check tests
├── scripts/                       # Utility scripts
│   ├── create_admin.py            # Admin user creation script
│   ├── create_db.py               # Database creation script
│   └── migrate_tasks.py           # Data migration scripts
├── requirements.txt               # Python dependencies
├── pytest.ini                     # pytest configuration
├── run.py                         # Application runner script
└── structure.txt                  # Project structure documentation

frontend/                          # Frontend application
├── public/                        # Static assets
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── auth/                  # Authentication components
│   │   ├── board/                 # Kanban board components
│   │   ├── layout/                # Layout components (Navbar, Sidebar)
│   │   ├── modals/                # Modal dialogs
│   │   └── ui/                    # Basic UI elements (Button, Input)
│   ├── context/                   # React Context for state management
│   │   └── TaskContext.jsx        # Global task state
│   ├── pages/                     # Page components
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── TasksBoard.jsx         # Kanban board page
│   │   ├── LoginPage.jsx          # Login page
│   │   ├── RegisterPage.jsx       # Registration page
│   │   └── AdminDashboard.jsx     # Admin dashboard
│   ├── utils/                     # Utility functions
│   │   └── notificationEngine.js  # Notification management
│   └── __tests__/                 # Frontend tests
│       ├── setup.js               # Jest setup
│       ├── components/            # Component tests
│       ├── pages/                 # Page tests
│       ├── context/               # Context tests
│       ├── utils/                 # Utility tests
│       └── integration/           # Integration tests
├── package.json                   # Node.js dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── jest.config.cjs                # Jest configuration
└── TESTING_README.md              # Testing documentation
```

## Features

- **User Registration and Authentication**: Secure user accounts with email/password authentication
- **Task CRUD Operations**: Full create, read, update, and delete functionality for tasks
- **Task Categorization**: Assign tasks to categories for better organization
- **Priority Management**: Set task priorities to focus on high-impact items
- **Deadline Tracking**: Set and track task deadlines with notification reminders
- **Kanban Board View**: Visual task management with drag-and-drop functionality
- **Dashboard Analytics**: View task statistics, progress charts, and recent activities
- **Team Management**: Create and manage teams for collaborative task assignment
- **Real-time Notifications**: Browser notifications for upcoming deadlines
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Admin Panel**: Administrative features for user and system management
- **Data Export**: Export task data for backup or analysis
- **Search and Filtering**: Advanced search and filter options for tasks

## Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn package manager
- Git

### Backend Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd task-manager-backend
   ```

2. **Create a virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the database**:

   ```bash
   python scripts/create_db.py
   ```

5. **Create an admin user (optional)**:

   ```bash
   python scripts/create_admin.py
   ```

6. **Run the backend server**:
   ```bash
   python run.py
   ```
   The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Full Application Setup

1. **Start the backend server** (in one terminal):

   ```bash
   cd task-manager-backend
   python run.py
   ```

2. **Start the frontend server** (in another terminal):

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://127.0.0.1:8000`
   - API Documentation: `http://127.0.0.1:8000/docs` (FastAPI automatic docs)

## Running Tests

### Backend Tests

1. **Navigate to the backend directory**:

   ```bash
   cd task-manager-backend
   ```

2. **Run all backend tests with pytest**:

   ```bash
   pytest
   ```

3. **Run tests with coverage report**:

   ```bash
   pytest --cov=app --cov-report=html
   ```

4. **Run specific test files**:
   ```bash
   pytest tests/test_api_tasks.py
   ```

### Frontend Tests

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Run all frontend tests with Jest**:

   ```bash
   npm test
   ```

3. **Run tests in watch mode**:

   ```bash
   npm run test:watch
   ```

4. **Run tests with coverage report**:

   ```bash
   npm test -- --coverage
   ```

5. **Run specific test files**:
   ```bash
   npm test -- --testPathPattern=TaskContext
   ```

## API Overview

The Task Manager API provides RESTful endpoints for managing tasks, users, categories, and teams. Below is a brief overview of the main endpoints:

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check-email` - Email availability check

### Task Management Endpoints

- `GET /api/tasks/` - Retrieve user tasks (or all tasks for admin)
- `POST /api/tasks/` - Create a new task
- `PUT /api/tasks/{task_id}` - Update an existing task
- `DELETE /api/tasks/{task_id}` - Delete a task
- `GET /api/tasks/{task_id}/comments` - Get task comments
- `POST /api/tasks/{task_id}/comments` - Add a comment to a task

### Category Management Endpoints

- `GET /api/categories/` - Retrieve all categories
- `POST /api/categories/` - Create a new category
- `PUT /api/categories/{category_id}` - Update a category
- `DELETE /api/categories/{category_id}` - Delete a category

### Team Management Endpoints

- `GET /api/teams/` - Retrieve user teams
- `POST /api/teams/` - Create a new team
- `PUT /api/teams/{team_id}` - Update a team
- `DELETE /api/teams/{team_id}` - Delete a team

For detailed API documentation, visit `http://127.0.0.1:8000/docs` when the backend is running.

## Screenshots or Usage

_Placeholder for screenshots_

- Dashboard view showing task statistics and recent tasks
- Kanban board with drag-and-drop functionality
- Task creation modal with form validation
- Login and registration pages

## Future Improvements

- **Real-time Collaboration**: Implement WebSocket connections for live updates across multiple users
- **Advanced Analytics**: Add detailed reporting and analytics dashboards
- **Integration APIs**: Connect with external tools like Google Calendar, Slack, or Trello
- **Advanced Search**: Implement full-text search with filters and sorting options
- **File Attachments**: Allow users to attach files and documents to tasks
- **Scalability Enhancements**: Migrate to PostgreSQL and implement caching with Redis
- **Security Improvements**: Add OAuth integration, two-factor authentication, and rate limiting

## Contributors

Ahmed Mohamed [manager , dev]
Mohamed Gamal [dev , SE]
Kamel Mohmed [dev]
Mahmoud Iraqi [tester]

---

_This README provides a comprehensive overview of the Task Manager application. For detailed technical documentation, API references, or development guides, please refer to the respective directories and files within the project._
