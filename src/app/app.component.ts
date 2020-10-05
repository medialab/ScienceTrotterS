import { NetworkService } from './../providers/network';
import { LocalDataProvider } from './../providers/localData';
import { PointOfInterestPage } from './../pages/point-of-interest/point-of-interest';
import {Component, ElementRef, ViewChild} from '@angular/core';
import { Content, Events, MenuController, Nav, NavParams, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { HomePage } from '../pages/home/home';
import {TranslateProvider} from "../providers/translate";
import {ConfigProvider} from "../providers/config";
import {ApiProvider} from "../providers/api";
import { CacheService } from "ionic-cache";
import {Observable} from "rxjs/Observable";
import {PlayerAudioProvider} from "../providers/playerAudio";
import {PreviewByCityPage} from "../pages/preview-by-city/preview-by-city";
import {LoaderPage} from "../pages/loader/loader";
import {DirectAccessPage} from "../pages/direct-access/direct-access";
import {GeolocProvider} from "../providers/geoloc";
import {AlertProvider} from "../providers/alert";
import {DataProvider} from "../providers/data";


@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  /**
   * Page par défaut qui va être chargée lors de l'ouverture.
   *
   * @type {LoaderPage} - Page.
   */
  rootPage:any = LoaderPage;

  isAndroid: boolean = false;
  isIOS: boolean = false;
  isInstallToastShown: boolean = false;
  deferredPrompt = null;


  isInStandaloneMode = () => ('standalone' in window.navigator) && window.navigator['standalone'];


  @ViewChild('btnClose') btnClose: Content;

  /**
   * Context de navigation.
   */
  @ViewChild(Nav) nav;

  constructor (public playerAudioProvider: PlayerAudioProvider,
               public platform: Platform,
               public statusBar: StatusBar,
               public splashScreen: SplashScreen,
               public menuCtrl: MenuController,
               public config: ConfigProvider,
               public translate: TranslateProvider,
               public events: Events,
               public geoloc: GeolocProvider,
               public cache: CacheService,
               public data: DataProvider,
               private localData: LocalDataProvider,
               private toastCtrl: ToastController,
               public api: ApiProvider,
               public alert: AlertProvider,
               private camera: Camera) {
    /**
     * Initialisation de l'application.
     */
    platform.ready().then(() => {
      statusBar.styleDefault();
      //statusBar.overlaysWebView(false);
      statusBar.backgroundColorByHexString('#f8f8f8');
      this.globalListener();

      splashScreen.hide();
      config.initialize();

      // Set TTL to 31 days.
      cache.setDefaultTTL(86400 * 31);
      // Keep our cached results when device is offline!
      cache.setOfflineInvalidate(false);

      // Chargement de la configuration.
      config.loadConfiguration().then(() => {
        if (typeof this.nav.getActive() !== 'undefined') {
          this.handleDirectAccess(this.nav.getActive().name);
        } else {
          this.handleDirectAccess('');
        }
      });

      this.events.subscribe('config:updateLanguage', () => {
        this.isAndroid = this.platform.is('android');
        this.isIOS = this.platform.is('ios');
        // PWA - iOS install banner
        if (this.isIOS && !this.isInStandaloneMode()) {
          this.isInstallToastShown = this.localData.getInstallToastShown() !== undefined && this.localData.getInstallToastShown() !== null;
          if (!this.isInstallToastShown) {
            this.showInstallToast();
          }
        }

        window.addEventListener('beforeinstallprompt', (e) => {
          console.log('beforeinstallprompt Event fired');
          // Prevent Chrome 67 and earlier from automatically showing the prompt
          e.preventDefault();
          // Stash the event so it can be triggered later.
          this.deferredPrompt = e;
          if (!this.isInstallToastShown) {
            this.showInstallToast();
          }
        });
      })
    });
  }

  showInstallToast() {
    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    const messageIOS = isSafari ? this.translate.getKey("TOAST_MSG_INSTALL_SAFARI") : this.translate.getKey("TOAST_MSG_INSTALL_NON_SAFARI");
    console.log(messageIOS);
    let toast = this.toastCtrl.create({
      showCloseButton: true,
      closeButtonText: this.isIOS ? 'OK': 'Install',
      position: 'bottom',
      message: this.isIOS ? messageIOS : this.translate.getKey("TOAST_MSG_INSTALL_ANDROID")
    });

    toast.onDidDismiss((data, role) => {
      if(role === 'close' && this.isAndroid) {
        this.showInstallBanner();
      }
      if (role === 'close' && this.isIOS && ('share' in navigator) && navigator['share']) {
        let shareData = {
          title: 'sts',
          text: 'sts',
          url: window.location.href,
        }
        navigator['share'](shareData);
      }
    });

    toast.present();
    this.isInstallToastShown = true;
    if (this.isIOS) {
      this.localData.setInstallToastShown();
    }
  }

  showInstallBanner() {
    // Show the prompt(android)
    if (this.deferredPrompt !== undefined && this.deferredPrompt !== null) {
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.localData.setInstallToastShown();
        }
        // We no longer need the prompt.  Clear it up.
        this.deferredPrompt = null;
      });
    }
  }

  handleDirectAccess (activePageName: string) {
    if (activePageName !== 'DirectAccessPage') {
      this.rootPage = HomePage;
    } else {
      this.events.publish('sts::configLoaded');
    }
  }

  /**
   * Au clique d'un lien du menu, une nouvelle page
   * va être ouverte.
   *
   * @param {string} nextPage - Nom d'une page.
   */
  onItemClick (event: any, nextPage: string = '', componentName) {
    event.preventDefault();

    if (nextPage !== '' && this.nav.getActive().name !== componentName) {
      this.nav.push(nextPage);
      this.menuCtrl.close();
    } else {
      this.menuCtrl.close();
    }
  }

  /**
   * Cette méthode ouvre la caméra de l'appareil
   * et donne la possibilité de prendre une photo qui sera
   * enregistré dans la galerie photo de l'appareil.
   * Une option retour donne la possibilité de revenir vers
   * l'application.
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
    this.camera.getPicture(options).then(() => {

    }).catch(() => {

    });
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

  /**
   *
   */
  sendCurrentPosition () {
    this.geoloc.getCurrentCoords('ALERT_MSG_MY_LOCATION').then(({latitude, longitude}) => {
      const to = '';
      const subject = this.translate.getKey('MAIL_SEND_POSITION_SUBJECT');
      const body = this.translate.getKeyAndReplaceWords('MAIL_SEND_POSITION_BODY', {
        'latitude': latitude,
        'longitude': longitude
      });
      this.data.sendEmail(to, subject, body);
    }).catch(() => {
      // Nothing to do.
    });
  }

  /**
   * Global listener pour lors du switch d'une page.
   */
  globalListener () {
    const events = Observable.merge(
      this.nav.viewWillLeave,
      this.nav.viewWillEnter
    );

    events.subscribe(() => {
      this.playerAudioProvider.isPlayingAndStopThem();
    });
  }
}
