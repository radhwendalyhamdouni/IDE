'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
} from 'lucide-react';

interface PreviewPanelProps {
  code?: string;
  className?: string;
}

export default function PreviewPanel({ code = '', className = '' }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  const getViewportWidth = useCallback(() => {
    switch (viewMode) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      default:
        return 'w-full';
    }
  }, [viewMode]);

  // تحويل كود المرجع إلى HTML للمعاينة
  const parseCodeToHTML = useCallback((sourceCode: string): string => {
    const lines = sourceCode.split('\n');
    let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>معاينة - المرجع</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Tajawal', sans-serif; }
    body { background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 20px; }
  </style>
</head>
<body>
`;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.includes('عنوان(')) {
        const match = trimmed.match(/عنوان\s*\(\s*["'](.+?)["']\)/);
        if (match) {
          html += `<h1 class="text-2xl font-bold text-white mb-4">${match[1]}</h1>\n`;
        }
      }
      
      if (trimmed.includes('نص(')) {
        const match = trimmed.match(/نص\s*\(\s*["'](.+?)["']\)/);
        if (match) {
          html += `<p class="text-gray-300 mb-2">${match[1]}</p>\n`;
        }
      }
      
      if (trimmed.includes('زر(')) {
        const match = trimmed.match(/زر\s*\(\s*["'](.+?)["']\)/);
        if (match) {
          html += `<button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-2">${match[1]}</button>\n`;
        }
      }
      
      if (trimmed.includes('حقل_نص') || trimmed.includes('حقل_بحث')) {
        const placeholderMatch = trimmed.match(/عنصر_نائب:\s*["'](.+?)["']/);
        html += `<input type="text" placeholder="${placeholderMatch ? placeholderMatch[1] : 'أدخل النص...'}" class="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg mb-2 w-full" />\n`;
      }
      
      if (trimmed.includes('بطاقة')) {
        html += `<div class="bg-slate-800 rounded-xl p-4 shadow-lg mb-4">\n`;
      }
      
      if (trimmed.includes('اطبع(')) {
        const match = trimmed.match(/اطبع\s*\(\s*["'](.+?)["']\s*\)/);
        if (match) {
          html += `<div class="bg-slate-700 p-2 rounded mb-2">${match[1]}</div>\n`;
        }
      }
    });

    html += `
</body>
</html>`;
    
    return html;
  }, []);

  // استخدام useMemo بدلاً من useEffect
  const previewHTML = useMemo(() => {
    return code ? parseCodeToHTML(code) : '';
  }, [code, parseCodeToHTML]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className={`flex flex-col h-full bg-slate-950 ${className}`}>
      {/* شريط الأدوات */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-green-400" />
          <span className="text-sm text-slate-300">المعاينة</span>
          <Badge variant="outline" className="text-xs border-slate-700">
            مباشر
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          {/* أزرار حجم الشاشة */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('desktop')}
              className={`h-7 w-7 p-0 ${viewMode === 'desktop' ? 'bg-slate-700' : ''}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('tablet')}
              className={`h-7 w-7 p-0 ${viewMode === 'tablet' ? 'bg-slate-700' : ''}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('mobile')}
              className={`h-7 w-7 p-0 ${viewMode === 'mobile' ? 'bg-slate-700' : ''}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* منطقة المعاينة */}
      <div className="flex-1 overflow-auto bg-slate-900/50 p-4">
        <div className={`mx-auto transition-all duration-300 ${getViewportWidth()}`}>
          <div className="bg-slate-800 rounded-lg overflow-hidden shadow-2xl border border-slate-700">
            {/* شريط المتصفح */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-slate-800 rounded px-3 py-1 text-xs text-slate-400 text-center">
                preview.almarjaa.dev
              </div>
            </div>
            
            {/* المحتوى */}
            <iframe
              key={refreshKey}
              srcDoc={previewHTML}
              className="w-full h-[calc(100vh-280px)] min-h-[400px] bg-slate-900"
              title="معاينة"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
