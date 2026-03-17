#!/bin/bash

# Скрипт сборки Android приложения "Отметки"
# Использование: ./build.sh [debug|release|bundle]

set -e

MODE=${1:-debug}
echo "🚀 Сборка Отметки в режиме: $MODE"

cd android

case $MODE in
  debug)
    echo "📦 Сборка Debug APK..."
    ./gradlew assembleDebug
    echo "✅ Debug APK создан:"
    echo "   app/build/outputs/apk/debug/app-debug.apk"
    ;;
  release)
    echo "📦 Сборка Release APK..."
    ./gradlew assembleRelease
    echo "✅ Release APK создан:"
    echo "   app/build/outputs/apk/release/app-release.apk"
    ;;
  bundle)
    echo "📦 Сборка App Bundle..."
    ./gradlew bundleRelease
    echo "✅ App Bundle создан:"
    echo "   app/build/outputs/bundle/release/app-release.aab"
    ;;
  clean)
    echo "🧹 Очистка..."
    ./gradlew clean
    echo "✅ Очистка завершена"
    ;;
  *)
    echo "❌ Неизвестный режим: $MODE"
    echo "Использование: ./build.sh [debug|release|bundle|clean]"
    exit 1
    ;;
esac

echo "🎉 Готово!"
