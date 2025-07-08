import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface ApiResponse {
  message: string
}

interface AppInfo {
  app_name: string
  version: string
  environment: string
  railway_environment?: string
  python_version: string
}

interface PredictionRequest {
  data: Record<string, any>
}

interface PredictionResponse {
  prediction: any
  confidence: number
  model_version: string
}

function App() {
  const [count, setCount] = useState(0)
  const [apiMessage, setApiMessage] = useState<string>('')
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null)

  // Get API URL from environment variable with fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fastapi-production-1d13.up.railway.app'
  const getApiUrl = (endpoint: string) => {
    // In development, use proxy path
    if (import.meta.env.DEV) {
      return endpoint
    }
    // In production, use full URL - ensure we have a valid base URL
    const baseUrl = API_BASE_URL || 'https://fastapi-production-1d13.up.railway.app'
    return `${baseUrl}${endpoint}`
  }

  console.log('🔍 App Debug Info:')
  console.log('Mode:', import.meta.env.MODE)
  console.log('DEV:', import.meta.env.DEV)
  console.log('PROD:', import.meta.env.PROD)
  console.log('API_BASE_URL:', API_BASE_URL)
  
  // Add comprehensive debugging
  console.log('🔍 COMPREHENSIVE DEBUG INFO:')
  console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL)
  console.log('typeof import.meta.env.VITE_API_URL:', typeof import.meta.env.VITE_API_URL)
  console.log('API_BASE_URL length:', API_BASE_URL.length)
  console.log('API_BASE_URL === "":', API_BASE_URL === '')
  console.log('Sample API URL generation:')
  console.log('  /api/hello ->', getApiUrl('/api/hello'))
  console.log('  /api/predict ->', getApiUrl('/api/predict'))
  console.log('Current window.location:', window.location.href)
  console.log('All import.meta.env keys:', Object.keys(import.meta.env))
  console.log('All import.meta.env values:', import.meta.env)

  // Fetch API message on component mount
  useEffect(() => {
    fetchApiMessage()
    fetchAppInfo()
  }, [])

  const fetchApiMessage = async () => {
    try {
      setIsLoading(true)
      setError('')
      const url = getApiUrl('/api/hello')
      console.log('🔍 DEBUG: Fetching from URL:', url)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ApiResponse = await response.json()
      setApiMessage(data.message)
    } catch (err) {
      setError(`Failed to fetch API message: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Error fetching API message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAppInfo = async () => {
    try {
      const url = getApiUrl('/api/info')
      console.log('🔍 DEBUG: Fetching app info from URL:', url)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: AppInfo = await response.json()
      setAppInfo(data)
    } catch (err) {
      console.error('Error fetching app info:', err)
    }
  }

  const testPrediction = async () => {
    try {
      setIsLoading(true)
      setError('')
      const requestData: PredictionRequest = {
        data: {
          feature1: Math.random(),
          feature2: Math.random(),
          feature3: count
        }
      }
      
      const url = getApiUrl('/api/predict')
      console.log('🔍 DEBUG: Making prediction request to:', url)
      console.log('🔍 DEBUG: Request data:', requestData)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('🔍 DEBUG: Response status:', response.status)
      console.log('🔍 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        // Get the response text to see what error we're getting
        const errorText = await response.text()
        console.log('🔍 DEBUG: Error response text:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`)
      }
      
      // Get the response as text first to see what we're actually getting
      const responseText = await response.text()
      console.log('🔍 DEBUG: Raw response text:', responseText)
      
      // Try to parse it as JSON
      let data: PredictionResponse
      try {
        data = JSON.parse(responseText)
        console.log('🔍 DEBUG: Successfully parsed JSON:', data)
      } catch (parseError) {
        console.error('🔍 DEBUG: JSON parse error:', parseError)
        console.error('🔍 DEBUG: Response text that failed to parse:', responseText)
        throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}. Response was: ${responseText}`)
      }
      
      setPredictionResult(data)
    } catch (err) {
      setError(`Prediction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('🔍 DEBUG: Full error object:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a diagnostic function to test the API connection
  const runDiagnostics = async () => {
    console.log('🔍 RUNNING API DIAGNOSTICS...')
    
    // Test 1: Check what URL we're actually calling
    const testUrl = getApiUrl('/api/health')
    console.log('🔍 DIAGNOSTIC: Health check URL:', testUrl)
    
    try {
      const response = await fetch(testUrl)
      console.log('🔍 DIAGNOSTIC: Health check response status:', response.status)
      console.log('🔍 DIAGNOSTIC: Health check response headers:', Object.fromEntries(response.headers.entries()))
      
      const text = await response.text()
      console.log('🔍 DIAGNOSTIC: Health check response text:', text)
      
      // Try to parse as JSON
      try {
        const json = JSON.parse(text)
        console.log('🔍 DIAGNOSTIC: Health check JSON:', json)
      } catch (e) {
        console.log('🔍 DIAGNOSTIC: Health check response is not JSON')
      }
    } catch (error) {
      console.error('🔍 DIAGNOSTIC: Health check failed:', error)
    }
    
    // Test 2: Check CORS preflight
    console.log('🔍 DIAGNOSTIC: Testing CORS preflight...')
    try {
      const corsResponse = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      })
      console.log('🔍 DIAGNOSTIC: CORS preflight status:', corsResponse.status)
      console.log('🔍 DIAGNOSTIC: CORS preflight headers:', Object.fromEntries(corsResponse.headers.entries()))
    } catch (error) {
      console.error('🔍 DIAGNOSTIC: CORS preflight failed:', error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>FastAPI + React + Railway</h1>
      
      {/* API Connection Status */}
      <div className="card">
        <h2>🔗 API Connection</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>❌ {error}</p>}
        {apiMessage && <p style={{ color: 'green' }}>✅ {apiMessage}</p>}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={fetchApiMessage} disabled={isLoading}>
            Test API Connection
          </button>
          <button onClick={runDiagnostics} disabled={isLoading}>
            Run Diagnostics
          </button>
        </div>
      </div>

      {/* App Info */}
      {appInfo && (
        <div className="card">
          <h2>📋 App Information</h2>
          <ul style={{ textAlign: 'left' }}>
            <li><strong>App:</strong> {appInfo.app_name}</li>
            <li><strong>Version:</strong> {appInfo.version}</li>
            <li><strong>Environment:</strong> {appInfo.environment}</li>
            {appInfo.railway_environment && (
              <li><strong>Railway Environment:</strong> {appInfo.railway_environment}</li>
            )}
            <li><strong>Python Version:</strong> {appInfo.python_version}</li>
          </ul>
        </div>
      )}

      {/* Counter Demo */}
      <div className="card">
        <h2>🔢 Counter Demo</h2>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* ML Prediction Demo */}
      <div className="card">
        <h2>🤖 ML Prediction Demo</h2>
        <button onClick={testPrediction} disabled={isLoading}>
          {isLoading ? 'Making Prediction...' : 'Test ML Prediction'}
        </button>
        {predictionResult && (
          <div style={{ marginTop: '1rem', textAlign: 'left' }}>
            <h3>Prediction Result:</h3>
            <ul>
              <li><strong>Prediction:</strong> {predictionResult.prediction}</li>
              <li><strong>Confidence:</strong> {(predictionResult.confidence * 100).toFixed(1)}%</li>
              <li><strong>Model Version:</strong> {predictionResult.model_version}</li>
            </ul>
          </div>
        )}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
