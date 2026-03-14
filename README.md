# المرجع IDE | Al-Marjaa IDE

<div align="center">

![المرجع IDE](https://img.shields.io/badge/المرجع-IDE-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-3.4.1-green?style=flat-square)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red?style=flat-square)

**أول بيئة تطوير عربية بذكاء اصطناعي محلي**

[English](#english) | [العربية](#العربية)

</div>

---

## العربية

### 🌟 نظرة عامة

**المرجع IDE** هي بيئة تطوير متكاملة مبنية على تقنيات حديثة (Next.js + Electron) مع دعم كامل للغة العربية والذكاء الاصطناعي المحلي.

### ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 🚀 **Vibe Coding** | اكتب بالعربية وحوّلها إلى كود تلقائياً |
| 🤖 **ذكاء اصطناعي محلي** | يعمل بدون انترنت باستخدام Ollama + Qwen |
| 📝 **محرر أكواد متقدم** | تلوين للكود العربي مع دعم RTL |
| 🎨 **واجهة عصرية** | تصميم داكن جميل مع shadcn/ui |
| 📦 **تثبيت تلقائي** | يثبت Ollama والنماذج آلياً |
| 🌍 **متعدد المنصات** | Windows, macOS, Linux |
| 🔧 **أنماط محلية محسنة** | 30+ نمط لتوليد الكود مباشرة |

### 🆕 آخر التحديثات (v3.4.1)

- ✅ إصلاح دعم الأحرف العربية في أنماط التوليد
- ✅ تحسين التعرف على المتغيرات العربية
- ✅ إضافة أنماط جديدة للتطبيقات الكاملة
- ✅ تحسين واجهة المستخدم والرسائل

### 📥 التثبيت

#### Windows
```powershell
# تحميل المثبت
# من صفحة Releases
```

#### macOS
```bash
# تحميل ملف DMG
# أو استخدام Homebrew
brew install --cask al-marjaa-ide
```

#### Linux
```bash
# AppImage
chmod +x Al-Marjaa-IDE-3.4.0-x64.AppImage
./Al-Marjaa-IDE-3.4.0-x64.AppImage

# أو باستخدام Snap
snap install al-marjaa-ide

# أو Debian/Ubuntu
sudo dpkg -i al-marjaa-ide_3.4.0_amd64.deb
```

### 🔧 التثبيت من المصدر

```bash
# استنساخ المستودع
git clone https://github.com/radhwendalyhamdouni/IDE.git
cd IDE

# تثبيت المتطلبات
bun install

# تشغيل في وضع التطوير
bun run dev:electron

# بناء التطبيق
bun run build:electron
bun run dist:all
```

### 🖥️ لقطة الشاشة

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 المرجع IDE                        [AI Powered] ⚙️ 🐙    │
├──────────────────────┬──────────────────────────────────────┤
│                      │  📝 المحرر  │  👁️ المعاينة          │
│   💬 Vibe Coding     ├──────────────────────────────────────┤
│                      │  متغير الاسم = "أحمد";               │
│   اكتب بالعربية...   │  دالة رحب(الاسم) {                  │
│                      │      اطبع("مرحباً");                 │
│   [💡 اقتراحات]      │  }                                   │
│                      ├──────────────────────────────────────┤
│   🚀 أنشئ متجر       │  ▶️ تشغيل  💾 حفظ                    │
│   🌐 أنشئ موقع       ├──────────────────────────────────────┤
│   📱 أنشئ تطبيق      │  المخرجات:                          │
│                      │  > مرحباً أحمد!                      │
├──────────────────────┴──────────────────────────────────────┤
│  📄 لغة المرجع v3.4.0  │  الأسطر: 5  │  UTF-8  │  🟢 متصل   │
└─────────────────────────────────────────────────────────────┘
```

---

## English

### 🌟 Overview

**Al-Marjaa IDE** is a complete development environment built with modern technologies (Next.js + Electron) with full Arabic language support and local AI integration.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **Vibe Coding** | Write in Arabic, convert to code automatically |
| 🤖 **Local AI** | Works offline using Ollama + Qwen |
| 📝 **Advanced Editor** | Arabic syntax highlighting with RTL support |
| 🎨 **Modern UI** | Beautiful dark theme with shadcn/ui |
| 📦 **Auto Install** | Automatically installs Ollama and models |
| 🌍 **Cross-Platform** | Windows, macOS, Linux |

### 📥 Installation

Download from the [Releases](https://github.com/radhwendalyhamdouni/IDE/releases) page.

### 🔧 Build from Source

```bash
git clone https://github.com/radhwendalyhamdouni/IDE.git
cd IDE
bun install
bun run dev:electron
```

---

## 📚 Technology Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Desktop**: Electron 41
- **UI Components**: shadcn/ui, Radix UI
- **AI**: Ollama + Qwen 2.5
- **Database**: SQLite + Prisma
- **Code Editor**: CodeMirror 6

---

## 📝 License

© 2026 رضوان دالي حمدوني | All Rights Reserved

This project is protected by intellectual property rights. Only **non-commercial** use is allowed with attribution.

---

## 👨‍💻 Author

**رضوان دالي حمدوني | RADHWEN DALY HAMDOUNI**

- GitHub: [@radhwendalyhamdouni](https://github.com/radhwendalyhamdouni)
- Email: almarjaa.project@hotmail.com

---

<div align="center">

**صُنع بـ ❤️ للعالم العربي**

</div>
