'use client'

import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Loader,
  Eye,
  FileText,
  Share,
  Printer
} from 'lucide-react'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

interface PDFViewerProps {
  fileUrl: string
  fileName: string
  title?: string
  className?: string
  onDownload?: () => void
  onShare?: () => void
}

export default function PDFViewer({
  fileUrl,
  fileName,
  title,
  className = '',
  onDownload,
  onShare
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  useEffect(() => {
    setPageNumber(1)
    setScale(1.0)
    setIsLoading(true)
    setError(null)
  }, [fileUrl])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error: any) => {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. Please try again.')
    setIsLoading(false)
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset
      return Math.min(Math.max(1, newPageNumber), numPages)
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5))
  }

  const resetZoom = () => {
    setScale(1.0)
  }

  const fitToWidth = () => {
    // This would need to be implemented based on container width
    setScale(1.0)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      previousPage()
    } else if (e.key === 'ArrowRight') {
      nextPage()
    } else if (e.key === '+' || e.key === '=') {
      zoomIn()
    } else if (e.key === '-' || e.key === '_') {
      zoomOut()
    } else if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          PDF Load Error
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                {title || fileName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Page {pageNumber} of {numPages} • {Math.round(scale * 100)}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-l-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-r-lg"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Print"
            >
              <Printer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Share"
              >
                <Share className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
        <div className={`${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px] lg:h-[600px]'} overflow-auto bg-gray-100 dark:bg-gray-900`}>
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading PDF...</p>
              </div>
            </div>
          )}
          
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div />}
            error={<div />}
            className="flex justify-center py-8"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-lg"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        {/* Navigation Controls */}
        {!isLoading && numPages > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center space-x-2 px-2">
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= numPages) {
                    setPageNumber(page)
                  }
                }}
                className="w-12 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                min={1}
                max={numPages}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">/ {numPages}</span>
            </div>
            
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Keyboard shortcuts:</span>
          <span>← → Navigate pages</span>
          <span>+ - Zoom</span>
          <span>ESC Exit fullscreen</span>
        </div>
      </div>
    </div>
  )
}

// PDF Thumbnail Component
export function PDFThumbnail({
  fileUrl,
  pageNumber,
  scale = 0.3,
  onClick
}: {
  fileUrl: string
  pageNumber: number
  scale?: number
  onClick?: () => void
}) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div 
      className="relative cursor-pointer group hover:opacity-80 transition-opacity"
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      )}
      <Document
        file={fileUrl}
        loading={<div />}
        error={<div />}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          className="rounded border border-gray-300 dark:border-gray-600"
          onRenderSuccess={() => setIsLoading(false)}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 rounded-b">
        Page {pageNumber}
      </div>
    </div>
  )
}

// PDF Info Component
export function PDFInfo({
  fileName,
  fileSize,
  uploadDate,
  pageCount
}: {
  fileName: string
  fileSize: string
  uploadDate: string
  pageCount: number
}) {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4" />
        <span>{fileName}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Eye className="w-4 h-4" />
        <span>{pageCount} pages</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>{fileSize}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>Uploaded {uploadDate}</span>
      </div>
    </div>
  )
}
