// ═══════════════════════════════════════════════════════════════════════════════
// دعم Ollama مع نموذج Qwen للغة المرجع
// Ollama Integration with Qwen Model for Al-Marjaa Language
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// أنواع البيانات
// ─────────────────────────────────────────────────────────────────────────────
export type OllamaConfig = {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export type OllamaResponse = {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export type OllamaModelInfo = {
  name: string;
  size: string;
  digest: string;
  modified_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// الإعدادات الافتراضية
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: OllamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'qwen2.5:0.5b',
  temperature: 0.7,
  maxTokens: 2048,
  timeout: 60000,
};

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt للغة المرجع
// ─────────────────────────────────────────────────────────────────────────────
const MARJAA_SYSTEM_PROMPT = `أنت مساعد ذكي للغة المرجع - أول لغة برمجة عربية. مهمتك تحويل الأفكار باللغة العربية إلى كود صحيح.

## قواعد لغة المرجع:

### الأساسيات:
- الفاصلة المنقوطة: "؛" (عربية) أو ";" (إنجليزية)
- الفاصلة: "،" (عربية) أو "," (إنجليزية)

### المتغيرات:
\`\`\`
متغير الاسم = "أحمد";
ثابت باي = 3.14159;
م س = 10;  // اختصار
\`\`\`

### أنواع البيانات:
\`\`\`
متغير رقم = 123;
متغير نص = "مرحباً";
متغير منطقي = صح;  // صح أو خطأ
متغير قائمة = [1، 2، 3];
متغير قاموس = {أ: 1، ب: 2};
\`\`\`

### الدوال:
\`\`\`
دالة جمع(أ، ب) {
    أرجع أ + ب;
}

// دالة سهم
متغير مربع = (ن) => ن ^ 2;
\`\`\`

### الشروط:
\`\`\`
إذا العمر > 18 {
    اطبع("بالغ");
} وإلا {
    اطبع("قاصر");
}

// وإذا
إذا الدرجة >= 90 {
    اطبع("ممتاز");
} وإلا إذا الدرجة >= 70 {
    اطبع("جيد");
} وإلا {
    اطبع("ضعيف");
}
\`\`\`

### الحلقات:
\`\`\`
// طالما
طالما س < 10 {
    س = س + 1;
}

// لكل
لكل عنصر في القائمة {
    اطبع(عنصر);
}

// كرر
كرر 5 مرات {
    اطبع("مرحباً");
}

// نطاق
لكل رقم في نطاق(1، 10) {
    اطبع(رقم);
}
\`\`\`

### البرمجة الكائنية:
\`\`\`
صنف حيوان {
    متغير الاسم;
    
    دالة حيوان(الاسم) {
        هذا.الاسم = الاسم;
    }
    
    دالة صوت() {
        أرجع "صوت عام";
    }
}

صنف كلب: حيوان {
    دالة صوت() {
        أرجع "نباح!";
    }
}

متغير كلبي = جديد كلب("بوبي");
\`\`\`

### معالجة الأخطاء:
\`\`\`
حاول {
    // كود قد يفشل
} امسك (خطأ) {
    اطبع("خطأ: " + خطأ);
} أخيراً {
    // كود التنظيف
}
\`\`\`

### واجهات المستخدم:
\`\`\`
عمود {
    فجوة: 16،
    محاذاة: "وسط"،
    
    عنوان("مرحباً") {
        حجم: 24،
        لون: "#3498db"،
    }،
    
    زر("اضغط هنا") {
        نقر: () => اطبع("تم الضغط!")،
    }،
    
    إدخال {
        رمز: "أدخل اسمك..."،
    }،
}

// التخطيط
صف { }  // أفقي
عمود { }  // عمودي
شبكة { أعمدة: 3 }  // شبكة

// المكونات
زر("نص") { }
نص("محتوى") { }
إدخال { }
بطاقة { }
قائمة { }
جدول { }
صورة("رابط") { }
رسم_خطي { }
رسم_دائري { }
\`\`\`

### الذكاء الاصطناعي:
\`\`\`
// شبكة عصبية
متغير شبكة = شبكة_عصبية();
شبكة.أضف_طبقة(128، "relu");
شبكة.أضف_طبقة(10، "softmax");
شبكة.درّب(بيانات_التدريب، 100، 0.01);
\`\`\`

### دوال مدمجة:
- اطبع(قيمة) - طباعة
- طول(قائمة) - طول القائمة
- نوع(قيمة) - نوع القيمة
- نص(قيمة) - تحويل لنص
- رقم(نص) - تحويل لرقم
- مجموع(قائمة) - مجموع عناصر القائمة
- متوسط(قائمة) - المتوسط
- نطاق(بداية، نهاية) - نطاق أرقام
- مدى(بداية، نهاية) - نفس نطاق

## تعليمات مهمة:
1. أعد فقط الكود بدون شرح إضافي
2. استخدم الكلمات المفتاحية العربية حصراً
3. أضف الفواصل المنقوطة في نهاية كل جملة
4. استخدم المسافات البادئة (4 مسافات) للكتل
5. عند طلب تطبيق، أنشئ كود كامل مع واجهة مستخدم إن أمكن
6. أضف تعليقات توضيحية بالعربية عند الحاجة`;

// ─────────────────────────────────────────────────────────────────────────────
// فئة OllamaClient
// ─────────────────────────────────────────────────────────────────────────────
export class OllamaClient {
  private config: OllamaConfig;
  private available: boolean | null = null;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // التحقق من توفر Ollama
  async isAvailable(): Promise<boolean> {
    if (this.available !== null) return this.available;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.available = response.ok;
      return this.available;
    } catch (error) {
      console.log('[Ollama] غير متوفر:', error);
      this.available = false;
      return false;
    }
  }

  // الحصول على قائمة النماذج المتاحة
  async listModels(): Promise<OllamaModelInfo[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('[Ollama] خطأ في جلب النماذج:', error);
      return [];
    }
  }

  // التحقق من وجود نموذج معين
  async hasModel(modelName: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some(m => m.name.includes(modelName));
  }

  // توليد الكود
  async generateCode(prompt: string, context?: string): Promise<string> {
    const isReady = await this.isAvailable();
    if (!isReady) {
      throw new Error('Ollama غير متوفر. تأكد من تشغيل Ollama محلياً.');
    }

    // بناء الرسالة
    let userMessage = prompt;
    if (context) {
      userMessage = `السياق الحالي:\n\`\`\`\n${context}\n\`\`\`\n\nالطلب: ${prompt}`;
    }

    const systemPrompt = MARJAA_SYSTEM_PROMPT + '\n\n## التعليمات:\nأعد فقط الكود بدون أي شرح أو تفسير.';

    console.log(`[Ollama] إرسال طلب إلى ${this.config.model}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: userMessage,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
            top_p: 0.9,
            top_k: 40,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطأ من Ollama: ${response.status} - ${errorText}`);
      }

      const data: OllamaResponse = await response.json();
      let generatedCode = data.response || '';

      // تنظيف الكود المولّد
      generatedCode = this.cleanGeneratedCode(generatedCode);

      console.log(`[Ollama] تم توليد ${generatedCode.length} حرف`);
      return generatedCode;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('انتهت مهلة الانتظار. حاول مرة أخرى.');
      }
      throw error;
    }
  }

  // توليد مع التدفق (Streaming)
  async *generateCodeStream(prompt: string, context?: string): AsyncGenerator<string> {
    const isReady = await this.isAvailable();
    if (!isReady) {
      throw new Error('Ollama غير متوفر.');
    }

    let userMessage = prompt;
    if (context) {
      userMessage = `السياق:\n${context}\n\nالطلب: ${prompt}`;
    }

    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt: userMessage,
        system: MARJAA_SYSTEM_PROMPT,
        stream: true,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`خطأ من Ollama: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('لا يمكن قراءة الاستجابة');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
          } catch {
            // تجاهل أخطاء التحليل
          }
        }
      }
    }
  }

  // تنظيف الكود المولّد
  private cleanGeneratedCode(code: string): string {
    // إزالة كتل الكود المحددة إذا وجدت
    code = code.replace(/```almarjaa\n?/gi, '');
    code = code.replace(/```mrj\n?/gi, '');
    code = code.replace(/```javascript\n?/gi, '');
    code = code.replace(/```\n?/g, '');

    // إزالة الأسطر الفارغة الزائدة
    code = code.replace(/\n{3,}/g, '\n\n');

    // إزالة المسافات الزائدة
    code = code.trim();

    return code;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// النسخة الافتراضية
// ─────────────────────────────────────────────────────────────────────────────
export const ollamaClient = new OllamaClient();

// ─────────────────────────────────────────────────────────────────────────────
// دوال مساعدة
// ─────────────────────────────────────────────────────────────────────────────
export async function checkOllamaStatus(): Promise<{
  available: boolean;
  models: string[];
  recommendedModel: string | null;
}> {
  const client = new OllamaClient();
  const available = await client.isAvailable();

  if (!available) {
    return { available: false, models: [], recommendedModel: null };
  }

  const models = await client.listModels();
  const modelNames = models.map(m => m.name);

  // البحث عن نموذج Qwen
  const qwenModels = modelNames.filter(n => 
    n.toLowerCase().includes('qwen')
  );

  return {
    available,
    models: modelNames,
    recommendedModel: qwenModels[0] || null,
  };
}

export async function generateWithOllama(
  prompt: string,
  context?: string,
  model?: string
): Promise<{ success: boolean; code: string; model: string; error?: string }> {
  const client = new OllamaClient(model ? { model } : undefined);

  try {
    const code = await client.generateCode(prompt, context);
    return {
      success: true,
      code,
      model: client['config'].model,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    return {
      success: false,
      code: '',
      model: client['config'].model,
      error: errorMessage,
    };
  }
}
