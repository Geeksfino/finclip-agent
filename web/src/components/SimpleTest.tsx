export function SimpleTest() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f0f0' 
    }}>
      <div style={{ 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>Simple Test Component</h1>
        <p>If you can see this, basic rendering is working correctly.</p>
        <button 
          style={{ 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
          onClick={() => alert('Button clicked!')}
        >
          Click Me
        </button>
      </div>
    </div>
  )
}
