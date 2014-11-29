#!/bin/sh

rm -r ./build
rm -r ./build_opera
rm -r ./build_firefox_sdk
rm -r ./build_safari.safariextension

mkdir ./build
mkdir ./build_opera
mkdir ./build_firefox_sdk
mkdir ./build_safari.safariextension

cp ../src/vendor/Firefox/lib/monoLib.js ./vendor/firefox/lib/

cp -r ./js ./build/js
cp ./*.html ./build/
cp ./*.json ./build/

# Firefox addon sdk
# need create folder symbol link to addon-sdk/bin and run cfx xpi

mkdir ./build_firefox_sdk/data
cp -r ./build ./build_firefox_sdk/data
rm ./build_firefox_sdk/data/manifest.json
cp -r ./vendor/firefox/* ./build_firefox_sdk/
cp -r ./js/background.js ./build_firefox_sdk/lib/
rm ./build_firefox_sdk/data/js/background.js

# Safari

cp -r ./build ./build_safari.safariextension
rm ./build_safari.safariextension/manifest.json
cp -r ./vendor/safari/* ./build_safari.safariextension/

# Opera

cp -r ./build ./build_opera
rm ./build_opera/manifest.json
cp -r ./vendor/opera/* ./build_opera/

cd ./build_opera/
zip -9 -r ../build_opera.zip ./
cd ../