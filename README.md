# Science Trotters APP

## Build With

* Ionic `5.0.0` - HTML5 mobile developement framework.
* Node JS `12.19.0` - JavaScript runtime.
* NPM `6.14.4` - Packages manager and CLI tools.

## Getting Started

1) Prerequisites
First of all you need an installation of Node JS.
https://nodejs.org/en/download/

2) Dependencies

Install ionic CLI
```
npm install -g @ionic/cli
```
Install all the dependencies the project needs.
```
npm install
```

3) Configuration
This application use the following API as data gateway.
https://github.com/medialab/ScienceTrotterS_API

Change API url endpoint.
```
# src/environments

endpoint: {
  data: '[your_api_url]' # api data uri
  assets: '[your_assets_url]' # api assets uri
}
```

4) Running a live browser server

```
# With default port: 8100
ionic serve
# With custom port
ionic serve --port 8091
```

5) Build PWA
```
ionic build --prod
```

Découvrir le guide de publication ionic
```
https://ionicframework.com
```

## License
This project is licensed under the GPLv2 License - see the [GPLv2-LICENSE.md](https://github.com/medialab/ScienceTrotterS_mobile/GPLv2-LICENSE.md) file for details


