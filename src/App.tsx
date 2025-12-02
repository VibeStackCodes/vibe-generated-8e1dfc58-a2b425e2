import { Outlet, useLocation, Link } from 'react-router-dom'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { VibeStackBadge } from '@/components/vibestack-badge'

/**
 * Main App component with routing
 * Uses React Router for SPA navigation
 */
function App() {
  const location = useLocation()

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }
      >
        {/* Navigation */}
        <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link
                to="/"
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#4B2FFF] transition-colors"
              >
                NoTODO
              </Link>
              <div className="flex gap-2">
                <Link
                  to="/"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-[#4B2FFF] text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/inbox"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === '/inbox'
                      ? 'bg-[#4B2FFF] text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  📥 Inbox
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Outlet />
      </Suspense>
      <VibeStackBadge />
    </ErrorBoundary>
  )
}

export default App
