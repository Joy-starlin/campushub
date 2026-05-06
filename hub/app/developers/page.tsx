'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Key, 
  Book, 
  FileText,
  Terminal,
  Zap,
  Shield,
  Clock,
  Users,
  Send,
  Play,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  headers?: Array<{
    name: string
    required: boolean
    description: string
  }>
  example?: {
    request?: any
    response: any
  }
}

interface CodeExample {
  language: string
  code: string
  title: string
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/events',
    description: 'Get events with optional filtering',
    parameters: [
      { name: 'university', type: 'string', required: false, description: 'Filter by university slug' },
      { name: 'limit', type: 'number', required: false, description: 'Limit number of results (default: 10)' },
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' }
    ],
    example: {
      request: null,
      response: {
        success: true,
        data: [
          {
            id: '1',
            title: 'Career Fair 2026',
            description: 'Annual career fair with top companies',
            date: '2026-05-15',
            time: '10:00',
            location: 'Main Campus',
            university: 'bugema',
            category: 'career',
            attendees: 250
          }
        ],
        meta: {
          total: 150,
          page: 1,
          limit: 10,
          university: 'bugema'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/events/:id',
    description: 'Get event by ID',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Event ID' }
    ],
    example: {
      response: {
        success: true,
        data: {
          id: '1',
          title: 'Career Fair 2026',
          description: 'Annual career fair with top companies',
          date: '2026-05-15',
          time: '10:00',
          location: 'Main Campus',
          university: 'bugema',
          category: 'career',
          attendees: 250
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/clubs',
    description: 'Get clubs with optional filtering',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Filter by category' },
      { name: 'limit', type: 'number', required: false, description: 'Limit number of results (default: 10)' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/universities',
    description: 'Get all universities',
    example: {
      response: {
        success: true,
        data: [
          {
            id: '1',
            name: 'Bugema University',
            slug: 'bugema',
            description: 'A leading university in Uganda',
            location: 'Kampala, Uganda',
            founded: '1997',
            students: 5000
          }
        ],
        meta: { total: 2 }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/jobs',
    description: 'Get jobs with optional filtering',
    parameters: [
      { name: 'type', type: 'string', required: false, description: 'Filter by job type' },
      { name: 'country', type: 'string', required: false, description: 'Filter by country' },
      { name: 'limit', type: 'number', required: false, description: 'Limit number of results' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/posts',
    description: 'Get posts with optional filtering',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Filter by category' },
      { name: 'limit', type: 'number', required: false, description: 'Limit number of results (default: 20)' },
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/members/count',
    description: 'Get total member count (API key required)',
    headers: [
      { name: 'X-API-Key', required: true, description: 'Your API key' }
    ],
    example: {
      response: {
        success: true,
        data: {
          total: 5000,
          active: 3200,
          new_this_month: 150
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/leaderboard',
    description: 'Get leaderboard with period filtering (API key required)',
    parameters: [
      { name: 'period', type: 'string', required: false, description: 'Filter by period (monthly, weekly, all-time)' }
    ],
    headers: [
      { name: 'X-API-Key', required: true, description: 'Your API key' }
    ]
  },
  {
    method: 'POST',
    path: '/api/v1/developers/register',
    description: 'Register for API key',
    example: {
      request: {
        name: 'John Doe',
        organisation: 'Tech Corp',
        use_case: 'Building a university portal'
      },
      response: {
        success: true,
        data: {
          registration_id: 'uuid-123',
          api_key: 'uuid-456',
          message: 'API key generated successfully'
        }
      }
    }
  }
]

const codeExamples: CodeExample[] = [
  {
    language: 'javascript',
    title: 'JavaScript (Fetch)',
    code: `// Get events with API key
const apiKey = 'your-api-key-here';

fetch('/api/v1/events?university=bugema&limit=5', {
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => response.json())
.then(data => console.log(data));`
  },
  {
    language: 'python',
    title: 'Python (Requests)',
    code: `import requests

# Get events with API key
api_key = 'your-api-key-here'
headers = {'X-API-Key': api_key}

response = requests.get('/api/v1/events?university=bugema&limit=5', headers=headers)
data = response.json()
print(data)`
  },
  {
    language: 'php',
    title: 'PHP (cURL)',
    code: `<?php
// Get events with API key
$apiKey = 'your-api-key-here';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/events?university=bugema&limit=5');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: ' . $apiKey
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
print_r($data);
curl_close($ch);
?>`
  }
]

export default function DevelopersPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleTryEndpoint = async (endpoint: ApiEndpoint) => {
    let url = `http://localhost:3001${endpoint.path}`;
    
    // Replace path parameters with example values
    if (endpoint.path.includes(':id')) {
      url = url.replace(':id', '1');
    }
    
    // Add query parameters for example
    const params = new URLSearchParams();
    if (endpoint.parameters) {
      endpoint.parameters.forEach(param => {
        if (!param.required && param.name === 'university') {
          params.append(param.name, 'bugema');
        } else if (!param.required && param.name === 'limit') {
          params.append(param.name, '5');
        } else if (!param.required && param.name === 'page') {
          params.append(param.name, '1');
        }
      });
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const headers: Record<string, string> = {};
    if (endpoint.headers?.some(h => h.required)) {
      if (!apiKey) {
        toast.error('Please enter an API key to try this endpoint');
        return;
      }
      headers['X-API-Key'] = apiKey;
    }
    
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      // Store the response for display
      setSelectedEndpoint({
        ...endpoint,
        example: {
          ...endpoint.example,
          response: data
        }
      });
    } catch (error) {
      toast.error('Failed to fetch endpoint. Make sure the API server is running.');
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bugema Hub API
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Public REST API for Bugema Hub data
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Key className="w-4 h-4 mr-2" />
              Get API Key
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Modal */}
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowApiKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Enter API Key
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your API Key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Don't have an API key? Register for one below.
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Explorer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Start */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Start
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Get an API Key</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Register for a free API key to access protected endpoints
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Make Requests</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Use the API key in the X-API-Key header for authenticated requests
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Rate Limits</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      100 requests per hour per API key, 15 requests per minute for public endpoints
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                API Endpoints
              </h2>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.path ? null : endpoint.path)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm text-gray-900 dark:text-white">
                            {endpoint.path}
                          </code>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                          expandedEndpoint === endpoint.path ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </button>
                    
                    {expandedEndpoint === endpoint.path && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-4 py-3 border-t border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {endpoint.description}
                        </p>
                        
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Parameters:</h4>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param) => (
                                <div key={param.name} className="flex items-center space-x-2 text-sm">
                                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white">
                                    {param.name}
                                  </code>
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {param.type}
                                  </span>
                                  {param.required && (
                                    <span className="text-red-600 dark:text-red-400">*</span>
                                  )}
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {param.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {endpoint.headers && endpoint.headers.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Headers:</h4>
                            <div className="space-y-2">
                              {endpoint.headers.map((header) => (
                                <div key={header.name} className="flex items-center space-x-2 text-sm">
                                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white">
                                    {header.name}
                                  </code>
                                  {header.required && (
                                    <span className="text-red-600 dark:text-red-400">*</span>
                                  )}
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {header.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleTryEndpoint(endpoint)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            <Play className="w-3 h-3 mr-1 inline" />
                            Try It
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Response Display */}
            {selectedEndpoint && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    API Response
                  </h3>
                  <button
                    onClick={() => setSelectedEndpoint(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <code className="text-sm text-gray-900 dark:text-white">
                      {selectedEndpoint.path}
                    </code>
                  </div>
                </div>
                
                <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    {JSON.stringify(selectedEndpoint.example?.response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Code Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Code Examples
              </h3>
              
              <div className="space-y-2 mb-4">
                {codeExamples.map((example) => (
                  <button
                    key={example.language}
                    onClick={() => setSelectedLanguage(example.language)}
                    className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                      selectedLanguage === example.language
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {example.title}
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Code</span>
                  <button
                    onClick={() => handleCopyCode(codeExamples.find(e => e.language === selectedLanguage)?.code || '')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {codeExamples.find(e => e.language === selectedLanguage)?.code}
                </pre>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Rate Limits
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Public Endpoints</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      15 requests per minute per IP
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">API Key Endpoints</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      100 requests per hour per API key
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Rate limit headers are included in all responses
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Register for API Key
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organisation *
                  </label>
                  <input
                    type="text"
                    placeholder="Your organisation"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Use Case *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how you plan to use the API"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </form>
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Support
              </h3>
              
              <div className="space-y-3">
                <a
                  href="mailto:api@bugema.ac.ug"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <Mail className="w-4 h-4" />
                  <span>api@bugema.ac.ug</span>
                </a>
                
                <a
                  href="tel:+256123456789"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <Phone className="w-4 h-4" />
                  <span>+256 123 456 789</span>
                </a>
                
                <a
                  href="https://github.com/bugema-hub/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <Code className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
