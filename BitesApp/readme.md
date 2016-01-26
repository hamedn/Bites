Plugins
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-file
cordova plugin add https://github.com/VersoSolutions/CordovaClipboard.git
cordova plugin add https://github.com/fastrde/phonegap-parse-plugin
cordova plugin add cordova-plugin-network-information
cordova plugin add org.apache.cordova.splashscreen



Put this in the info.plist
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

libsass bug: 
sudo npm uninstall --save-dev gulp-sass
sudo npm install --save-dev gulp-sass@2
