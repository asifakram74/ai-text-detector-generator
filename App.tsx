import React, { useState } from 'react';
import { ShieldCheck, History } from 'lucide-react';
import { analyzeContent } from './services/geminiService';
import { AnalysisResult, HistoryItem } from './types';
import InputForm from './components/InputForm';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleAnalyze = async (text: string, config: any) => {
    setIsLoading(true);
    try {
      const analysis = await analyzeContent(text, config);
      setResult(analysis);

      // Add to history
      const newHistoryItem: HistoryItem = {
        ...analysis,
        id: Date.now().toString(),
        timestamp: Date.now(),
        preview: text.substring(0, 60) + (text.length > 60 ? '...' : '')
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10
    } catch (error) {
      alert("Failed to analyze content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 print:bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
              <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-2 rounded-lg text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
                Veritas AI
              </span>
            </div>
            
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative"
            >
              <History className="w-6 h-6" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Print padding adjustments */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative print:p-0 print:w-full print:max-w-none">
        
        {/* History Sidebar/Dropdown - simplistic implementation for SPA */}
        {showHistory && (
           <div className="absolute right-4 top-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-40 overflow-hidden animate-fade-in-down print:hidden">
             <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
               Recent Analyses
             </div>
             <div className="max-h-96 overflow-y-auto">
               {history.length === 0 ? (
                 <div className="p-6 text-center text-gray-400 text-sm">No history yet.</div>
               ) : (
                 history.map(item => (
                   <div 
                    key={item.id} 
                    onClick={() => loadFromHistory(item)}
                    className="p-4 border-b border-gray-50 hover:bg-indigo-50 cursor-pointer transition-colors group"
                   >
                     <div className="flex justify-between items-start mb-1">
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                         item.verdict === 'AI' ? 'bg-red-100 text-red-600' : 
                         item.verdict === 'HUMAN' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                       }`}>
                         {item.verdict}
                       </span>
                       <span className="text-xs text-gray-400">
                         {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                     <p className="text-sm text-gray-600 truncate group-hover:text-gray-900">{item.preview}</p>
                   </div>
                 ))
               )}
             </div>
           </div>
        )}

        {/* Overlay for history */}
        {showHistory && (
          <div className="fixed inset-0 z-30 print:hidden" onClick={() => setShowHistory(false)}></div>
        )}

        <div className={`flex flex-col items-center ${result ? 'justify-start' : 'justify-center'} min-h-[calc(100vh-12rem)]`}>
          {result ? (
            <AnalysisDisplay result={result} onReset={handleReset} />
          ) : (
            <>
              <div className="text-center max-w-2xl mx-auto mb-10 print:hidden">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  Is it <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Human</span> or <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Machine?</span>
                </h1>
                <p className="text-lg text-gray-600">
                  Paste your text below to detect AI-generated content patterns using our advanced linguistic stylometry engine.
                </p>
              </div>
              <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
            </>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 text-sm print:hidden">
        <p>© {new Date().getFullYear()} Veritas AI Detector. Powered by DeepSeek.</p>
      </footer>
    </div>
  );
};

export default App;