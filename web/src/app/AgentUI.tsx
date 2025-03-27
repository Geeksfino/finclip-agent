import { useState, useEffect } from 'react'
import { FloatingChatWidget } from '../components/FloatingChatWidget'

interface BrainContent {
  name: string;
  role: string;
  goal: string;
  capabilities: string[];
  guidelines: string[];
  example?: string;
}

interface McpStatus {
  hasMcpPreproc: boolean;
  hasMcpConfig: boolean;
}

export function AgentUI() {
  const [brainContent, setBrainContent] = useState<BrainContent>({
    name: 'Chatbot',
    role: 'Friendly conversation partner',
    goal: 'Engage in natural, open-ended dialogue about any topic the user chooses',
    capabilities: [
      'Fluid conversational skills across all subjects',
      'Basic emotional understanding and empathetic responses',
      'Light humor when appropriate',
      'Adaptive communication style'
    ],
    guidelines: [
      'Initiate and maintain natural dialogue flow',
      'Show interest in user\'s messages through engaged responses',
      'Avoid technical/domain-specific discussions unless prompted',
      'Never decline any conversation topic',
      'Keep responses concise (1-3 sentences typically)',
      'Use casual but grammatically correct language'
    ],
    example: 'User: "The weather\'s terrible today"\nChatAgent: "Oh I know! This rain just won\'t quit. Perfect day for staying in with a book though - what are you up to today?"'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDefaultBrain, setIsUsingDefaultBrain] = useState(false);
  const [mcpStatus, setMcpStatus] = useState<McpStatus>({ hasMcpPreproc: false, hasMcpConfig: false });
  
  // Custom suggestions for the chat widget
  const customSuggestions = [
    "How can you help me today?",
    "What topics can we discuss?",
    "Tell me a joke",
    "What's the weather like?"
  ];

  useEffect(() => {
    // Fetch brain.md content from the API endpoint
    fetch('/api/brain')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load agent configuration');
        }
        return response.json();
      })
      .then(data => {
        if (data.content) {
          const parsedContent = parseBrainMd(data.content);
          setBrainContent(prevContent => ({
            ...prevContent,
            ...parsedContent
          }));
          
          // Set the flag if we're using the default brain.md
          if (data.isUsingDefaultBrain) {
            setIsUsingDefaultBrain(true);
          }
          
          // Set MCP configuration status
          if (data.mcpStatus) {
            setMcpStatus({
              hasMcpPreproc: data.mcpStatus.hasMcpPreproc || false,
              hasMcpConfig: data.mcpStatus.hasMcpConfig || false
            });
          }
        }
      })
      .catch(err => {
        console.error('Error loading brain.md:', err);
        setError('Could not load agent configuration. Using default values.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Function to parse brain.md content
  function parseBrainMd(content: string): Partial<BrainContent> {
    const result: Partial<BrainContent> = {};
    
    try {
      // Extract content between --- markers (YAML frontmatter)
      const match = content.match(/---\n([\s\S]*?)\n---/);
      if (match && match[1]) {
        const yamlContent = match[1];
        
        // Extract name
        const nameMatch = yamlContent.match(/name:\s*"([^"]*)"/);
        if (nameMatch && nameMatch[1]) {
          result.name = nameMatch[1];
        }
        
        // Extract role
        const roleMatch = yamlContent.match(/role:\s*>-\s*(.*?)(?=\n\w|$)/s);
        if (roleMatch && roleMatch[1]) {
          result.role = roleMatch[1].trim();
        }
        
        // Extract goal
        const goalMatch = yamlContent.match(/goal:\s*>-\s*(.*?)(?=\n\w|$)/s);
        if (goalMatch && goalMatch[1]) {
          result.goal = goalMatch[1].trim();
        }
        
        // Extract capabilities list
        const capabilitiesMatch = yamlContent.match(/capabilities:\s*>-\s*([\s\S]*?)(?=\n\w|$)/);
        if (capabilitiesMatch && capabilitiesMatch[1]) {
          result.capabilities = capabilitiesMatch[1]
            .split('\n')
            .filter(line => line.trim().startsWith('-'))
            .map(line => line.trim().substring(1).trim());
        }
        
        // Extract guidelines
        const guidelinesMatch = yamlContent.match(/guidelines:\s*([\s\S]*?)(?=\n\w|$)/);
        if (guidelinesMatch && guidelinesMatch[1]) {
          result.guidelines = guidelinesMatch[1]
            .split('\n')
            .filter(line => /^\s*\d+\./.test(line))
            .map(line => line.replace(/^\s*\d+\.\s*/, '').trim());
        }
        
        // Extract example interaction
        const exampleMatch = yamlContent.match(/Example interaction:([\s\S]*?)(?=\n---|\s*$)/);
        if (exampleMatch && exampleMatch[1]) {
          result.example = exampleMatch[1].trim();
        }
      }
    } catch (err) {
      console.error('Error parsing brain.md:', err);
    }
    
    return result;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Agent Inspector</h1>
          {loading && <p className="text-sm text-gray-500">Loading agent configuration...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <div className="space-y-3">
            {/* Brain.md status */}
            <div className="flex items-center">
              <div className="mr-2">
                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${isUsingDefaultBrain ? 'bg-amber-100' : 'bg-green-100'}`}>
                  {isUsingDefaultBrain ? (
                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </div>
              <span className="text-sm font-medium">
                {isUsingDefaultBrain 
                  ? "No brain.md found in current directory. Using default from module." 
                  : "Using brain.md from current working directory."}
              </span>
            </div>
            
            {/* MCP Preprocessor status */}
            <div className="flex items-center">
              <div className="mr-2">
                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${mcpStatus.hasMcpPreproc ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {mcpStatus.hasMcpPreproc ? (
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
              </div>
              <span className="text-sm font-medium">
                {mcpStatus.hasMcpPreproc 
                  ? "Query Preprocessor configured (conf/preproc-mcp.json)" 
                  : "No Query Preprocessor in use"}
              </span>
            </div>
            
            {/* MCP Config status */}
            <div className="flex items-center">
              <div className="mr-2">
                <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${mcpStatus.hasMcpConfig ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {mcpStatus.hasMcpConfig ? (
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
              </div>
              <span className="text-sm font-medium">
                {mcpStatus.hasMcpConfig 
                  ? "MCP Configuration found (conf/mcp_config.json)" 
                  : "No MCP Servers in use"}
              </span>
            </div>
          </div>
          
          {isUsingDefaultBrain && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700 font-medium">Attention</p>
                  <p className="text-sm text-amber-700 mt-1">
                    You're currently using the default brain.md from the CxAgent module. To customize your agent's behavior, create a{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded">brain.md</code> file in your current working directory.
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    Run <code className="bg-amber-100 px-1 py-0.5 rounded">{`echo "---
name: \"My Custom Agent\"
---" > brain.md`}</code> to create a basic file, then customize it to your needs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brain.md content with nice layout */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700">Agent Profile</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-semibold w-20">Name:</span>
                  <span className="text-gray-700">{brainContent.name}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-20">Role:</span>
                  <span className="text-gray-700">{brainContent.role}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold w-20">Goal:</span>
                  <span className="text-gray-700">{brainContent.goal}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-medium text-xl text-green-800 mb-3">Capabilities</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {brainContent.capabilities.map((capability, index) => (
                  <li key={index}>{capability}</li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-medium text-xl text-purple-800 mb-3">Guidelines</h3>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                {brainContent.guidelines.map((guideline, index) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ol>
            </div>

            {brainContent.example && (
              <div className="bg-amber-50 p-6 rounded-lg">
                <h3 className="font-medium text-xl text-amber-800 mb-3">Example Interaction</h3>
                <div className="space-y-2 text-gray-700">
                  {brainContent.example.split('\n').map((line, index) => {
                    if (line.startsWith('User:')) {
                      return (
                        <div key={index} className="bg-gray-100 p-2 rounded">
                          <span className="font-semibold">{line.split(':')[0]}:</span>
                          {line.substring(line.indexOf(':') + 1)}
                        </div>
                      );
                    } else if (line.startsWith('ChatAgent:')) {
                      return (
                        <div key={index} className="bg-blue-100 p-2 rounded">
                          <span className="font-semibold">{line.split(':')[0]}:</span>
                          {line.substring(line.indexOf(':') + 1)}
                        </div>
                      );
                    } else {
                      return <div key={index}>{line}</div>;
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Floating Chat Widget with custom suggestions and label */}
      <FloatingChatWidget 
        buttonLabel="Let's chat" 
        suggestions={customSuggestions}
        suggestionsLabel="Try asking me something 👋"
        apiUrl="http://localhost:5678"
        streamingUrl="http://localhost:5679"
      />
    </div>
  )
}
