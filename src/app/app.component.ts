import {Component, ElementRef, ViewChild} from '@angular/core';
import {Content, MenuController, Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { HomePage } from '../pages/home/home';
import {TranslateProvider} from "../providers/translate";
import {ConfigProvider} from "../providers/config";
import {ApiProvider} from "../providers/api";

@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  /**
   * Page par défaut qui va être chargée lors de l'ouverture.
   *
   * @type {HomePage} - Page.
   */
  rootPage:any;

  @ViewChild('btnClose') btnClose: Content;

  /**
   * Context de navigation.
   */
  @ViewChild(Nav) nav;

  constructor (platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen,
              public menuCtrl: MenuController,
              public config: ConfigProvider,
              public translate: TranslateProvider,
              public api: ApiProvider,
              private camera: Camera) {

    /**
     * Initialisation de l'application.
     */
    platform.ready().then(() => {
      config.initialize();
      statusBar.styleDefault();

      console.log('statusBar', statusBar);

      api.loadApiUrl().then(res => {
        this.rootPage = HomePage;
        this.nav.setRoot(HomePage);
      }).catch(err => {
        splashScreen.hide();
        this.rootPage = HomePage;
        this.nav.setRoot(HomePage);
      })

      splashScreen.hide();
    });

  }

  /**
   * Au clique d'un lien du menu, une nouvelle page
   * va être ouverte.
   *
   * @param {string} nextPage - Nom d'une page.
   */
  onItemClick (event: any, nextPage: string = '') {
    event.preventDefault();

    this.menuCtrl.close();

    if (nextPage !== '') {
      this.nav.push(nextPage);
    }
  }

  /**
   *
   */
  openCamera () {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: true,
      cameraDirection: this.camera.Direction.BACK
    };
    this.camera.getPicture(options);
  }

  /**
   *
   * @param state
   * @param target
   */
  menuHandler (state: any, target: string) {
    const focusHandler = () => {
      setTimeout(() => {
        this.btnClose._elementRef.nativeElement.focus();
      }, 0);
    };

    if (typeof state === 'boolean') {
      switch (target) {
        case 'open':
          this.config.updateMenuState(true);
          focusHandler();
          break;
        case 'close':
          this.config.updateMenuState(false);
          break;
      }
    }
  }

  blurTest () {
    console.log('blurTest');
  }
}
