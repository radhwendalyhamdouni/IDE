; المرجع IDE - NSIS Installer Script
; Custom installer pages and Arabic language support

!include "MUI2.nsh"
!include "LangFile.nsh"

; Custom page for Ollama installation
Function InstallOllamaPage
    nsDialogs::Create 1018
    Pop $0
    
    ${If} $0 == error
        Abort
    ${EndIf}
    
    ; Create custom UI for Ollama installation option
    ${NSD_CreateLabel} 0 0 100% 24u "تثبيت Ollama للذكاء الاصطناعي المحلي"
    Pop $1
    
    ${NSD_CreateLabel} 0 30u 100% 40u "سيقوم المثبت بتثبيت Ollama تلقائياً. يتطلب هذا حوالي 500 ميجابايت من المساحة."
    Pop $2
    
    ${NSD_CreateCheckbox} 0 80u 100% 12u "تثبيت Ollama (موصى به)"
    Pop $3
    ${NSD_Check} $3
    
    nsDialogs::Show
FunctionEnd

; Arabic language strings
${LangFileString} WelcomeTitle "مرحباً بك في مثبت المرجع IDE"
${LangFileString} WelcomeText "سيقوم هذا المعالج بتثبيت المرجع IDE على جهازك.$\r$\n$\r$\nأول بيئة تطوير عربية بذكاء اصطناعي.$\r$\n$\r$\nيوصى بإغلاق جميع التطبيقات الأخرى قبل بدء التثبيت."

${LangFileString} InstallOllamaTitle "تثبيت Ollama"
${LangFileString} InstallOllamaText "Ollama هو محرك الذكاء الاصطناعي المحلي. سيتم تثبيته تلقائياً مع التطبيق."

${LangFileString} DownloadingModel "جاري تحميل نموذج الذكاء الاصطناعي..."
${LangFileString} InstallingOllama "جاري تثبيت Ollama..."

${LangFileString} FinishedTitle "اكتمل التثبيت"
${LangFileString} FinishedText "تم تثبيت المرجع IDE بنجاح على جهازك.$\r$\n$\r$\nيمكنك الآن تشغيل التطبيق من قائمة ابدأ."

; Silent install parameters
SilentInstall normal
SilentUninstall normal
