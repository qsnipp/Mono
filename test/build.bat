rd /S /Q .\build
rd /S /Q .\build_opera
rd /S /Q .\build_firefox_sdk
rd /S /Q .\build_safari.safariextension

mkdir .\build
mkdir .\build_opera
mkdir .\build_firefox_sdk
mkdir .\build_safari.safariextension

xcopy .\js .\build\js\ /E
copy .\*.html .\build\.
copy .\*.json .\build\.

:: firefox addon sdk
:: need create folder symbol link to addon-sdk\bin and run cfx xpi

mkdir .\build_firefox_sdk\data
xcopy .\build .\build_firefox_sdk\data\ /E
del .\build_firefox_sdk\data\manifest.json
xcopy .\vendor\firefox\* .\build_firefox_sdk\. /E /Y
xcopy .\js\background.js .\build_firefox_sdk\lib\. /E
del .\build_firefox_sdk\data\js\background.js

:: safari

xcopy .\build .\build_safari.safariextension\ /E
del .\build_safari.safariextension\manifest.json
xcopy .\vendor\safari\* .\build_safari.safariextension\. /E /Y

:: opera

xcopy .\build .\build_opera\ /E
del .\build_opera\manifest.json
xcopy .\vendor\opera\* .\build_opera\. /E
move .\build_opera\js\inject.js .\build_opera\includes\.
move .\build_opera\js\base.js .\build_opera\includes\.
xcopy .\build_opera\js\mono.js .\build_opera\includes\.
rename .\build_opera\includes\mono.js _mono.js

:: building

..\..\7za a -tzip .\build_opera.oex .\build_opera\*