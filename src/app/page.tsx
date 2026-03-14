'use client';

import dynamic from 'next/dynamic';

// تحميل الـ IDE ديناميكياً لتجنب مشاكل SSR
const IDEPage = dynamic(() => import('@/components/editor/IDEPage'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">المرجع IDE</h2>
          <p className="text-slate-400 text-sm">جاري التحميل...</p>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <IDEPage />;
}
