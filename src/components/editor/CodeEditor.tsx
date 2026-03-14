'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Save,
  FileCode,
  Sparkles,
  RefreshCw,
  Upload,
} from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
  className?: string;
}

// تلوين الكود العربي
function highlightCode(code: string): string {
  const keywords = ['متغير', 'ثابت', 'دالة', 'إذا', 'وإلا', 'لكل', 'طالما', 'أرجع', 'اطبع', 'جديد', 'صنف', 'أرجع', 'طالما', 'حاول', 'التقط', 'رمي'];
  const functions = ['اطبع', 'مدى', 'طول', 'أضف', 'احذف', 'فرز', 'فلتر', 'بحث', 'قص', 'تقسيم', 'ربط'];
  
  let highlighted = code
    // تعليقات
    .replace(/\/\/(.*)$/gm, '<span class="text-slate-500">//$1</span>')
    // نصوص
    .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
    .replace(/'([^']*)'/g, "<span class='text-green-400'>'$1'</span>")
    // أرقام
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>')
    // أرقام عربية
    .replace(/[٠-٩]+/g, '<span class="text-orange-400">$&</span>');
  
  // كلمات مفتاحية
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span class="text-pink-400 font-medium">${keyword}</span>`);
  });
  
  // دوال
  functions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span class="text-blue-400">${func}</span>`);
  });
  
  return highlighted;
}

export default function CodeEditor({
  initialCode = '// اكتب كود المرجع هنا\nاطبع("مرحباً بالعالم!");',
  onCodeChange,
  onRun,
  className = '',
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    setCursorPos(e.target.selectionStart);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  }, [onCodeChange]);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput(prev => [...prev, '> تشغيل الكود...']);

    try {
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const result = await response.json();
        setOutput(prev => [...prev, result.output || 'تم التنفيذ بنجاح']);
      } else {
        // محاكاة الإخراج
        const lines = code.split('\n').filter(l => l.includes('اطبع'));
        lines.forEach(line => {
          const match = line.match(/اطبع\s*\(\s*["'](.+?)["']\s*\)/);
          if (match) {
            setOutput(prev => [...prev, match[1]]);
          }
        });
        setOutput(prev => [...prev, '✓ تم التنفيذ بنجاح']);
      }
    } catch (error) {
      // محاكاة الإخراج المحلي
      const lines = code.split('\n').filter(l => l.includes('اطبع'));
      lines.forEach(line => {
        const match = line.match(/اطبع\s*\(\s*["'](.+?)["']\s*\)/);
        if (match) {
          setOutput(prev => [...prev, match[1]]);
        }
      });
      setOutput(prev => [...prev, '✓ تم التنفيذ (محلي)']);
    } finally {
      setIsRunning(false);
      if (onRun) {
        onRun(code);
      }
    }
  }, [code, onRun]);

  const saveFile = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.mrj';
    a.click();
    URL.revokeObjectURL(url);
  }, [code]);

  const loadFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mrj,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCode(content);
          if (onCodeChange) {
            onCodeChange(content);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [onCodeChange]);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  // مزامنة التمرير
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Handle Tab key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      if (onCodeChange) {
        onCodeChange(newCode);
      }
      setTimeout(() => {
        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
      }, 0);
    }
  }, [code, onCodeChange]);

  // اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        runCode();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [runCode, saveFile]);

  return (
    <div className={`flex flex-col h-full bg-slate-950 ${className}`}>
      {/* شريط الأدوات */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">untitled.mrj</span>
          <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">
            المرجع
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="text-green-400 hover:text-green-300 hover:bg-slate-800"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="mr-1 hidden sm:inline">تشغيل</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={saveFile}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Save className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={loadFile}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* المحرر */}
      <div className="flex-1 relative overflow-hidden">
        {/* الخلفية الملوّنة */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 p-4 font-mono text-sm leading-6 whitespace-pre-wrap break-words overflow-auto pointer-events-none text-transparent"
          dir="rtl"
          aria-hidden="true"
        >
          <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
        </pre>
        
        {/* منطقة الكتابة */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-white resize-none focus:outline-none z-10"
          dir="rtl"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* لوحة المخرجات */}
      <div className="h-32 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between px-4 py-1 border-b border-slate-800">
          <span className="text-xs text-slate-400">المخرجات</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearOutput}
            className="h-6 text-xs text-slate-500 hover:text-white"
          >
            مسح
          </Button>
        </div>
        <div className="p-2 h-24 overflow-auto font-mono text-xs">
          {output.length === 0 ? (
            <span className="text-slate-600">المخرجات ستظهر هنا</span>
          ) : (
            output.map((line, i) => (
              <div key={i} className="text-slate-300">
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
