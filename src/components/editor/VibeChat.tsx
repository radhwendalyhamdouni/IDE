'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Sparkles,
  Code2,
  FileCode,
  Wand2,
  Loader2,
  Copy,
  Check,
  Trash2,
  Lightbulb,
  Rocket,
  Globe,
  Smartphone,
  Cpu,
  Bot,
  Zap,
  Brain,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  timestamp: Date;
  model?: string;
  fallback?: boolean;
}

interface VibeChatProps {
  onCodeGenerated?: (code: string) => void;
  className?: string;
}

const SUGGESTIONS = [
  { icon: Rocket, text: 'أنشئ متجر إلكتروني', color: 'bg-blue-500' },
  { icon: Globe, text: 'أنشئ موقع شخصي', color: 'bg-green-500' },
  { icon: Smartphone, text: 'أنشئ تطبيق مهام', color: 'bg-purple-500' },
  { icon: FileCode, text: 'أنشئ لوحة تحكم', color: 'bg-orange-500' },
  { icon: Brain, text: 'أنشئ شبكة عصبية', color: 'bg-pink-500' },
  { icon: Cpu, text: 'أنشئ آلة حاسبة', color: 'bg-cyan-500' },
];

export default function VibeChat({ onCodeGenerated, className = '' }: VibeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'مرحباً! 👋 أنا مساعدك البرمجي للغة المرجع. اكتب ما تريد بالعربية وسأحوّله إلى كود. جرب كتابة "أنشئ تطبيق مهام" أو "أنشئ متجر إلكتروني".',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ available: boolean; model: string }>({
    available: false,
    model: 'local',
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // التحقق من حالة AI
  useEffect(() => {
    fetch('/api/ai')
      .then(res => res.json())
      .then(data => {
        setAiStatus({
          available: data.features?.ollamaIntegration || false,
          model: data.defaultModel || 'local-patterns',
        });
      })
      .catch(() => {
        setAiStatus({ available: false, model: 'local-patterns' });
      });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: messageText, action: 'generate' }),
      });

      const data = await response.json();

      let responseContent = '';
      if (data.success) {
        if (data.fallback) {
          responseContent = 'تم توليد الكود محلياً ✨ (الأنماط المحلية)';
        } else {
          responseContent = 'تم توليد الكود بالذكاء الاصطناعي! 🤖✨';
        }
      } else {
        responseContent = 'حدث خطأ، حاول مرة أخرى.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        code: data.code,
        timestamp: new Date(),
        model: data.model,
        fallback: data.fallback,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.code && onCodeGenerated) {
        onCodeGenerated(data.code);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, onCodeGenerated]);

  const copyCode = useCallback((code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const applyCode = useCallback((code: string) => {
    if (onCodeGenerated) {
      onCodeGenerated(code);
    }
  }, [onCodeGenerated]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'تم مسح المحادثة. كيف يمكنني مساعدتك؟ 🚀',
      timestamp: new Date(),
    }]);
  }, []);

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Vibe Coding</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400">اكتب بالعربية، أحوّل إلى كود</p>
              {aiStatus.available ? (
                <Badge variant="outline" className="text-[10px] bg-green-900/30 text-green-400 border-green-700">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] bg-blue-900/30 text-blue-400 border-blue-700">
                  <Zap className="w-3 h-3 mr-1" />
                  محلي
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {message.code && (
                  <div className="mt-3 rounded-lg overflow-hidden bg-slate-900/80">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-300">لغة المرجع</span>
                        {message.model && (
                          <Badge variant="outline" className="text-[10px] bg-slate-700 text-slate-300 border-slate-600">
                            {message.model.includes('ollama') ? 'AI' : 'محلي'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(message.code!, message.id)}
                          className="h-7 px-2 text-slate-400 hover:text-white"
                        >
                          {copied === message.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applyCode(message.code!)}
                          className="h-7 px-2 text-blue-400 hover:text-blue-300"
                        >
                          <Wand2 className="w-3.5 h-3.5 mr-1" />
                          تطبيق
                        </Button>
                      </div>
                    </div>
                    <pre className="p-3 text-xs text-slate-300 overflow-x-auto font-mono max-h-64 overflow-y-auto" dir="rtl">
                      {message.code}
                    </pre>
                  </div>
                )}
                
                <p className="text-[10px] opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-slate-300">جاري التوليد...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            اقتراحات
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(suggestion.text)}
                className="h-8 bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <suggestion.icon className="w-3 h-3 mr-1.5" />
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب ما تريد... مثال: أنشئ موقع متجر"
            className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
            dir="rtl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        {/* Status Bar */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            {aiStatus.available ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>AI متصل ({aiStatus.model})</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>الأنماط المحلية</span>
              </>
            )}
          </div>
          <span>Ctrl+K للوصول السريع</span>
        </div>
      </div>
    </div>
  );
}
