import React, { useMemo, useState } from 'react';
import { AnalysisResult, ContentVerdict, AnnotatedSegment, PlagiarismMatch, TextStatistics, KeywordDensity } from '../types';
import ResultGauge from './ResultGauge';
import { AlertTriangle, CheckCircle, Brain, Zap, Type, Info, Globe, ExternalLink, Hash, BarChart2, Wand2, X, Copy, Check } from 'lucide-react';
import { humanizeContent, analyzeContent } from '../services/geminiService';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset }) => {
  const [humanizedText, setHumanizedText] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isHumanizing, setIsHumanizing] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [humanizedAnalysis, setHumanizedAnalysis] = useState<AnalysisResult | null>(null);
  const [isReAnalyzing, setIsReAnalyzing] = useState<boolean>(false);

  const getVerdictColor = (verdict: ContentVerdict) => {
    switch (verdict) {
      case ContentVerdict.AI: return 'text-red-600 bg-red-50 border-red-200';
      case ContentVerdict.HUMAN: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case ContentVerdict.MIXED: return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerdictIcon = (verdict: ContentVerdict) => {
    switch (verdict) {
      case ContentVerdict.AI: return <Brain className="w-8 h-8" />;
      case ContentVerdict.HUMAN: return <CheckCircle className="w-8 h-8" />;
      default: return <AlertTriangle className="w-8 h-8" />;
    }
  };

  const handleHumanize = async () => {
    if (!result.originalText) return;

    setIsHumanizing(true);
    try {
      const humanized = await humanizeContent(result.originalText);
      setHumanizedText(humanized);
      setShowPreview(true);
      // Auto-scroll to preview after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById('humanized-preview');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error humanizing content:', error);
      alert('Failed to humanize content. Please try again.');
    } finally {
      setIsHumanizing(false);
    }
  };



  return (
    <div className={`w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up print:space-y-6 print:w-full print:max-w-none print:animate-none`}>
      
      {/* Content Wrapper */}
      <div id="analysis-report-content" className="space-y-8 print:space-y-6 bg-white p-2 text-gray-900">
        
        {/* Print Header - Only visible on print */}
        <div className="hidden print:block text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Veritas AI Analysis Report</h1>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Header Result Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div className="p-8 md:p-12 space-y-8 print:p-6 print:space-y-4">

            {/* Score on Top */}
            <div className="flex flex-col items-center justify-center">
               <ResultGauge score={result.confidenceScore} verdict={result.verdict} />
               <div className={`mt-6 px-6 py-2 rounded-full font-bold text-xl border flex items-center gap-2 ${getVerdictColor(result.verdict)}`}>
                 {getVerdictIcon(result.verdict)}
                 <span>VERDICT: {result.verdict}</span>
               </div>
            </div>

            {/* Analysis Summary and Key Indicators Stacked */}
            <div className="flex flex-col gap-6 print:gap-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 print:bg-white print:border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Summary</h3>
                <p className="text-gray-600 leading-relaxed text-lg print:text-base text-justify">
                  {result.reasoning}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 print:bg-white print:border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Indicators</h4>
                <ul className="space-y-2">
                  {result.keyIndicators.map((indicator, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="text-gray-700 print:text-sm">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:break-inside-avoid">
          <MetricCard 
            icon={<Type className="w-6 h-6 text-purple-500" />}
            title="Sentence Variety"
            description={result.stylometricAnalysis.sentenceVariety}
          />
          <MetricCard 
            icon={<Brain className="w-6 h-6 text-blue-500" />}
            title="Vocabulary"
            description={result.stylometricAnalysis.vocabularyComplexity}
          />
          <MetricCard 
            icon={<Zap className="w-6 h-6 text-amber-500" />}
            title="Tone & Emotion"
            description={result.stylometricAnalysis.emotionalTone}
          />
        </div>

        {/* Text Statistics & Keyword Density */}
        {result.textStats && (
          <div className="print:break-inside-avoid">
            <TextStatisticsSection stats={result.textStats} />
          </div>
        )}

        {/* Plagiarism Report Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 print:shadow-none print:border-gray-300 print:break-inside-avoid print:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 print:mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 print:bg-white print:border print:border-gray-200">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Plagiarism & Source Detection</h3>
                <p className="text-sm text-gray-500">Exact matches found on the web</p>
              </div>
            </div>

            {result.plagiarismReport && (
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 print:bg-white">
                 <div className="text-sm font-medium text-gray-600">Exact Match Score</div>
                 <div className="flex items-center gap-2">
                   <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden print:border print:border-gray-300">
                     <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          result.plagiarismReport.score > 50 ? 'bg-red-500' : 
                          result.plagiarismReport.score > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${result.plagiarismReport.score}%`, WebkitPrintColorAdjust: 'exact' }} 
                     />
                   </div>
                   <span className={`font-bold ${
                      result.plagiarismReport.score > 50 ? 'text-red-600' : 
                      result.plagiarismReport.score > 20 ? 'text-amber-600' : 'text-emerald-600'
                   }`}>
                     {result.plagiarismReport.score}%
                   </span>
                 </div>
              </div>
            )}
          </div>

          {result.plagiarismReport && result.plagiarismReport.matches.length > 0 ? (
             <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2">
                 {result.plagiarismReport.matches.map((match, idx) => (
                   match.url ? (
                     <a
                       key={idx}
                       href={match.url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group print:border-gray-300 print:bg-white text-decoration-none"
                     >
                       <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors print:hidden">
                         <Globe className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                       </div>
                       <div className="flex-grow min-w-0">
                         <h4 className="font-semibold text-gray-800 truncate text-sm">{match.title || "External Source"}</h4>
                         <p className="text-xs text-gray-500 truncate">{match.url}</p>
                       </div>
                       <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 print:hidden" />
                     </a>
                   ) : (
                     <div
                       key={idx}
                       className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 print:border-gray-300 print:bg-white"
                     >
                       <div className="p-2 bg-gray-100 rounded-lg print:bg-white print:border print:border-gray-200">
                         <Globe className="w-5 h-5 text-gray-600" />
                       </div>
                       <div className="flex-grow min-w-0">
                         <h4 className="font-semibold text-gray-800 truncate text-sm">{match.title || "Plagiarized Content"}</h4>
                         <p className="text-xs text-gray-500 truncate">Source not verified</p>
                       </div>
                     </div>
                   )
                 ))}
               </div>

               <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Plagiarism Highlights (Verbatim Matches)</h4>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 leading-loose text-gray-800 font-serif text-lg print:text-base print:bg-white print:border-gray-300">
                     <PlagiarismHighlighter 
                        text={result.originalText || ""} 
                        matches={result.plagiarismReport.matches} 
                     />
                  </div>
               </div>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 print:bg-white print:border-gray-300">
              <ShieldCheckIcon className="w-12 h-12 text-emerald-500 mb-3" />
              <h4 className="font-semibold text-gray-900">No Exact Plagiarism Detected</h4>
              <p className="text-gray-500 text-sm max-w-md mt-1">
                We couldn't find any direct matches for this text in our search database.
              </p>
            </div>
          )}
        </div>

        {/* Grammar Report Section */}
        {result.grammarStats && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 print:shadow-none print:border-gray-300 print:break-inside-avoid print:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 print:mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600 print:bg-white print:border print:border-gray-200">
                  <Type className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Grammar & Style Analysis</h3>
                  <p className="text-sm text-gray-500">Grammar errors, spelling, and style suggestions</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 print:bg-white">
                <div className="text-sm font-medium text-gray-600">Grammar Score</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden print:border print:border-gray-300">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        result.grammarStats.score >= 80 ? 'bg-emerald-500' :
                        result.grammarStats.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.grammarStats.score}%`, WebkitPrintColorAdjust: 'exact' }}
                    />
                  </div>
                  <span className={`font-bold ${
                    result.grammarStats.score >= 80 ? 'text-emerald-600' :
                    result.grammarStats.score >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {result.grammarStats.score}%
                  </span>
                </div>
              </div>
            </div>

            {result.grammarStats.errors.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {result.grammarStats.totalErrors} error{result.grammarStats.totalErrors !== 1 ? 's' : ''} found
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-1">
                  {result.grammarStats.errors.map((error, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-red-50 print:bg-white print:border-gray-300">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${
                          error.severity === 'error' ? 'bg-red-100 text-red-600' :
                          error.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {error.severity === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                           error.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                           <Info className="w-4 h-4" />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-medium text-gray-900 text-sm mb-1">
                            {error.severity.charAt(0).toUpperCase() + error.severity.slice(1)}
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed mb-2">
                            "{error.text}"
                          </div>
                          <div className="text-gray-600 text-xs">
                            {error.reason}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Position: {error.position.start}-{error.position.end}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {result.grammarStats.suggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Suggestions for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {result.grammarStats.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <span className="text-gray-700 print:text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 print:bg-white print:border-gray-300">
                <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                <h4 className="font-semibold text-gray-900">No Grammar Issues Detected</h4>
                <p className="text-gray-500 text-sm max-w-md mt-1">
                  The text appears to be grammatically correct with no spelling or style errors found.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Detailed Text Analysis with Highlighting (AI Detection) */}
        {result.originalText && result.annotatedSegments && result.annotatedSegments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 print:shadow-none print:border-gray-300 print:p-6 print:break-inside-avoid">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">Detailed Text Analysis (AI vs Human)</h3>
                <div className="group relative print:hidden">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                     The extent of highlighting roughly correlates with the confidence score. Specific segments are marked to show where patterns were detected.
                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 text-xs font-medium">
                 <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300" style={{ WebkitPrintColorAdjust: 'exact' }}></span>
                    <span className="text-gray-600">AI Patterns</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300" style={{ WebkitPrintColorAdjust: 'exact' }}></span>
                    <span className="text-gray-600">Human Patterns</span>
                 </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 leading-loose text-gray-800 font-serif text-lg print:text-base print:bg-white print:border-gray-300">
              <HighlightedText 
                text={result.originalText} 
                segments={result.annotatedSegments} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Humanized Text Preview Section */}
      {showPreview && humanizedText && (
        <div id="humanized-preview" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 print:shadow-none print:border-gray-300 print:p-6 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Wand2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Humanized Text</h3>
                <p className="text-sm text-gray-500">Rewritten content optimized for human detection</p>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
              {humanizedText}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(humanizedText);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 relative"
            >
              <Copy className="w-4 h-4" />
              {copySuccess ? 'Copied!' : 'Copy Text'}
              {copySuccess && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                  Text copied to clipboard!
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Humanized Analysis Section */}
      {humanizedAnalysis && (
        <div id="humanized-analysis" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 print:shadow-none print:border-gray-300 print:p-6 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Humanized Content Analysis</h3>
                <p className="text-sm text-gray-500">AI detection results for the rewritten text</p>
              </div>
            </div>
            <button
              onClick={() => setHumanizedAnalysis(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Verdict Card */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <ResultGauge score={humanizedAnalysis.confidenceScore} verdict={humanizedAnalysis.verdict} />
              <div className={`mt-4 px-6 py-2 rounded-full font-bold text-lg border flex items-center gap-2 ${getVerdictColor(humanizedAnalysis.verdict)}`}>
                {getVerdictIcon(humanizedAnalysis.verdict)}
                <span>VERDICT: {humanizedAnalysis.verdict}</span>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Analysis Summary</h4>
              <p className="text-gray-600 leading-relaxed">
                {humanizedAnalysis.reasoning}
              </p>
            </div>

            {/* Key Indicators */}
            {humanizedAnalysis.keyIndicators && humanizedAnalysis.keyIndicators.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Indicators</h4>
                <ul className="space-y-2">
                  {humanizedAnalysis.keyIndicators.map((indicator, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="text-gray-700">{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 print:hidden">
        <button
          onClick={handleHumanize}
          disabled={isHumanizing}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-200 flex items-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          {isHumanizing ? 'Humanizing...' : 'Humanize Text'}
        </button>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          Analyze Another Text
        </button>
      </div>


    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-full print:shadow-none print:border-gray-300">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-200">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed flex-grow">
      {description}
    </p>
  </div>
);

// --------------------------------------------------------------------------------
// Text Statistics & Keyword Density Component
// --------------------------------------------------------------------------------

const TextStatisticsSection: React.FC<{ stats: TextStatistics }> = ({ stats }) => {
  const [activeTab, setActiveTab] = useState<'x1' | 'x2' | 'x3'>('x1');

  const StatItem = ({ label, value, subLabel }: { label: string, value: string | number, subLabel?: string }) => (
    <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 print:bg-white print:border-gray-300">
      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</span>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
      {subLabel && <span className="text-xs text-gray-400 mt-1">{subLabel}</span>}
    </div>
  );

  const KeywordList = ({ keywords }: { keywords: KeywordDensity[] }) => (
     <div className="w-full overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 print:bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Density</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keywords.map((k, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{k.phrase}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{k.count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden print:border print:border-gray-300">
                      <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, k.percentage * 5)}%`, WebkitPrintColorAdjust: 'exact' }}></div>
                    </div>
                    {k.percentage}%
                  </div>
                </td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500 italic">No significant keywords found.</td>
              </tr>
            )}
          </tbody>
        </table>
     </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 print:shadow-none print:border-gray-300 print:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-50 rounded-lg text-pink-600 print:bg-white print:border print:border-gray-200">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Text Statistics</h3>
          <p className="text-sm text-gray-500">Quantitative content analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 print:grid-cols-6">
        <StatItem label="Words" value={stats.wordCount.toLocaleString()} />
        <StatItem label="Unique Words" value={stats.uniqueWords.toLocaleString()} />
        <StatItem label="Characters" value={stats.charCount.toLocaleString()} />
        <StatItem label="Chars (No Spaces)" value={stats.charCountNoSpaces.toLocaleString()} />
        <StatItem label="Sentences" value={stats.sentenceCount} />
        <StatItem label="Paragraphs" value={stats.paragraphCount} />
        <StatItem label="Longest Sentence" value={stats.longestSentenceWords} subLabel="words" />
        <StatItem label="Shortest Sentence" value={stats.shortestSentenceWords} subLabel="words" />
        <StatItem label="Avg. Sentence" value={stats.avgSentenceWords} subLabel="words" />
        <StatItem label="Avg. Sentence" value={stats.avgSentenceChars} subLabel="chars" />
        <StatItem label="Avg. Word Length" value={stats.avgWordLength} subLabel="chars" />
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden print:border-gray-300">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 print:bg-gray-100">
           <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-500" />
              <h4 className="font-semibold text-gray-800">Keyword Density</h4>
           </div>
           
           <div className={`flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm print:hidden`}>
             {(['x1', 'x2', 'x3'] as const).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                   activeTab === tab 
                     ? 'bg-indigo-600 text-white shadow-sm' 
                     : 'text-gray-600 hover:bg-gray-50'
                 }`}
               >
                 {tab === 'x1' ? 'Single Words' : tab === 'x2' ? 'Bigrams (x2)' : 'Trigrams (x3)'}
               </button>
             ))}
           </div>
           {/* Static Label for Print View */}
           <div className={`hidden print:block text-sm text-gray-500`}>
             Showing Single Word Density
           </div>
        </div>
        
        <div className="bg-white">
          {activeTab === 'x1' && <KeywordList keywords={stats.keywordDensity.oneWord} />}
          {activeTab === 'x2' && <KeywordList keywords={stats.keywordDensity.twoWords} />}
          {activeTab === 'x3' && <KeywordList keywords={stats.keywordDensity.threeWords} />}
        </div>
      </div>
    </div>
  );
};

// Custom Shield Check Icon
const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --------------------------------------------------------------------------------
// Highlighting Components
// --------------------------------------------------------------------------------

// 1. Plagiarism Highlighter
const PlagiarismHighlighter: React.FC<{ text: string; matches: PlagiarismMatch[] }> = ({ text, matches }) => {
  const chunks = useMemo(() => {
    if (!matches || matches.length === 0) return [{ text, match: null }];

    const foundMatches: { start: number; end: number; match: PlagiarismMatch }[] = [];

    matches.forEach(m => {
      if (!m.snippet) return;
      
      let index = -1;
      let length = 0;

      // Try exact match (Preferred since we normalized in backend score calc, but text here is original)
      // We rely on backend returning exact snippets as requested.
      index = text.indexOf(m.snippet);
      
      // If indexOf fails (e.g. whitespace diffs), we can try fuzzy fallback similar to AI highlighter
      if (index === -1) {
         const words = m.snippet.trim().split(/\s+/);
         if (words.length > 0) {
            const pattern = words.map(escapeRegExp).join('[\\s\\r\\n]+');
            try {
              const regex = new RegExp(pattern);
              const regMatch = regex.exec(text);
              if (regMatch) {
                index = regMatch.index;
                length = regMatch[0].length;
              }
            } catch (e) { /* ignore */ }
         }
      } else {
        length = m.snippet.length;
      }

      // If we found the first instance, we should technically find ALL instances to be thorough.
      // But for UI highlighting, finding at least the first one is a good start.
      // Better logic: loop to find all occurrences in the text.
      if (index !== -1 && length > 0) {
         // Loop for all occurrences
         let currentIdx = index;
         while (currentIdx !== -1) {
            foundMatches.push({ start: currentIdx, end: currentIdx + length, match: m });
            currentIdx = text.indexOf(m.snippet, currentIdx + 1);
         }
      }
    });

    foundMatches.sort((a, b) => a.start - b.start);

    // Filter overlapping - keeping the first found for simplicity
    const nonOverlapping: typeof foundMatches = [];
    foundMatches.forEach(fm => {
       const overlap = nonOverlapping.some(existing => 
         (fm.start < existing.end && fm.end > existing.start)
       );
       if (!overlap) nonOverlapping.push(fm);
    });

    const parts = [];
    let lastIndex = 0;

    nonOverlapping.forEach(fm => {
      if (fm.start > lastIndex) {
        parts.push({ text: text.slice(lastIndex, fm.start), match: null });
      }
      parts.push({ text: text.slice(fm.start, fm.end), match: fm.match });
      lastIndex = fm.end;
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), match: null });
    }

    return parts;
  }, [text, matches]);

  return (
    <>
      {chunks.map((chunk, i) => (
        chunk.match ? (
          <span key={i} className="bg-orange-100 border-b-2 border-orange-300 text-orange-900 relative group inline cursor-pointer" style={{ WebkitPrintColorAdjust: 'exact' }}>
            {chunk.text}
            <span className="inline-flex items-center align-super ml-0.5 print:hidden">
               <a href={chunk.match.url} target="_blank" rel="noreferrer" className="text-orange-600 hover:text-orange-800">
                 <ExternalLink className="w-3 h-3" />
               </a>
            </span>
            {/* Print Only Source URL */}
            <span className="hidden print:inline text-xs text-gray-500 ml-1">
              [{chunk.match.url}]
            </span>

            {/* Tooltip (Hidden on Print) */}
            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity print:hidden">
              <div className="font-bold truncate mb-1">Source Match</div>
              <div className="truncate text-gray-300">{chunk.match.url}</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </span>
        ) : (
          <span key={i}>{chunk.text}</span>
        )
      ))}
    </>
  );
};


// 2. AI Detection Highlighter (Existing Logic)
const HighlightedText: React.FC<{ text: string; segments: AnnotatedSegment[] }> = ({ text, segments }) => {
  const chunks = useMemo(() => {
    if (!segments || segments.length === 0) return [{ text, segment: null }];

    const matches: { start: number; end: number; segment: AnnotatedSegment }[] = [];

    // Find all occurrences of segments
    segments.forEach(seg => {
      if (!seg.text) return;
      
      let index = -1;
      let length = 0;

      // Strategy 1: Exact match
      index = text.indexOf(seg.text);
      if (index !== -1) {
        length = seg.text.length;
      } 
      // Strategy 2: Fuzzy whitespace match (handle newlines vs spaces)
      else {
        const words = seg.text.trim().split(/\s+/);
        if (words.length > 0) {
          // Create regex that allows any whitespace (space, tab, newline) between words
          const pattern = words.map(escapeRegExp).join('[\\s\\r\\n]+');
          try {
            const regex = new RegExp(pattern); 
            const match = regex.exec(text);
            if (match) {
              index = match.index;
              length = match[0].length;
            }
          } catch (e) {
            console.warn("Regex match failed for segment", seg.text.substring(0, 20));
          }
        }
      }
      
      if (index !== -1 && length > 0) {
        matches.push({
          start: index,
          end: index + length,
          segment: seg
        });
      }
    });

    // Sort matches by LENGTH descending to prioritize larger blocks (better coverage visualization)
    matches.sort((a, b) => (b.end - b.start) - (a.end - a.start));

    const nonOverlappingMatches: typeof matches = [];
    
    matches.forEach(m => {
      // Check if this match overlaps with any already selected match
      // We process largest matches first, so smaller overlaps get discarded
      const overlaps = nonOverlappingMatches.some(existing => 
        (m.start < existing.end && m.end > existing.start)
      );

      if (!overlaps) {
        nonOverlappingMatches.push(m);
      }
    });

    // Sort by start position for rendering order
    nonOverlappingMatches.sort((a, b) => a.start - b.start);

    // Build the text parts
    const parts = [];
    let lastIndex = 0;

    nonOverlappingMatches.forEach(match => {
      // Text before match
      if (match.start > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.start),
          segment: null
        });
      }

      // The match itself
      parts.push({
        text: text.slice(match.start, match.end),
        segment: match.segment
      });

      lastIndex = match.end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        segment: null
      });
    }

    return parts;
  }, [text, segments]);

  return (
    <>
      {chunks.map((chunk, i) => (
        chunk.segment ? (
          <TooltipSpan key={i} segment={chunk.segment} text={chunk.text} />
        ) : (
          <span key={i}>{chunk.text}</span>
        )
      ))}
    </>
  );
};

const TooltipSpan: React.FC<{ segment: AnnotatedSegment; text: string }> = ({ segment, text }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Styles based on AI vs Human feature
  const bgClass = segment.isAiFeature ? 'bg-red-100 border-b-2 border-red-300' : 'bg-emerald-100 border-b-2 border-emerald-300';
  const textClass = segment.isAiFeature ? 'text-red-900' : 'text-emerald-900';
  
  return (
    <span 
      className={`relative inline-block cursor-help transition-colors rounded px-1 mx-0.5 ${bgClass} ${textClass}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)} // For mobile support
      style={{ WebkitPrintColorAdjust: 'exact' }}
    >
      {text}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl animate-fade-in pointer-events-none print:hidden">
          <div className="font-bold mb-1 flex items-center justify-between">
            {segment.category}
            {segment.isAiFeature ? <Brain size={12} className="text-red-300"/> : <CheckCircle size={12} className="text-emerald-300"/>}
          </div>
          <div className="opacity-90 leading-snug">{segment.reason}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
};

export default AnalysisDisplay;