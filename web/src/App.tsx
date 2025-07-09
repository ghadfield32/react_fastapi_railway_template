import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import reactLogo from './assets/react.svg';
import './App.css';

/* ── helper: always hit FastAPI ───────────────────────────────────────────── */
const buildUrl = (endpoint: string) => {
  // dev → proxy (prefix /api if caller forgot it); prod → absolute URL
  if (import.meta.env.DEV) {
    return endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  }
  return `${import.meta.env.VITE_API_URL}${endpoint}`;
};

interface PredictionResponse {
  prediction: string;
  confidence: number;
  input_received: {
    count: number;
  };
}

export default function App() {
  const { token, logout } = useAuth();
  const [count, setCount] = useState(0);
  const [apiMessage, setApiMessage] = useState('');
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const fetchJson = async <T,>(endpoint: string, init?: RequestInit): Promise<T> => {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(buildUrl(endpoint), { ...init, headers });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
  };

  /* ── after login, load greeting ─────────────────────────────────────────── */
  useEffect(() => {
    if (!token) return;
    fetchJson<{ message: string }>('/api/hello')
      .then(({ message }) => setApiMessage(message))
      .catch((err) => setError(err.message));
  }, [token]);

  if (!token) return <Login />;

  return (
    <>
      <div>
        <img src="/vite.svg" className="logo" alt="Vite logo" />
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>FastAPI + React + Railway</h1>

      <div className="card">
        <h2>🔗 API Connection</h2>
        {error && <p style={{ color: 'red' }}>❌ {error}</p>}
        {apiMessage && <p style={{ color: 'green' }}>✅ {apiMessage}</p>}

        <button onClick={logout}>Logout</button>
        <button onClick={() => setCount((c) => c + 1)}>Count {count}</button>
        <button
          onClick={() =>
            fetchJson<PredictionResponse>('/api/predict', {
              method: 'POST',
              body: JSON.stringify({ data: { count } })
            })
              .then((r) => {
                setPrediction(r);
                setError('');
              })
              .catch((e) => {
                setError(e.message);
                setPrediction(null);
              })
          }
        >
          Test Prediction
        </button>

        {prediction && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h3>Prediction Results</h3>
            <p>Input count: {prediction.input_received.count}</p>
            <p>Prediction: {prediction.prediction}</p>
            <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>
    </>
  );
}
