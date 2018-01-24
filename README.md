# 2018 旌旗教會屬靈健保書

[![N|Solid](http://www.bannerch.org/images/main%20optic/logo.svg)](http://www.bannerch.org/)

Banner Church Summer Camp 2017旌旗傾城而出夏令營配合大地遊戲使用的App
- [Apple Store下載體驗](https://itunes.apple.com/tw/app/takeover/id1252631432?mt=8)
- [Google Play下載體驗](https://play.google.com/store/apps/details?id=com.banner.takeitover)
# 開源專案協作人員注意事項!
  - 1.)[LottieFiles](https://www.lottiefiles.com/popular?page=5)
  - 2.)[Lottie安裝使用](http://airbnb.io/lottie/react-native/react-native.html#getting-started)
  - 3.)[vector-icons](https://oblador.github.io/react-native-vector-icons/)
***
# Contributors
##### ✰ Bill Youngdi 負責項目：
  - 前後端架構設計及實作(API)
  - 開設工作坊教學
  - 組織及分配工作
  - react-native-fcm的串接
  - react-native-qrcode-scanner的串接
  - IOS & Android 上架
  - integrate code and fix bug
##### ✰ Forest 負責項目：
  - 規劃及設計App各個關卡的遊戲機制(資源表...等等)
##### ✰ Angus Wan 負責項目：
  - 組織及做時程的規劃
  - 發想遊戲機制中的可能性
  - 協助測試及模擬App於實際場域中的各種情形
  - 介面UI名稱
  - 製作各式文件(工作坊介紹、疑難雜症介紹)
##### ✰ Sam Wang 負責項目：
  - 協助整體遊戲機制及程式測試
##### ✰ Bomi Chen 負責項目：
  - 優化整體App的介面UI設計及與設計師進行溝通
##### ✰ Thomas 負責項目：
  - 與Forest討論整體App的介面風格及設計
  - App Icon、launch page、UI、國家icon
  - 首頁設計
  - 九宮格解謎
  - 景文科大資源點背景圖(25格)
  - 領土爭奪戰配合景文科大切分圖(49格)
  - 各種資源(上架)的Icon圖

### Tech of App
This App uses a number of open source projects to work properly:

* [React-Native](https://facebook.github.io/react-native) - Build mobile apps with React
* [React-Navigation](https://github.com/react-community/react-navigation) - React Navigation is born from the React Native community's need for an extensible yet easy-to-use navigation solution. It replaces and improves upon several navigation libraries in the ecosystem, including Ex-Navigation, React Native's Navigator and NavigationExperimental components. React Navigation can also be used across React and React Native projects allowing for a higher degree of shared code.
* [React-Native-Camera](https://github.com/lwansbrough/react-native-camera) - Dependence on React-Native-Qrcode-Scanner
* [React-Native-Code-Push](https://github.com/Microsoft/react-native-code-push) - This plugin provides client-side integration for the CodePush service, allowing you to easily add a dynamic update experience to your React Native app(s).
* [React-Native-FCM](https://github.com/evollu/react-native-fcm) - Help you connect with firebase cloud message(FCM)
* [React-Native-Qrcode-Scanner](https://github.com/moaazsidat/react-native-qrcode-scanner) - A QR code scanner component for React Native
* [React-Native-Modalbox](https://github.com/maxs15/react-native-modalbox) - A react native component, easy, fully customizable, implementing the 'swipe down to close' feature.
* [React-Native-Gifted-Chat](https://github.com/FaridSafi/react-native-gifted-chat) - The most complete chat UI for React Native (formerly known as Gifted Messenger)
* [React-Native-Material-ui](https://github.com/xotahal/react-native-material-ui) - great UI boilerplate for modern web apps
* [React-Native-Vector-Icons](https://github.com/oblador/react-native-vector-icons) - Perfect for buttons, logos and nav/tab bars. Easy to extend, style and integrate into your project.
* [React-Native-Radio-Buttons](https://github.com/ArnaudRinquin/react-native-radio-buttons) - A react component to implement radio buttons-like behaviors: multiple options, only one option can be selected at a given time.
* [React-Redux](https://github.com/reactjs/react-redux) - Official React bindings for Redux for DataFlow
* [Redux](https://socket.io/) - Redux is a predictable state container for JavaScript apps.
* [Redux Online DevTools server](http://remotedev.io/local/) - Already set up in configureStore.js
* [Remote Redux DevTools monitor on React Native Debugger](https://github.com/jhen0409/remote-redux-devtools-on-debugger) - React Native debugger for Redux
* [Socket io](https://socket.io/) - Reliable real-time engine
* [FlexBox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) - CSS layout
* [node.js](https://nodejs.org/en/) - evented I/O for the backend
* [Express](https://github.com/expressjs/express) - fast node.js network app framework [@tjholowaychuk]
* [MongoDB](https://www.mongodb.com/) - noSQL DataBase
* [Firebase](https://firebase.google.com/) - analyze and send cloud messages to your user

***
### Tech of Server
This Server uses a number of open source projects to work properly:

* [Opencc](https://www.npmjs.com/package/opencc) - Open CHinese converter for cn robot api
* [JWT](https://jwt.io/) - JSON WEB TOKEN for securing requests
* [express-jwt](https://github.com/auth0/express-jwt) - A middleware for express for jwt
* [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - A module for sign and verify jwt 
* [moment](https://momentjs.com/) - A standard time module for time stamp for checking the time of keeper giving score.
* [moment-timezone](https://momentjs.com/timezone/) - A standard time module for timezone
* [mongoose](http://mongoosejs.com/) - A module for MongoDB
* [MongoDB](https://www.mongodb.com/) - This project's DB
* [Express](http://expressjs.com/zh-tw/) - Node.js web framework
* [Ansible](https://www.ansible.com/) - Automatic deploy env to AWS EC2
* [AWS EC2](https://aws.amazon.com/tw/) - Deploy our project on it
* [Nginx](https://nginx.org/) - proxy for express port
* [LetsEncrypt](https://letsencrypt.org/) - free SSL
* [Certbot](https://certbot.eff.org/) - generate SSL

***

### Installation

TakeItOver App requires [Node.js](https://nodejs.org/) v7.4.0+ to run.

#### step1 -先至[React Native 入門環境設定](http://ithelp.ithome.com.tw/articles/10186743)後，Clone一份程式到你的本機
```sh
$ git clone https://github.com/Youngdi/TakeItOver.git 
```
#### step2 -進到專案目錄安裝需要的套件
```sh
$ npm install 
```
#### step3 -安裝App到iphone模擬機上(only for mac => Xcode installed)
```sh
$ react-native run-ios
```
#### step4 -安裝App到Android模擬機上(for mac and windows)
```sh
$ react-native run-android
```

***
License
----
MIT

