import { Link, Route, Routes } from 'react-router-dom'
import { KeyBanner } from './components/KeyBanner'
import { TooltipProvider } from './components/ui/Tooltip'
import { SyncFooter } from './components/SyncFooter'
import { ChallengePage } from './routes/ChallengePage'
import { ChallengesPage } from './routes/ChallengesPage'
import { MemberPage } from './routes/MemberPage'

export default function App() {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <KeyBanner />
        <header className="border-b border-[var(--hairline)] bg-[var(--card)]/70 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center px-5 sm:px-6">
            <Link to="/" className="font-heading text-lg font-semibold tracking-tight">
              <span className="brand-text">GymRats</span>
            </Link>
          </div>
        </header>
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<ChallengesPage />} />
            <Route path="/c/:id" element={<ChallengePage />} />
            <Route path="/c/:id/m/:memberId" element={<MemberPage />} />
          </Routes>
        </div>
        <SyncFooter />
      </div>
    </TooltipProvider>
  )
}
