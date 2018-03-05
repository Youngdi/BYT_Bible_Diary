rm bytbible.apk
rm bytbible_singed.apk
cd android && ./gradlew clean
./gradlew assembleRelease
cd ../
cp ./android/app/build/outputs/apk/app-release-unsigned.apk ./
mv app-release-unsigned.apk bytbible.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./doc/bytbible.keystore bytbible.apk -storepass bytbible bytbible
zipalign -v 4 bytbible.apk  bytbible_singed.apk
adb install -r bytbible_singed.apk
adb shell am start -n com.bytbible.diary/.MainActivity