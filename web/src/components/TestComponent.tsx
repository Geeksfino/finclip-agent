// No need to import React with modern JSX transform

export function TestComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">CxAgent UI Test</h1>
        <p className="mb-4">
          If you can see this component, the basic rendering is working correctly.
        </p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  )
}
