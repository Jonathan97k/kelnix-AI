import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  User,
  Wand2,
  Paperclip,
  X,
} from 'lucide-react';
import { PhotoSlide, ReelConfig } from '../types';
import { postJson } from '../services/api/apiClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface CommandChatProps {
  slideCount: number;
  theme: string;
  tone: string;
  aspectRatio: string;
  title: string;
  onApplyScript: (result: any) => void;
  onUpdateConfig: (partial: Partial<ReelConfig>) => void;
  onUpdateSlide: (index: number, partial: Partial<PhotoSlide>) => void;
  onBulkEffect: (effect: 'transition' | 'filter', value: string) => void;
  // Modal mode props (optional)
  isOpen?: boolean;
  onClose?: () => void;
}

const SUGGESTIONS = [
  'Generate a high-energy fitness reel script',
  'Research the latest AI news',
  'Make travel captions for all my slides',
  'Set the reel to 1:1 with a chill aesthetic tone',
  'Create a reel about my coffee shop with an upbeat script',
];

export const CommandChat: React.FC<CommandChatProps> = ({
  slideCount,
  theme,
  tone,
  aspectRatio,
  title,
  onApplyScript,
  onUpdateConfig,
  onUpdateSlide,
  onBulkEffect,
  isOpen,
  onClose,
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

  // Modal mode: don't render if not open
  if (isOpen === false) return null;

  // Panel mode: always render (isOpen === undefined)
  // Modal mode with isOpen === true: render

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, statusText]);

  const pushMsg = (role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const executeActions = async (actions: any[]) => {
    for (const action of actions) {
      const { type, params = {} } = action;
      setStatusText(`Executing: ${type.replace(/_/g, ' ')}...`);
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
            pushMsg('assistant', `Config updated: ${keys}.`);
            break;
          }

          case 'caption_slides': {
            const captions: string[] = Array.isArray(params.captions) ? params.captions : [];
            captions.forEach((cap, idx) => onUpdateSlide(idx, { caption: cap }));
            pushMsg('assistant', `Applied ${captions.length} caption(s) to your slides.`);
            break;
          }

          case 'bulk_effect': {
            onBulkEffect(params.effect, params.value);
            pushMsg('assistant', `Applied ${params.effect} = "${params.value}" to all slides.`);
            break;
          }

          default:
            pushMsg('assistant', `I didn't recognize action "${type}" — skipping it.`);
        }
      } catch (e: any) {
        console.error(e);
        pushMsg('assistant', `${type.replace(/_/g, ' ')} failed: ${e.message}`);
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
    setStatusText('Thinking...');

    try {
      const data = await postJson<any>('/api/chat-command', {
        message: msgText,
        context: { slideCount, theme, tone, aspectRatio, title },
      });

      if (data.reply) pushMsg('assistant', data.reply);
      await executeActions(data.actions || []);
    } catch (e: any) {
      console.error(e);
      pushMsg('assistant', `${e.message}`);
    } finally {
      setIsBusy(false);
      setStatusText('');
    }
  };

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="h-[48px] flex items-center px-4 border-b border-[#2E3140] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#6C5CE7] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-[#F0F0F5]">AI Assistant</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!onClose && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#6C5CE7]/15 text-[#6C5CE7] border border-[#6C5CE7]/30">
            PRO
          </span>
        )}
      </div>

      {/* Chat Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-[#6C5CE7]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-[#6C5CE7]" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#6C5CE7] text-white rounded-br-md'
                  : 'bg-[#252833] text-[#F0F0F5] border border-[#2E3140] rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-[#00B894]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-[#00B894]" />
              </div>
            )}
          </div>
        ))}

        {/* Busy indicator */}
        {isBusy && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6C5CE7]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RefreshCw className="w-3 h-3 text-[#6C5CE7] animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-xl rounded-bl-md bg-[#252833] border border-[#2E3140] text-[12px] text-[#8B8FA3] flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#F0F0F5]" />
              <span>{statusText || 'Working...'}</span>
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
                className="text-[11px] px-2 py-1.5 rounded-md bg-[#252833] text-[#8B8FA3] hover:text-[#6C5CE7] border border-[#2E3140] hover:border-[#6C5CE7]/40 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#2E3140]">
        <div className="flex gap-2">
          <button className="p-2 rounded-lg text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder='Tell me what to do...'
            className="flex-1 bg-[#252833] border border-[#2E3140] rounded-lg px-3 py-2 text-[12px] text-[#F0F0F5] placeholder-[#8B8FA3] focus:border-[#6C5CE7] focus:outline-none transition-all min-w-0"
          />
          <button
            onClick={() => handleSend()}
            disabled={isBusy || !input.trim()}
            className="px-3 py-2 rounded-lg bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white text-[12px] font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-[#8B8FA3]/50">
            Powered by Gemini AI
          </p>
          <Wand2 className="w-3 h-3 text-[#8B8FA3]/30" />
        </div>
      </div>
    </div>
  );

  // Modal mode: wrap in overlay
  if (typeof isOpen === 'boolean') {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#1A1D27] border border-[#2E3140] rounded-xl w-full max-w-md h-[500px] flex flex-col overflow-hidden shadow-2xl">
          {chatContent}
        </div>
      </div>
    );
  }

  // Panel mode: render directly
  return chatContent;
};
