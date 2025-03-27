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
          <h1 className="text-3xl font-bold text-gray-900">Customer Experience Agent</h1>
          {loading && <p className="text-sm text-gray-500">Loading agent configuration...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Your AI Conversation Partner</h2>
          <p className="text-gray-700 mb-6 text-lg">
            Welcome to the CxAgent demo! This AI-powered customer experience agent is designed to engage in natural, 
            open-ended conversations on any topic you choose. Click the chat button in the bottom right corner to start a conversation.
          </p>
          <p className="text-gray-700 mb-8 text-lg">
            Built on the actgent framework, this agent can be embedded in any website and configured to access knowledge bases 
            through the Model Context Protocol (MCP).
          </p>
        </div>

        {/* Brain.md content with nice layout */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700">Agent Capabilities</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-medium text-xl text-blue-800 mb-3">Agent Profile</h3>
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
