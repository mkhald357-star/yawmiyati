@echo off
chcp 65001 > nul
echo ===================================================
echo   بناء تطبيق مدبر المهام لأجهزة أندرويد (APK & AAB)
echo ===================================================
echo.

if not exist "gradlew.bat" (
    echo [خطأ] لم يتم العثور على gradlew.bat في هذا المجلد.
    pause
    exit /b 1
)

echo [1/3] جاري تنظيف المشروع والمخرجات السابقة...
call gradlew.bat clean

echo [2/3] جاري بناء ملف التثبيت المباشر (APK)...
call gradlew.bat assembleRelease

echo [3/3] جاري بناء حزمة متجر جوجل بلاي (AAB)...
call gradlew.bat bundleRelease

echo.
echo ===================================================
echo   تم اكتمال البناء بنجاح!
echo ===================================================
echo ستجد ملفات التطبيق في المسار:
echo   - APK: app\build\outputs\apk\release\
echo   - AAB: app\build\outputs\bundle\release\
echo.
pause
