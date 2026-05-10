import { Suspense } from 'react'
import SearchResultsPage from '../../components/SearchResultsPage'

function SearchFallback() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 animate-pulse font-medium">Loading search...</p>
    </div>
  )
}

export default function Search() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResultsPage />
    </Suspense>
  )
}
