import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, FileCode, Code2, Variable } from 'lucide-react';

interface CodeContextPanelProps {
  codeMentions: string[];
}

interface CodeReference {
  type: 'file' | 'function' | 'variable';
  name: string;
  location: string;
  description: string;
  snippet?: string;
}

export const CodeContextPanel: React.FC<CodeContextPanelProps> = ({ codeMentions }) => {
  const [selectedReference, setSelectedReference] = useState<CodeReference | null>(null);

  // Mock code references based on mentions
  const codeReferences: CodeReference[] = codeMentions.map(mention => {
    if (mention.includes('.js') || mention.includes('.ts')) {
      return {
        type: 'file',
        name: mention,
        location: `src/utils/${mention}`,
        description: 'Utility functions for common operations',
        snippet: `// ${mention}\nexport const debounce = (func, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => func.apply(null, args), delay);\n  };\n};`
      };
    } else if (mention.includes('function')) {
      return {
        type: 'function',
        name: mention,
        location: 'src/utils/utils.js',
        description: 'Delays function execution until after specified time',
        snippet: `const debounce = (func, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => func.apply(null, args), delay);\n  };\n};`
      };
    } else {
      return {
        type: 'variable',
        name: mention,
        location: 'Multiple locations',
        description: 'Referenced in the current discussion',
      };
    }
  });

  const getIcon = (type: CodeReference['type']) => {
    switch (type) {
      case 'file': return <FileCode className="w-4 h-4" />;
      case 'function': return <Code2 className="w-4 h-4" />;
      case 'variable': return <Variable className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: CodeReference['type']) => {
    switch (type) {
      case 'file': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'function': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'variable': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    }
  };

  return (
    <div className="h-96 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400">
          {codeReferences.length} references detected
        </span>
      </div>

      {codeReferences.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <FileCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No code mentions detected yet</p>
            <p className="text-sm mt-1">Start your pair programming session</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-4">
          {/* References List */}
          <div className="w-1/2">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {codeReferences.map((ref, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto ${
                      selectedReference === ref 
                        ? 'bg-slate-700/50 border border-slate-600' 
                        : 'hover:bg-slate-700/30'
                    }`}
                    onClick={() => setSelectedReference(ref)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`p-1 rounded ${getTypeColor(ref.type)}`}>
                        {getIcon(ref.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-white truncate">
                          {ref.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {ref.location}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator orientation="vertical" className="bg-slate-600" />

          {/* Reference Details */}
          <div className="w-1/2">
            {selectedReference ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getTypeColor(selectedReference.type)}>
                      {selectedReference.type}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-white">{selectedReference.name}</h3>
                  <p className="text-sm text-slate-400">{selectedReference.location}</p>
                </div>
                
                <p className="text-sm text-slate-300">{selectedReference.description}</p>
                
                {selectedReference.snippet && (
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-2">Code Preview:</p>
                    <pre className="text-xs text-slate-300 overflow-x-auto">
                      <code>{selectedReference.snippet}</code>
                    </pre>
                  </div>
                )}

                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  Explain in Chat
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p className="text-sm">Select a reference to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
