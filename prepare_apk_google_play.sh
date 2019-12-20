jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore STS_release.keystore ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk STS
rm ./platforms/android/app/build/outputs/apk/release/STS_prod.apk
zipalign -v 4  ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ./platforms/android/app/build/outputs/apk/release/STS_prod.apk
