import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  Copy,
  Check,
  Newspaper,
  BookOpen,
  X,
  RefreshCw,
  Sparkles,
  FileSearch,
  Type,
} from 'lucide-react';
import { postJson } from '../services/api/apiClient';

interface ResearchSourceItem {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

interface ResearchResult {
  query: string;
  answer: string | null;
  sources: {
    web: ResearchSourceItem[];
    news: ResearchSourceItem[];
    wikipedia: ResearchSourceItem[];
  };
}

interface ResearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAsCaption: (text: string) => void;
}

const SUGGESTED_QUERIES = [
  'latest travel trends 2026',
  'best content ideas for Instagram reels',
  'gold price today reasons',
  'digital marketing tips for small business',
];

export const ResearchPanel: React.FC<ResearchPanelProps> = ({ isOpen, onClose, onUseAsCaption }) => {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery || isLoading) return;
    setQuery(searchQuery);
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await postJson<ResearchResult>('/api/research', { query: searchQuery, maxResults: 5 });
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error contacting research service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const countTotal = (r: ResearchResult) =>
    r.sources.web.length + r.sources.news.length + r.sources.wikipedia.length;

  const renderItem = (item: ResearchSourceItem, section: string, idx: number) => {
    const key = `${section}-${idx}`;
    return (
      <div key={key} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-sky-300 hover:text-sky-200 hover:underline leading-snug flex items-start gap-1.5"
          >
            <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{item.title}</span>
          </a>
          <button
            onClick={() => handleCopy(key, `${item.title}\n${item.snippet}\n${item.url}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0"
            title="Copy result"
          >
            {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        {item.snippet && (
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">{item.snippet}</p>
        )}
        {item.date && (
          <p className="text-[10px] text-slate-500 mt-1.5">{new Date(item.date).toLocaleDateString()}</p>
        )}
      </div>
    );
  };

  const renderSection = (label: string, icon: React.ReactNode, items: ResearchSourceItem[], section: string) => {
    if (!items.length) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{label}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {items.length}
          </span>
        </div>
        <div className="space-y-1.5">{items.map((item, idx) => renderItem(item, section, idx))}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-sky-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Internet Research
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FREE · NO KEY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Find facts, trends & news — Wikipedia + DuckDuckGo + Google News
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
              placeholder="Ask anything… e.g. 'best reel ideas for a coffee shop'"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-hidden transition-all"
            />
            <button
              onClick={() => handleResearch()}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Researching…' : 'Research'}</span>
            </button>
          </div>

          {/* Suggested queries */}
          {!result && !isLoading && (
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleResearch(s)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-3">
                <FileSearch className="w-6 h-6 text-sky-400 animate-pulse" />
              </div>
              <p className="text-xs font-semibold text-slate-300">Scanning Wikipedia, DuckDuckGo & Google News…</p>
              <p className="text-[11px] text-slate-500 mt-1">Then synthesizing an answer with Gemini AI</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5 animate-fade-in">
              {/* AI Answer */}
              {result.answer && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-bold text-white">AI Answer</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Gemini
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleCopy('answer', result.answer!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-all"
                    >
                      {copiedKey === 'answer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'answer' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onUseAsCaption(result.answer!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-[11px] font-semibold border border-sky-500/40 transition-all"
                      title="Use this answer as the reel social caption"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Use as Caption</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Source sections */}
              {countTotal(result) === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400">
                    No web results found for "{result.query}". Try a different wording.
                  </p>
                </div>
              ) : (
                <>
                  {renderSection('Web Results', <Globe className="w-4 h-4 text-sky-400" />, result.sources.web, 'web')}
                  {renderSection('Latest News', <Newspaper className="w-4 h-4 text-rose-400" />, result.sources.news, 'news')}
                  {renderSection('Wikipedia', <BookOpen className="w-4 h-4 text-amber-400" />, result.sources.wikipedia, 'wiki')}
                </>
              )}

              <p className="text-[10px] text-slate-600 text-center">
                Sources: Wikipedia · DuckDuckGo · Google News — free, no API key required
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Close
          </button>
          {result && (
            <button
              onClick={() => handleResearch()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              New Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
};