# GitHub Actions - Автоматическая сборка Android

## Быстрый старт

### 1. Скопируйте workflow файлы

```bash
# В корне вашего репозитория
mkdir -p .github/workflows
cp READY_TO_BUILD/.github/workflows/*.yml .github/workflows/
```

### 2. Закоммитьте и запушьте

```bash
git add .github/workflows/
git commit -m "Add GitHub Actions for Android build"
git push
```

### 3. Готово!

При каждом пуше в `main`, `master` или `develop` будет автоматически собираться Debug APK.

---

## Типы сборок

### Debug APK (по умолчанию)
- Собирается автоматически при каждом пуше
- Не требует подписи
- Для тестирования

### Release APK (подписанный)
- Собирается при создании тега `v*` (например `v1.0.0`)
- Требует keystore
- Готов к публикации

### App Bundle (AAB)
- Для Google Play
- Оптимизирован под разные устройства

---

## Настройка подписанной сборки

### 1. Создайте Keystore (один раз)

```bash
keytool -genkey -v \
  -keystore otmetki.keystore \
  -alias otmetki \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Запомните:
- Пароль keystore
- Alias
- Пароль ключа

### 2. Закодируйте keystore в base64

```bash
# macOS/Linux
base64 -i otmetki.keystore -o keystore.base64

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("otmetki.keystore")) | Out-File -Encoding ASCII keystore.base64
```

### 3. Добавьте Secrets в GitHub

1. Откройте репозиторий на GitHub
2. Перейдите в **Settings → Secrets and variables → Actions**
3. Нажмите **New repository secret**
4. Добавьте следующие secrets:

| Secret Name | Value |
|-------------|-------|
| `KEYSTORE_BASE64` | Содержимое файла keystore.base64 |
| `KEYSTORE_PASSWORD` | Пароль от keystore |
| `KEY_ALIAS` | Alias (например `otmetki`) |
| `KEY_PASSWORD` | Пароль ключа |

### 4. Создайте тег для релиза

```bash
# Установите версию
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

GitHub Actions автоматически:
- Соберёт подписанный APK
- Соберёт AAB
- Создаст Release на GitHub с файлами

---

## Ручной запуск сборки

1. Перейдите в **Actions** на GitHub
2. Выберите workflow "Android Build"
3. Нажмите **Run workflow**
4. Выберите тип сборки:
   - `debug` - Debug APK
   - `release` - Release APK (требует secrets)
   - `bundle` - App Bundle

---

## Получение собранных файлов

### Способ 1: Артефакты
1. Откройте завершённый workflow
2. Прокрутите вниз до **Artifacts**
3. Скачайте нужный файл

### Способ 2: Releases
1. Перейдите в **Releases** репозитория
2. Откройте нужный релиз
3. Скачайте APK или AAB

---

## Настройка Firebase App Distribution (опционально)

Для автоматической отправки тестерам:

### 1. Добавьте secrets

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_TOKEN` | Токен из `firebase login:ci` |
| `FIREBASE_APP_ID` | App ID из Firebase Console |

### 2. Добавьте шаг в workflow

```yaml
    - name: Upload to Firebase App Distribution
      uses: wzieba/Firebase-Distribution-Github-Action@v1
      with:
        appId: ${{ secrets.FIREBASE_APP_ID }}
        token: ${{ secrets.FIREBASE_TOKEN }}
        groups: testers
        file: android/app/build/outputs/apk/release/app-release.apk
```

---

## Настройка публикации в Google Play (опционально)

### 1. Создайте service account в Google Play Console

1. Google Play Console → Setup → API access
2. Создайте service account
3. Скачайте JSON ключ

### 2. Добавьте secrets

| Secret Name | Value |
|-------------|-------|
| `PLAY_STORE_JSON_KEY` | Содержимое JSON ключа |

### 3. Добавьте шаг в workflow

```yaml
    - name: Publish to Google Play
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_JSON_KEY }}
        packageName: ru.pvz183912.otmetki
        releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
        track: internal
```

---

## Устранение неполадок

### Ошибка: "Permission denied" для gradlew

```bash
git update-index --chmod=+x android/gradlew
git commit -m "Make gradlew executable"
git push
```

### Ошибка: "Could not find com.capacitorjs:core"

```bash
# Очистите кэш в workflow
- name: Clean Gradle
  run: |
    cd android
    ./gradlew clean
```

### Ошибка: "Keystore file not found"

Проверьте:
1. Добавлен ли `KEYSTORE_BASE64` в secrets
2. Правильные ли пароли в secrets

---

## Полезные ссылки

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android Actions](https://github.com/android-actions/setup-android)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
