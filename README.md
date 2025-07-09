# FastAPI React Template

A template for building full-stack applications with FastAPI and React.

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm 9 or higher

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Create a `.env` file in the root directory with:
   ```
   SECRET_KEY=dev-secret-key-here
   DATABASE_URL=sqlite+aiosqlite:///./app.db
   VITE_API_URL=http://localhost:8000
   ```

3. Install dependencies and set up the development environment:
   ```bash
   npm run install:all
   ```

4. Create the database and seed the test user:
   ```bash
   npm run seed
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Test User Credentials

- Username: alice
- Password: secret

## Available Scripts

- `npm run install:all` - Install all dependencies (Python and Node.js)
- `npm run seed` - Create database and seed test user
- `npm run dev` - Start development servers (API + Web)
- `npm run debug` - Run basic health check and authentication test

## Project Structure

- `/api` - FastAPI backend
  - `/app` - Application code
    - `main.py` - Main application entry point
    - `models.py` - Database models
    - `security.py` - Authentication and security
    - `db.py` - Database configuration
- `/web` - React frontend
  - `/src` - Source code
    - `/api` - API client configuration
    - `/contexts` - React contexts
    - `/pages` - React components/pages

## Development

The development servers support hot reloading:
- FastAPI server will reload on Python file changes
- Vite dev server will reload on React/TypeScript file changes

## Environment Variables

### Backend (FastAPI)
- `SECRET_KEY` - JWT signing key
- `DATABASE_URL` - SQLite database URL

### Frontend (Vite/React)
- `VITE_API_URL` - Backend API URL 