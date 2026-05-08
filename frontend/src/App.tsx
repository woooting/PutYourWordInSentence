import { useEffect, useState } from 'react'
import { fetchHealth } from './lib/api'

function App() {
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    fetchHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          English Sentence Builder
        </h1>
        <p className="text-lg text-gray-600">
          Backend status:{' '}
          <span
            className={`font-mono font-semibold ${
              status === 'ok' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status}
          </span>
        </p>
      </div>
    </div>
  )
}

export default App
