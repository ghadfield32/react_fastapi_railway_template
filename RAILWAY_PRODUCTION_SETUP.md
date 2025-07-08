# Railway Production Setup Guide

## 🚀 Current Deployment Status

- **Frontend**: `https://react-frontend-production-2805.up.railway.app`
- **Backend**: `https://fastapi-production-1d13.up.railway.app`

## 📋 Configuration Steps

### 1. Backend Configuration (Already Done)

The backend is configured to accept requests from your frontend domain:

```python
# CORS configuration includes your frontend URL
railway_frontend_url = "https://react-frontend-production-2805.up.railway.app"
origins.append(railway_frontend_url)
```

### 2. Frontend Environment Variable Setup

**In Railway Dashboard:**

1. Go to your **Frontend Service** (`react-frontend-production-2805`)
2. Navigate to **Variables** tab
3. Add this environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://fastapi-production-1d13.up.railway.app`

**Alternative via Railway CLI:**
```bash
railway variables set VITE_API_URL https://fastapi-production-1d13.up.railway.app --service react-frontend-production-2805
```

### 3. Local Development Setup

Create a `.env.development.local` file in the `frontend/` directory:
```env
VITE_API_URL=http://127.0.0.1:8000
```

## 🔧 How It Works

### Development Mode
- Uses Vite proxy to forward `/api/*` requests to `http://127.0.0.1:8000`
- CORS is set to `*` (permissive) for easier debugging

### Production Mode
- Frontend makes direct requests to `https://fastapi-production-1d13.up.railway.app`
- Backend CORS is configured to allow only your frontend domain
- Environment variable `VITE_API_URL` is injected at build time

## 🧪 Testing the Setup

### 1. Test Local Development
```bash
# Start both servers
npm run dev

# Or start individually
npm run dev:backend  # Backend on http://127.0.0.1:8000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 2. Test Production Build Locally
```bash
# Build with production settings
cd frontend
npm run build

# Serve the built files
npx serve -s dist -l 3000

# Check that API calls go to production backend
```

### 3. Test Production Deployment

1. **Deploy Backend** (if not already deployed):
   ```bash
   railway up --service backend
   ```

2. **Deploy Frontend** with environment variable:
   ```bash
   railway variables set VITE_API_URL https://fastapi-production-1d13.up.railway.app --service frontend
   railway up --service frontend
   ```

## 🔍 Debugging

### Check Environment Variables
- **Development**: Check browser console for "App Debug Info"
- **Production**: Check Railway build logs for environment variable injection

### Check API Calls
- **Development**: Network tab should show requests to `localhost:5173/api/*`
- **Production**: Network tab should show requests to `https://fastapi-production-1d13.up.railway.app/api/*`

### Check CORS
- **Development**: Should allow all origins (`*`)
- **Production**: Should only allow your frontend domain

## 🚨 Common Issues

### 1. CORS Errors in Production
- **Symptom**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- **Solution**: Ensure backend CORS includes your exact frontend URL

### 2. Environment Variable Not Set
- **Symptom**: API calls go to wrong URL or fail
- **Solution**: Set `VITE_API_URL` in Railway dashboard and redeploy

### 3. Build-time vs Runtime Variables
- **Note**: `VITE_*` variables are injected at **build time**, not runtime
- **Solution**: Redeploy frontend after changing environment variables

## 📊 Current Configuration

### Backend CORS Origins
```python
origins = [
    # Development
    "http://localhost:5173",
    "http://127.0.0.1:8000",
    
    # Production
    "https://react-frontend-production-2805.up.railway.app",
    
    # Environment-based (development = "*")
]
```

### Frontend API URL Logic
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const getApiUrl = (endpoint: string) => {
  // Development: use proxy path
  if (import.meta.env.DEV) {
    return endpoint  // e.g., "/api/predict"
  }
  // Production: use full URL
  return `${API_BASE_URL}${endpoint}`  // e.g., "https://fastapi-production-1d13.up.railway.app/api/predict"
}
```

## ✅ Verification Checklist

- [ ] Backend deployed and accessible at `https://fastapi-production-1d13.up.railway.app/api/health`
- [ ] Frontend deployed and accessible at `https://react-frontend-production-2805.up.railway.app`
- [ ] Environment variable `VITE_API_URL` set in Railway dashboard
- [ ] Frontend redeployed after setting environment variable
- [ ] API calls work without CORS errors
- [ ] ML Prediction button works in production
- [ ] No JSON parse errors in browser console

## 🎯 Next Steps

1. **Set the environment variable** in Railway dashboard
2. **Redeploy the frontend** service
3. **Test the production deployment** by visiting your frontend URL
4. **Check browser console** for any errors or debug information
5. **Verify API calls** in Network tab of DevTools 