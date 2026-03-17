@echo off
chcp 65001 >nul

:: Скрипт сборки Android приложения "Отметки"
:: Использование: build.bat [debug|release|bundle]

set MODE=%1
if "%MODE%"=="" set MODE=debug

echo 🚀 Сборка Отметки в режиме: %MODE%
cd android

if "%MODE%"=="debug" (
    echo 📦 Сборка Debug APK...
    gradlew.bat assembleDebug
    echo ✅ Debug APK создан:
    echo    app\build\outputs\apk\debug\app-debug.apk
) else if "%MODE%"=="release" (
    echo 📦 Сборка Release APK...
    gradlew.bat assembleRelease
    echo ✅ Release APK создан:
    echo    app\build\outputs\apk\release\app-release.apk
) else if "%MODE%"=="bundle" (
    echo 📦 Сборка App Bundle...
    gradlew.bat bundleRelease
    echo ✅ App Bundle создан:
    echo    app\build\outputs\bundle\release\app-release.aab
) else if "%MODE%"=="clean" (
    echo 🧹 Очистка...
    gradlew.bat clean
    echo ✅ Очистка завершена
) else (
    echo ❌ Неизвестный режим: %MODE%
    echo Использование: build.bat [debug^|release^|bundle^|clean]
    exit /b 1
)

echo 🎉 Готово!
cd ..
