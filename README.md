# Отметки - Android Сборка

Полная рабочая сборка Android приложения "Отметки" без ошибок Firebase и с правильными иконками.

## Что исправлено

- ✅ Иконка приложения отображается корректно
- ✅ Название приложения "Отметки" 
- ✅ Нет ошибок Firebase (Default FirebaseApp is not initialized)
- ✅ Все разрешения настроены
- ✅ Android 12+ совместимость

## Структура проекта

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/ru/pvz183912/otmetki/
│   │   │   ├── MainActivity.java
│   │   │   └── MainApplication.java
│   │   └── res/
│   │       ├── drawable/
│   │       │   └── splash_screen.xml
│   │       ├── mipmap-*/
│   │       │   ├── ic_launcher.png
│   │       │   ├── ic_launcher_round.png
│   │       │   ├── ic_launcher_foreground.png
│   │       │   ├── ic_launcher_background.png
│   │       │   ├── ic_launcher.xml
│   │       │   └── ic_launcher_round.xml
│   │       ├── values/
│   │       │   ├── colors.xml
│   │       │   ├── strings.xml
│   │       │   ├── styles.xml
│   │       │   └── themes.xml
│   │       └── xml/
│   │           ├── file_paths.xml
│   │           └── network_security_config.xml
│   ├── build.gradle
│   ├── proguard-rules.pro
│   └── google-services.json (ЗАМЕНИТЕ НА СВОЙ!)
├── build.gradle
├── settings.gradle
├── gradle.properties
└── local.properties.example
```

## Быстрая сборка

### 1. Подготовка

```bash
# Установите Android Studio
# https://developer.android.com/studio

# Убедитесь что установлены:
# - Android SDK
# - Android SDK Build-Tools 34.0.0
# - Android SDK Platform-Tools
# - Android SDK Platform 34
```

### 2. Настройка Firebase (ОБЯЗАТЕЛЬНО!)

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект или используйте существующий
3. Добавьте Android приложение с package name: `ru.pvz183912.otmetki`
4. Скачайте `google-services.json`
5. **Замените** файл `android/app/google-services.json` на скачанный

### 3. Настройка SDK пути

```bash
# Скопируйте пример и отредактируйте
cp android/local.properties.example android/local.properties

# Откройте local.properties и укажите путь к Android SDK:
# macOS:
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk

# Windows:
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk

# Linux:
sdk.dir=/home/YOUR_USERNAME/Android/Sdk
```

### 4. Сборка APK

```bash
cd android

# Для Windows:
gradlew.bat assembleDebug

# Для macOS/Linux:
./gradlew assembleDebug
```

APK будет создан в: `app/build/outputs/apk/debug/app-debug.apk`

### 5. Сборка Release APK

```bash
# Создайте keystore (один раз)
keytool -genkey -v -keystore otmetki.keystore -alias otmetki -keyalg RSA -keysize 2048 -validity 10000

# Соберите release
./gradlew assembleRelease
```

### 6. Сборка App Bundle (для Google Play)

```bash
./gradlew bundleRelease
```

AAB будет создан в: `app/build/outputs/bundle/release/app-release.aab`

## Открытие в Android Studio

1. Откройте Android Studio
2. Выберите "Open an existing Android Studio project"
3. Выберите папку `android/`
4. Дождитесь синхронизации Gradle
5. Нажмите "Run" (зелёный треугольник)

## Решение проблем

### Ошибка: "SDK location not found"

Создайте файл `local.properties` с правильным путём к SDK.

### Ошибка: "Could not find com.capacitorjs:core"

```bash
# Очистите кэш
./gradlew clean
./gradlew build --refresh-dependencies
```

### Ошибка: "FirebaseApp not initialized"

Убедитесь что:
1. Заменили `google-services.json` на свой из Firebase Console
2. Package name в Firebase совпадает с `ru.pvz183912.otmetki`

### Ошибка: "Duplicate class"

```bash
./gradlew clean
./gradlew assembleDebug
```

## Конфигурация

### Версия приложения

Отредактируйте в `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1          // Увеличивайте при каждом обновлении
    versionName "1.0.0"    // Версия для пользователей
}
```

### Разрешения

Все необходимые разрешения уже добавлены в `AndroidManifest.xml`:
- Интернет
- Геолокация
- Камера
- Хранилище
- Микрофон
- Уведомления

## Публикация в Google Play

1. Создайте аккаунт разработчика Google Play ($25)
2. Соберите App Bundle: `./gradlew bundleRelease`
3. Загрузите `app-release.aab` в Google Play Console
4. Заполните информацию о приложении
5. Отправьте на проверку

## Контакты

При возникновении проблем:
- Email: support@pvz-183912.ru
- Сайт: https://pvz-183912.ru
