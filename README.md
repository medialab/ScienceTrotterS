# Science Trotters APP

## Build With

* Ionic `3.19.1` - HTML5 mobile developement framework.
* Node JS `8.6.0` - JavaScript runtime.
* NPM `5.03` - Packages manager and CLI tools.

## Getting Started

1) Prerequisites
First of all you need an installation of Node JS.
https://nodejs.org/en/download/

2) Dependencies 

Install ionic and cordova
```
npm install -g ionic@3.19.1
npm i -g cordova
```
Install all the dependencies the project needs.
```
npm install
```

3) Configuration
This application use the following API as data gateway.
https://github.com/medialab/ScienceTrotterS_API

* Change API url endpoint.
```
# src/manifest.json
{
  ...
  'endpoint_data': '[your_custom_url]' # api data uri
  'endpoint_assets': '[your_custom_url]' # api assets uri
  'target:' '[your_target_platform]' # android or ios
  ...
}
```

4) Running a live browser server

```
# With default port : 8100
ionic serve
# With custom port
ionic serve --port 8091
```

5) Build Android Application
```
ionic cordova build android
```
6) Build Ios Application
```
ionic cordova build ios
```


Découvrir le guide de publication ionic
```
https://ionicframework.com/docs/v1/guide/publishing.html
```

## License
This project is licensed under the GPLv2 License - see the [GPLv2-LICENSE.md](https://github.com/medialab/ScienceTrotterS_mobile/GPLv2-LICENSE.md) file for details

7) Push application on stores (AppStore and GooglePlay)

[https://ionicframework.com/docs/v1/guide/publishing.html](https://ionicframework.com/docs/v1/guide/publishing.html)


