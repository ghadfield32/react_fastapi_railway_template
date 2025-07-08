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

  // Fetch API message on component mount
  useEffect(() => {
    fetchApiMessage()
    fetchAppInfo()
  }, [])

  const fetchApiMessage = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetch('/api/hello')
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
      const response = await fetch('/api/info')
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
      
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: PredictionResponse = await response.json()
      setPredictionResult(data)
    } catch (err) {
      setError(`Prediction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      console.error('Error making prediction:', err)
    } finally {
      setIsLoading(false)
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
        <button onClick={fetchApiMessage} disabled={isLoading}>
          Test API Connection
        </button>
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
