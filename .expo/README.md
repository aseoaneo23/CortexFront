# 1. Limpiar caché (recomendado)
npx expo start -c

# 2. Generar archivos nativos
npx expo prebuild --clean

# 3. Navegar a carpeta android
cd android

# 4. Limpiar build anterior (Windows)
gradlew clean

# 5. Generar APK de release
gradlew assembleRelease

# 6. El APK estará en:
 android/app/build/outputs/apk/release/app-release.apk