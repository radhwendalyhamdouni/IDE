import { NextRequest, NextResponse } from 'next/server';

interface RunCodeRequest {
  code: string;
  action?: 'run' | 'vibe' | 'lint';
  naturalText?: string;
}

// محاكاة تنفيذ كود المرجع
function simulateExecution(code: string): string[] {
  const outputs: string[] = [];
  const lines = code.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // طباعة
    const printMatch = trimmed.match(/اطبع\s*\(\s*["'](.+?)["']\s*\)/);
    if (printMatch) {
      outputs.push(printMatch[1]);
    }
    
    // متغير
    const varMatch = trimmed.match(/متغير\s+(\w+)\s*=\s*(.+)/);
    if (varMatch) {
      outputs.push(`متغير ${varMatch[1]} = ${varMatch[2]}`);
    }
    
    // دالة
    const funcMatch = trimmed.match(/دالة\s+(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      outputs.push(`تعريف دالة: ${funcMatch[1]}(${funcMatch[2]})`);
    }
  });
  
  return outputs;
}

// تحويل النص الطبيعي إلى كود
function vibeTextToCode(text: string): string {
  const lowerText = text.toLowerCase();
  
  // أنماط التحويل
  const patterns = [
    {
      pattern: /أنشئ\s+(?:متغير|variable)\s+(\w+)\s+(?:يساوي|=)\s+(.+)/i,
      template: (m: RegExpMatchArray) => `متغير ${m[1]} = ${m[2]};`
    },
    {
      pattern: /اطبع\s+["']?(.+?)["']?/i,
      template: (m: RegExpMatchArray) => `اطبع("${m[1]}");`
    },
    {
      pattern: /أنشئ\s+دالة\s+(\w+)\s*\(([^)]*)\)/i,
      template: (m: RegExpMatchArray) => `دالة ${m[1]}(${m[2]}) {\n    // TODO: أضف المنطق هنا\n}`
    },
    {
      pattern: /أنشئ\s+(?:موقع|site|website)\s+(?:باسم\s+)?["']?(.+?)["']?/i,
      template: (m: RegExpMatchArray) => `// موقع: ${m[1]}\nمتغير اسم_الموقع = "${m[1]}";\n\nاطبع("مرحباً بك في " + اسم_الموقع);`
    },
    {
      pattern: /أنشئ\s+(?:تطبيق|app)\s+(?:مهام|todo)/i,
      template: () => `// تطبيق قائمة المهام
متغير المهام = [];

دالة أضف_مهمة(النص) {
    المهام.أضف({ نص: النص، مكتمل: false });
    اطبع("تمت إضافة المهمة: " + النص);
}

دالة أعرض_المهام() {
    لكل مهمة في المهام {
        اطبع("- " + مهمة.نص);
    }
}`
    },
  ];
  
  // محاولة مطابقة الأنماط
  for (const { pattern, template } of patterns) {
    const match = text.match(pattern);
    if (match) {
      return template(match);
    }
  }
  
  // نمط افتراضي
  return `// لم يتم التعرف على النمط تماماً
// النص الأصلي: "${text}"
// جرب كتابة: "أنشئ متغير اسم يساوي أحمد"
// أو: "أنشئ موقع باسم متجري"`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RunCodeRequest = await request.json();
    const { code, action = 'run', naturalText } = body;
    
    if (action === 'vibe' && naturalText) {
      // Vibe Coding - تحويل النص إلى كود
      const generatedCode = vibeTextToCode(naturalText);
      return NextResponse.json({
        success: true,
        generatedCode,
        message: 'تم تحويل النص إلى كود',
      });
    }
    
    if (action === 'lint') {
      // تحليل الكود
      const issues: string[] = [];
      const lines = code.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('اطبع') && !line.includes(');')) {
          issues.push(`سطر ${index + 1}: قد تكون ناقصة فاصلة منقوطة`);
        }
        if (line.includes('متغير') && !line.includes('=')) {
          issues.push(`سطر ${index + 1}: المتغير يحتاج قيمة`);
        }
      });
      
      return NextResponse.json({
        success: true,
        issues,
        message: issues.length === 0 ? 'الكود سليم!' : 'تم العثور على مشاكل',
      });
    }
    
    // تنفيذ الكود
    const outputs = simulateExecution(code);
    
    return NextResponse.json({
      success: true,
      output: outputs.join('\n') || 'تم التنفيذ بنجاح (بدون مخرجات)',
      outputs,
    });
    
  } catch (error) {
    console.error('Run code error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تنفيذ الكود' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'المرجع Code Runner API جاهز',
    actions: ['run', 'vibe', 'lint'],
  });
}
