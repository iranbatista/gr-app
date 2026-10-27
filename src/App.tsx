import { Link, Route, Routes } from 'react-router-dom'
import { KeyBanner } from './components/KeyBanner'
import { SyncFooter } from './components/SyncFooter'
import { ChallengesPage } from './routes/ChallengesPage'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <KeyBanner />
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Link to="/" className="text-lg font-bold text-orange-600">
            GymRats
          </Link>
        </div>
      </header>
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<ChallengesPage />} />
        </Routes>
      </div>
      <SyncFooter />
    </div>
  )
}
