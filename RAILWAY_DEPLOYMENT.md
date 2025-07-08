# Railway Deployment Guide

This guide explains how to deploy your FastAPI + React application to Railway with separate services for backend and frontend.

## Project Structure for Railway

Your project is now configured for Railway deployment with this structure:

```
react_fastapi_railway_template/
├── backend/                    # 🐍 FastAPI Backend Service
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   └── __init__.py
│   ├── requirements.txt       # Python dependencies
│   └── railway.json          # Railway backend configuration
├── frontend/                   # ⚛️ React Frontend Service
│   ├── src/                   # React source code
│   ├── package.json           # Node.js dependencies
│   └── railway.json          # Railway frontend configuration
└── scripts/
    ├── test-railway.bat       # Windows Railway testing script
    └── test-railway.sh        # Unix Railway testing script
```

## Prerequisites

1. **Railway CLI installed**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Railway account**: Sign up at [railway.app](https://railway.app)

3. **Git repository**: Your code should be in a Git repository

## Testing Before Deployment

### Pre-Deployment Validation (Recommended)

Run the comprehensive pre-deployment check:

```bash
npm run pre-deploy
```

This script validates:
- ✅ Package-lock.json synchronization
- ✅ Dependencies and build process
- ✅ Railway configuration files
- ✅ Backend and frontend functionality

### Railway Environment Testing

Run the Railway test script to verify your configuration:

**Windows:**
```bash
scripts\test-railway.bat
```

**Unix/Linux/macOS:**
```bash
./scripts/test-railway.sh
```

This script will:
- ✅ Check Railway CLI installation and authentication
- ✅ Validate configuration files
- ✅ Test local builds
- ✅ Verify Railway environment compatibility

## Deployment Steps

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Choose "Deploy from GitHub repo" and select your repository

### Step 2: Configure Backend Service

1. **Create Backend Service**:
   - In Railway dashboard, click "Add Service"
   - Choose "GitHub Repo"
   - Select your repository
   - Set **Root Directory**: `backend/`
   - Set **Service Name**: `fastapi-backend`

2. **Environment Variables** (automatically set):
   - `PORT` - Railway automatically provides this
   - `RAILWAY_ENVIRONMENT` - Set to "production"

3. **Custom Domain** (optional):
   - Go to service settings → Networking
   - Generate domain or add custom domain

### Step 3: Configure Frontend Service

1. **Create Frontend Service**:
   - Click "Add Service" again
   - Choose "GitHub Repo"
   - Select your repository
   - Set **Root Directory**: `frontend/`
   - Set **Service Name**: `react-frontend`

2. **Environment Variables**:
   - `VITE_API_URL` - Set to your backend service URL (e.g., `https://your-backend.railway.app`)

3. **Custom Domain** (optional):
   - Generate domain for frontend access

### Step 4: Deploy

1. Both services should deploy automatically
2. Monitor deployment logs in Railway dashboard
3. Check service health at:
   - Backend: `https://your-backend.railway.app/api/health`
   - Frontend: `https://your-frontend.railway.app`

## Configuration Files Explained

### Backend Railway Configuration (`backend/railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

### Frontend Railway Configuration (`frontend/railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve -s dist -l $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Environment Variables

### Backend Service
- `PORT` - Automatically set by Railway
- `RAILWAY_ENVIRONMENT` - Set to "production"
- `ENVIRONMENT` - Set to "production"

### Frontend Service
- `PORT` - Automatically set by Railway
- `VITE_API_URL` - Set to your backend service URL

## Testing Deployment

### Using Railway CLI

1. **Install and authenticate**:
   ```bash
   railway login
   ```

2. **Link to your project**:
   ```bash
   railway link
   ```

3. **Test backend locally with Railway environment**:
   ```bash
   cd backend
   railway run python -c "from app.main import app; print('Backend works!')"
   ```

4. **Test frontend build with Railway environment**:
   ```bash
   cd frontend
   railway run npm run build
   ```

5. **View logs**:
   ```bash
   railway logs --service fastapi-backend
   railway logs --service react-frontend
   ```

### Manual Testing

1. **Backend Health Check**:
   ```bash
   curl https://your-backend.railway.app/api/health
   ```

2. **API Endpoints**:
   ```bash
   curl https://your-backend.railway.app/api/hello
   curl https://your-backend.railway.app/api/info
   ```

3. **Frontend Access**:
   Visit `https://your-frontend.railway.app` in browser

## Troubleshooting

### Common Issues

1. **"No start command found"**:
   - Ensure `railway.json` exists in service root directory
   - Verify `startCommand` is correctly specified

2. **"hypercorn: command not found"**:
   - Old configuration issue - ensure frontend uses `npx serve`
   - Remove any Python files from frontend directory

3. **"npm ci failed - package-lock.json out of sync"**:
   - **Root cause**: `package.json` and `package-lock.json` are not synchronized
   - **Fix**: Run `npm install` to update `package-lock.json`
   - **Prevention**: Always commit both files together
   - **Validation**: Run `npm run pre-deploy` before deploying

4. **CORS errors**:
   - Verify `VITE_API_URL` points to correct backend URL
   - Check CORS configuration in FastAPI app

5. **Build failures**:
   - Check Railway build logs
   - Ensure all dependencies are in `requirements.txt`/`package.json`
   - Run `npm run pre-deploy` to validate locally

### Debug Commands

```bash
# View service logs
railway logs --service fastapi-backend
railway logs --service react-frontend

# Open shell in Railway environment
railway shell

# Redeploy service
railway redeploy --service fastapi-backend

# Check service status
railway status
```

## Production Considerations

1. **Environment Variables**:
   - Never commit sensitive data
   - Use Railway's environment variable management

2. **Database**:
   - Add Railway database service if needed
   - Update backend to use database URL

3. **Monitoring**:
   - Use Railway's built-in monitoring
   - Set up health checks

4. **Custom Domains**:
   - Configure custom domains in Railway dashboard
   - Update CORS origins accordingly

## Continuous Deployment

Railway automatically deploys when you push to your connected Git branch:

1. **Automatic Deployments**:
   - Push to main branch triggers deployment
   - Both services deploy independently

2. **Manual Deployments**:
   ```bash
   railway up --service fastapi-backend
   railway up --service react-frontend
   ```

3. **Rollback**:
   - Use Railway dashboard to rollback to previous deployment

## Next Steps

1. **Set up monitoring and alerts**
2. **Configure custom domains**
3. **Add database service if needed**
4. **Set up staging environment**
5. **Configure CI/CD pipelines**

For more information, visit [Railway Documentation](https://docs.railway.app). 