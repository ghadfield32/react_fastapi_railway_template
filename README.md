# FastAPI + React + Railway Template

A modern full-stack web application template combining **FastAPI** (Python backend) with **React** (TypeScript frontend), optimized for deployment on **Railway**.

## 🚀 Features

- **FastAPI Backend**: Modern Python web framework with automatic API documentation
- **React Frontend**: Built with Vite and TypeScript for fast development
- **Railway Deployment**: Optimized for seamless deployment on Railway platform
- **Docker Support**: Multi-stage Dockerfile for production builds
- **Development Tools**: Scripts for local development with hot reloading
- **API Integration**: Pre-configured proxy and CORS for seamless frontend-backend communication
- **Health Checks**: Built-in health monitoring for Railway deployments

## 📁 Project Structure

```
fastapi-react-railway/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py         # FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   └── main.tsx       # React entry point
│   ├── package.json       # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
├── scripts/               # Development scripts
│   ├── dev.sh            # Unix development script
│   └── dev.bat           # Windows development script
├── Dockerfile            # Multi-stage Docker build
├── railway.json          # Railway deployment configuration
├── package.json          # Root package.json with dev scripts
└── README.md            # This file
```

## 🛠️ Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**
- **Docker** (optional, for local testing)
- **Railway CLI** (for deployment)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd fastapi-react-railway

# Install all dependencies
npm run install:all
```

### 2. Development Mode

**Option A: Using npm scripts (recommended)**
```bash
# Start both frontend and backend
npm run dev
```

**Option B: Using development scripts**
```bash
# Unix/Linux/macOS
./scripts/dev.sh --install

# Windows
scripts\dev.bat --install
```

**Option C: Manual startup**
```bash
# Terminal 1: Start backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Frontend**: http://127.0.0.1:5173
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/api/docs
- **Health Check**: http://127.0.0.1:8000/api/health

## 🚢 Deployment on Railway

### Method 1: Deploy from GitHub (Recommended)

Always run npm run pre-deploy before deploying

```bash
npm run pre-deploy
```

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [Railway](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the Dockerfile and deploy

3. **Configure Environment Variables** (if needed)
   - In Railway dashboard, go to your project
   - Add environment variables in the "Variables" section

### Method 2: Deploy using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize and Deploy**
   ```bash
   railway init
   railway up
   ```

4. **View Deployment**
   ```bash
   railway status
   railway logs
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (copy from `env.example`):

```bash
# Application Settings
ENVIRONMENT=development
PORT=8000

# Frontend Settings
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000

# Railway automatically provides these in production:
# RAILWAY_ENVIRONMENT
# RAILWAY_PUBLIC_DOMAIN
# PORT
```

### Railway Configuration

The `railway.json` file configures Railway deployment:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

## 🐳 Docker

### Build and Run Locally

```bash
# Build the Docker image
docker build -t fastapi-react-app .

# Run the container
docker run -p 8000:8000 fastapi-react-app
```

### Docker Compose (Alternative)

```bash
# Using the existing docker-compose.yml
docker-compose up --build
```

## 🧪 Testing

### Test API Endpoints

```bash
# Health check
curl http://127.0.0.1:8000/api/health

# Hello endpoint
curl http://127.0.0.1:8000/api/hello

# App info
curl http://127.0.0.1:8000/api/info

# Test prediction
curl -X POST http://127.0.0.1:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"data": {"feature1": 1, "feature2": 2}}'
```

### Frontend Testing

The React app includes interactive components to test all API endpoints.

## 📚 API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://127.0.0.1:8000/api/docs
- **ReDoc**: http://127.0.0.1:8000/api/redoc
- **OpenAPI JSON**: http://127.0.0.1:8000/api/openapi.json

## 🔄 Development Workflow

1. **Make changes** to backend (`backend/app/main.py`) or frontend (`frontend/src/`)
2. **Hot reloading** is enabled for both development servers
3. **API calls** from frontend are automatically proxied to backend during development
4. **Test locally** using the development servers
5. **Deploy** by pushing to GitHub (if connected to Railway)

## 🛠️ Available Scripts

### Root Package Scripts

```bash
npm run dev                 # Start both frontend and backend
npm run dev:backend        # Start only backend
npm run dev:frontend       # Start only frontend
npm run build             # Build frontend for production
npm run install:all       # Install all dependencies
npm run test:api          # Test backend health
npm run clean             # Clean build artifacts
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container
npm run railway:deploy   # Deploy to Railway
npm run railway:logs     # View Railway logs
```

### Backend Scripts

```bash
cd backend
uvicorn app.main:app --reload    # Development server
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Production
```

### Frontend Scripts

```bash
cd frontend
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

## 🔧 Customization

### Adding New API Endpoints

1. Edit `backend/app/main.py`
2. Add new route functions
3. Update Pydantic models if needed

```python
@app.get("/api/new-endpoint")
async def new_endpoint():
    return {"message": "New endpoint"}
```

### Adding Frontend Components

1. Create new components in `frontend/src/`
2. Import and use in `App.tsx`
3. Add API calls using fetch

```typescript
const fetchData = async () => {
  const response = await fetch('/api/new-endpoint')
  const data = await response.json()
  return data
}
```

### Environment-Specific Configuration

- **Development**: Uses Vite proxy for API calls
- **Production**: FastAPI serves React static files
- **Railway**: Automatic environment detection

## 📝 Common Issues and Solutions

### CORS Issues
- Development: Handled by Vite proxy
- Production: Configured in FastAPI CORS middleware

### Port Conflicts
- Backend default: 8000
- Frontend default: 5173
- Change ports in respective config files

### Build Issues
- Ensure Node.js and Python versions match requirements
- Clear cache: `npm run clean`
- Reinstall dependencies: `npm run install:all`

### Railway Deployment Issues
- Check Railway logs: `railway logs`
- Verify Dockerfile builds locally: `docker build .`
- Ensure environment variables are set

### Python Environment Issues
- **"No module named uvicorn"**: Run `scripts\setup-env.bat` (Windows) or `./scripts/setup-env.sh` (Unix)
- **Virtual environment not found**: Create it with the setup scripts above
- **Port conflicts**: The backend uses 127.0.0.1:8000, frontend uses 127.0.0.1:5173
- **API connection errors**: Ensure both servers are running with `npm run dev`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🔗 Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Railway Documentation](https://docs.railway.app/)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Support

For issues and questions:

1. Check the documentation above
2. Review Railway logs if deployment issues
3. Open an issue on GitHub
4. Check FastAPI and React documentation

---

**Happy coding! 🎉** 