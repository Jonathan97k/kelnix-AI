import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  X,
  User,
  Wand2,
} from 'lucide-react';
import { PhotoSlide, ReelConfig } from '../types';
import { postJson } from '../services/api/apiClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface CommandChatProps {
  isOpen: boolean;
  onClose: () => void;
  slideCount: number;
  theme: string;
  tone: string;
  aspectRatio: string;
  title: string;
  onApplyScript: (result: any) => void;
  onUpdateConfig: (partial: Partial<ReelConfig>) => void;
  onUpdateSlide: (index: number, partial: Partial<PhotoSlide>) => void;
  onBulkEffect: (effect: 'transition' | 'filter', value: string) => void;
}

const SUGGESTIONS = [
  'Generate a high-energy fitness reel script',
  'Research the latest AI news',
  'Make travel captions for all my slides',
  'Set the reel to 1:1 with a chill aesthetic tone',
  'Create a reel about my coffee shop with an upbeat script',
];

export const CommandChat: React.FC<CommandChatProps> = ({
  isOpen,
  onClose,
  slideCount,
  theme,
  tone,
  aspectRatio,
  title,
  onApplyScript,
  onUpdateConfig,
  onUpdateSlide,
  onBulkEffect,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hey! Describe what you want and I will do it in your reel — e.g. "generate a travel script", "research coffee marketing", "make captions funny" or "switch to 9:16".',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, statusText]);

  if (!isOpen) return null;

  const pushMsg = (role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const executeActions = async (actions: any[]) => {
    for (const action of actions) {
      const { type, params = {} } = action;
      setStatusText(`Executing: ${type.replace(/_/g, ' ')}…`);
      try {
        switch (type) {
          case 'answer':
            pushMsg('assistant', params.text || '');
            break;

          case 'generate_script': {
            const script = await postJson<any>('/api/generate-script', {
              theme: params.theme || theme,
              tone: params.tone || tone,
              photoCount: slideCount,
              photoDescriptions: Array.from(
                { length: slideCount },
                (_, i) => `Slide ${i + 1}: Photo scene`
              ),
              customPrompt: params.customPrompt || '',
            });
            onApplyScript(script);
            pushMsg(
              'assistant',
              `Script applied - "${script.title}" is now your reel. Captions, narration, hashtags and pacing were updated.`
            );
            break;
          }

          case 'research': {
            const research = await postJson<any>('/api/research', { query: params.query || '', maxResults: 5 });
            const total =
              (research?.sources?.web?.length || 0) +
              (research?.sources?.news?.length || 0) +
              (research?.sources?.wikipedia?.length || 0);
            const answer = research?.answer;
            pushMsg(
              'assistant',
              answer
                ? `Research on "${research.query}" (${total} sources):\n\n${answer}`
                : `Found ${total} results for "${research?.query}" - open the Research panel to browse them.`
            );
            break;
          }

          case 'update_config': {
            onUpdateConfig(params);
            const keys = Object.keys(params).join(', ') || 'nothing';
            pushMsg('assistant', `⚙️ Config updated: ${keys}.`);
            break;
          }

          case 'caption_slides': {
            const captions: string[] = Array.isArray(params.captions) ? params.captions : [];
            captions.forEach((cap, idx) => onUpdateSlide(idx, { caption: cap }));
            pushMsg('assistant', `💬 Applied ${captions.length} caption(s) to your slides.`);
            break;
          }

          case 'bulk_effect': {
            onBulkEffect(params.effect, params.value);
            pushMsg('assistant', `🎨 Applied ${params.effect} = "${params.value}" to all slides.`);
            break;
          }

          default:
            pushMsg('assistant', `ℹ️ I didn't recognize action "${type}" — skipping it.`);
        }
      } catch (e: any) {
        console.error(e);
        pushMsg('assistant', `⚠️ ${type.replace(/_/g, ' ')} failed: ${e.message}`);
      }
    }
    setStatusText('');
  };

  const handleSend = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isBusy) return;
    setInput('');
    pushMsg('user', msgText);
    setIsBusy(true);
    setStatusText('Thinking…');

    try {
      const data = await postJson<any>('/api/chat-command', {
        message: msgText,
        context: { slideCount, theme, tone, aspectRatio, title },
      });

      if (data.reply) pushMsg('assistant', data.reply);
      await executeActions(data.actions || []);
    } catch (e: any) {
      console.error(e);
      pushMsg('assistant', `⚠️ ${e.message}`);
    } finally {
      setIsBusy(false);
      setStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                AI Command Chat
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  DO IT FOR ME
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Describe what you want — scripts, research, captions, settings — and watch it happen
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

        {/* Chat Thread */}
        <div ref={scrollRef} className="p-5 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                    : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-purple-300" />
                </div>
              )}
            </div>
          ))}

          {/* Busy indicator */}
          {isBusy && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              </div>
              <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-slate-800 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{statusText || 'Working…'}</span>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length <= 1 && !isBusy && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Tell me what to do… e.g. "research AI trends and make a reel about it"'
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={isBusy || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-[10px] text-slate-600">
              Powered by Gemini AI � actions run inside Kelnix AI automatically
            </p>
            <Wand2 className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
