'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Code2,
  Eye,
  FileCode,
  Settings,
  Github,
  Zap,
} from 'lucide-react';
import CodeEditor from '@/components/editor/CodeEditor';
import VibeChat from '@/components/editor/VibeChat';
import PreviewPanel from '@/components/editor/PreviewPanel';

export default function IDEPage() {
  const [code, setCode] = useState(`// مرحباً بك في المرجع IDE
// اكتب أفكارك بالعربية وسيتم تحويلها إلى كود

// مثال: أنشئ متغير
متغير الرسالة = "مرحباً بالعالم!";

// مثال: دالة للترحيب
دالة رحب(الاسم) {
    اطبع("مرحباً " + الاسم + "!");
}

// استدعاء الدالة
رحب("المستخدم");

// مثال: حلقة
لكل رقم في مدى(1، 5) {
    اطبع("الرقم: " + رقم);
}
`);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('editor');

  const handleCodeGenerated = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">المرجع IDE</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Vibe Coding with AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            asChild
          >
            <a href="https://github.com/radhwendalyhamdouni/Al-Marjaa-Language" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
            </a>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Sidebar - Vibe Chat */}
          {sidebarOpen && (
            <>
              <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                <VibeChat
                  onCodeGenerated={handleCodeGenerated}
                  className="h-full"
                />
              </ResizablePanel>
              <ResizableHandle className="w-1 bg-slate-800 hover:bg-blue-600 transition-colors" />
            </>
          )}

          {/* Editor Area */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="flex items-center gap-4 px-4 py-1 bg-slate-900 border-b border-slate-800">
                    <TabsList className="bg-slate-800 border-slate-700">
                      <TabsTrigger value="editor" className="data-[state=active]:bg-slate-700">
                        <Code2 className="w-4 h-4 mr-1" />
                        المحرر
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                        <Eye className="w-4 h-4 mr-1" />
                        المعاينة
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1" />
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <span>Ctrl+K للـ AI</span>
                    </div>
                  </div>
                  
                  <TabsContent value="editor" className="flex-1 mt-0">
                    <CodeEditor
                      initialCode={code}
                      onCodeChange={handleCodeChange}
                      className="h-full"
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="flex-1 mt-0">
                    <PreviewPanel code={code} className="h-full" />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <footer className="flex items-center justify-between px-4 py-1 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileCode className="w-3 h-3" />
            لغة المرجع v3.4.1
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">الأسطر: {code.split('\n').length}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">UTF-8</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            متصل
          </span>
        </div>
      </footer>
    </div>
  );
}
