import { NextRequest, NextResponse } from 'next/server';
import { generateCodeFromPatterns, analyzePrompt } from '@/lib/patterns';
import { OllamaClient, checkOllamaStatus } from '@/lib/ollama';

// ─────────────────────────────────────────────────────────────────────────────
// أنواع البيانات
// ─────────────────────────────────────────────────────────────────────────────
interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIRequest {
  prompt: string;
  context?: string;
  files?: Record<string, string>;
  action?: 'generate' | 'edit' | 'explain' | 'fix';
  useAI?: boolean;
  model?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// إعدادات النماذج
// ─────────────────────────────────────────────────────────────────────────────
const AI_CONFIG = {
  // أولوية استخدام AI
  preferAI: process.env.PREFER_AI !== 'false', // الافتراضي: true
  
  // نموذج Ollama الافتراضي
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:0.5b',
  
  // الحد الأقصى للمحاولات
  maxRetries: 2,
};

// ─────────────────────────────────────────────────────────────────────────────
// التحقق من حالة Ollama
// ─────────────────────────────────────────────────────────────────────────────
let ollamaStatus: {
  available: boolean;
  lastChecked: number;
  models: string[];
} = {
  available: false,
  lastChecked: 0,
  models: [],
};

async function getOllamaStatus() {
  // تحديث الحالة كل 30 ثانية
  const now = Date.now();
  if (now - ollamaStatus.lastChecked > 30000) {
    const status = await checkOllamaStatus();
    ollamaStatus = {
      available: status.available,
      lastChecked: now,
      models: status.models,
    };
  }
  return ollamaStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// دالة التوليد الرئيسية
// ─────────────────────────────────────────────────────────────────────────────
async function generateCode(request: AIRequest): Promise<{
  success: boolean;
  code: string;
  explanation?: string;
  action: string;
  model: string;
  fallback?: boolean;
}> {
  const { prompt, context, action = 'generate', useAI = true, model } = request;

  // تحليل الطلب
  const analysis = analyzePrompt(prompt);
  console.log(`[AI API] تحليل:`, analysis);

  // 1. محاولة استخدام Ollama أولاً (إذا كان متوفراً)
  if (useAI && AI_CONFIG.preferAI) {
    const status = await getOllamaStatus();
    
    if (status.available) {
      try {
        console.log('[AI API] استخدام Ollama...');
        const ollama = new OllamaClient({ 
          model: model || AI_CONFIG.ollamaModel 
        });
        
        const code = await ollama.generateCode(prompt, context);
        
        return {
          success: true,
          code,
          action,
          model: `ollama:${model || AI_CONFIG.ollamaModel}`,
        };
      } catch (error) {
        console.error('[AI API] خطأ في Ollama:', error);
        // الاستمرار للأنماط المحلية
      }
    }
  }

  // 2. استخدام الأنماط المحلية
  console.log('[AI API] استخدام الأنماط المحلية...');
  const patternCode = generateCodeFromPatterns(prompt);

  return {
    success: true,
    code: patternCode,
    action,
    model: 'local-patterns',
    fallback: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// معالجة الطلبات
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { prompt, context, files, action = 'generate' } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'الطلب فارغ' },
        { status: 400 }
      );
    }

    // بناء السياق من الملفات إذا وجدت
    let fullContext = context || '';
    if (files && Object.keys(files).length > 0) {
      const filesContext = Object.entries(files)
        .map(([name, content]) => `// ${name}\n${content}`)
        .join('\n\n');
      fullContext = fullContext 
        ? `${fullContext}\n\n${filesContext}` 
        : filesContext;
    }

    // توليد الكود
    const result = await generateCode({
      ...body,
      context: fullContext,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[AI API] خطأ:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ أثناء معالجة الطلب',
        details: error instanceof Error ? error.message : 'خطأ غير معروف',
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// الحصول على معلومات النظام
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const status = await getOllamaStatus();
  
  return NextResponse.json({
    status: 'ready',
    message: 'المرجع AI API جاهز',
    features: {
      vibeCoding: true,
      codeGeneration: true,
      patternMatching: true,
      ollamaIntegration: status.available,
    },
    models: {
      ollama: status.models,
      local: 'pattern-matching',
    },
    defaultModel: status.available 
      ? `ollama:${AI_CONFIG.ollamaModel}` 
      : 'local-patterns',
  });
}
