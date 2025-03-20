import { FloatingChatWidget } from '../components/FloatingChatWidget'

export function DemoPage() {
  // Custom suggestions for the chat widget
  const customSuggestions = [
    "Tell me about FinClip's mini-program features",
    "How can I integrate FinClip with my existing app?",
    "What are the security features of FinClip?",
    "How does FinClip compare to other SuperApp platforms?"
  ]
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">FinClip Demo Page</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome to FinClip</h2>
          <p className="text-gray-600 mb-4">
            This is a demonstration of our embedded chat widget. Click the chat button in the bottom right corner to try it out.
          </p>
          <p className="text-gray-600 mb-4">
            FinClip is a SuperApp platform that enables businesses to deliver mini-program experiences to their customers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg text-blue-800 mb-2">SuperApp Platform</h3>
              <p className="text-blue-600">Build your own ecosystem of mini-programs and services.</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg text-green-800 mb-2">Mini-Program Technology</h3>
              <p className="text-green-600">Create lightweight applications that run inside your main app.</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg text-purple-800 mb-2">Cross-Platform</h3>
              <p className="text-purple-600">Deploy once, run everywhere - iOS, Android, and Web.</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-medium text-lg text-orange-800 mb-2">Enterprise Ready</h3>
              <p className="text-orange-600">Secure, scalable, and compliant with enterprise requirements.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Chat Widget with custom suggestions and label */}
      <FloatingChatWidget 
        buttonLabel="Ask FinClip" 
        suggestions={customSuggestions}
        suggestionsLabel="Questions about FinClip 👋"
        apiUrl="http://localhost:5678"
        streamingUrl="http://localhost:5679"
      />
    </div>
  )
}
