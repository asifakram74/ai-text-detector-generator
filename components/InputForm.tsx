import React, { useState } from 'react';
import { Send, FileText, AlertCircle } from 'lucide-react';
import { AIConfig, DEEPSEEK_CONFIG } from '../services/geminiService';

interface InputFormProps {
  onAnalyze: (text: string, config: AIConfig) => void;
  isLoading: boolean;
}

const MIN_CHARS = 50;

const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (text.length < MIN_CHARS) {
      setError(
        `Please enter at least ${MIN_CHARS} characters for an accurate analysis.`
      );
      return;
    }

    setError(null);

    // Always use DeepSeek configuration
    const config: AIConfig = DEEPSEEK_CONFIG;

    onAnalyze(text, config);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    if (error && value.length >= MIN_CHARS) {
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6 text-gray-800">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-semibold">
              Content Analyzer
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste the text you want to analyze here..."
                className={`w-full h-64 p-5 rounded-xl border-2 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white transition-all resize-none font-light leading-relaxed ${
                  error
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-100 focus:border-indigo-500'
                }`}
                disabled={isLoading}
              />

              <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                {text.length} chars
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400 max-w-md">
                * For best results, analyze paragraphs containing at least
                3–4 sentences. Extremely short texts may yield uncertain
                results.
              </p>

              <button
                type="submit"
                disabled={isLoading || text.length === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 
                        0 0 5.373 0 12h4zm2 5.291A7.962 
                        7.962 0 014 12H0c0 3.042 1.135 
                        5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>

                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Text
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <FeatureHighlight
          title="Fast AI Analysis"
          subtitle="Powered by DeepSeek"
        />

        <FeatureHighlight
          title="Linguistic Detection"
          subtitle="Advanced text evaluation"
        />

        <FeatureHighlight
          title="Instant Results"
          subtitle="Low latency responses"
        />
      </div>
    </div>
  );
};

const FeatureHighlight: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => (
  <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
    <div className="font-semibold text-gray-900">
      {title}
    </div>

    <div className="text-xs text-gray-500 mt-1">
      {subtitle}
    </div>
  </div>
);

export default InputForm;