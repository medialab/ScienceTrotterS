import { NetworkService } from './services/network.service';
import { GeolocService } from 'src/app/services/geoloc.service';
import { OfflineStorageService } from './services/offline-storage.service';
import { ConfigService } from './services/config.service';
import { Component } from '@angular/core';

import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';

import { MenuController, Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';
import { CacheService } from 'ionic-cache';
const { Network } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  networkListener: PluginListenerHandle;
  deferredPrompt: any = null;
  isInstallPromptShown: boolean = false;
  isAppInstalled: boolean = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public translate: TranslateService,
    private network: NetworkService,
    private toastCtrl: ToastController,
    private offlineStorage: OfflineStorageService,
    private cache: CacheService,
    private geoloc: GeolocService,
    public menu: MenuController,
    public config: ConfigService
  ) {
    // Config translateModule
    translate.addLangs(['en', 'fr'])
    if (localStorage.getItem('config::locale')) {
      const browserLang = localStorage.getItem('config::locale');
      translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    } else {
      localStorage.setItem('config::locale', 'fr');
      translate.setDefaultLang('fr');
      translate.use('fr');
    }

    // config cache
    cache.setDefaultTTL(60 * 60 * 24); //set default cache TTL for 1 day

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.isAppInstalled = localStorage.getItem('config::isAppInstalled') === 'true';
    if (this.platform.is('ios') && !this.isInStandaloneMode() && !this.isAppInstalled) {
      this.showInstallBanner();
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt Event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      this.isAppInstalled = false;
      // Update UI notify the user they can install the PWA
      if(!this.isInstallPromptShown) {
        this.showInstallBanner();
      }
    });
  }

  isInStandaloneMode = () => {
    return ('standalone' in window.navigator) && window.navigator['standalone'] ||
    (window.matchMedia('(display-mode: standalone)').matches);
  }

  // if android + chrome
  showInstallPrompt() {
    if(this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.isInstallPromptShown = true;
      this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.isAppInstalled = true;
          localStorage.setItem('config::isAppInstalled', 'true');
        }
        // We no longer need the prompt. Clear it up.
        this.deferredPrompt = null;
      });
    }
  }

  clickShowInstall() {
    if(this.platform.is('ios')) {
      this.showInstallBanner();
    } else {
      this.showInstallPrompt();
    }
    this.menu.close();
  }

  async showInstallBanner() {
    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    this.translate.get(['TOAST_MSG_INSTALL_SAFARI', 'TOAST_MSG_INSTALL_NON_SAFARI', 'TOAST_BTN_INSTALL_IOS', 'TOAST_BTN_INSTALL_ANDROID', 'TOAST_MSG_INSTALL_ANDROID'], {icon: '<ion-icon name="share-outline"></ion-icon>'})
    .subscribe(async (resp) => {
      const messageIOS = isSafari ? resp["TOAST_MSG_INSTALL_SAFARI"] : resp["TOAST_MSG_INSTALL_NON_SAFARI"];
      const message = this.platform.is('ios') ? messageIOS : resp['TOAST_MSG_INSTALL_ANDROID'];
      const toast = await this.toastCtrl.create({
        // message: this.platform.is('ios') ? messageIOS : resp["TOAST_MSG_INSTALL_ANDROID"],
        message: `<span>${message}</span>`,
        cssClass: 'install-toast',
        buttons: [
          {
            text: this.platform.is('ios') ? resp['TOAST_BTN_INSTALL_IOS'] : resp['TOAST_BTN_INSTALL_ANDROID'],
            role: 'cancel',
            handler: () => {
              if (this.platform.is('android')) this.showInstallPrompt();
            }
          }
        ]
      })
      toast.present();
    })
  }

  async openMap() {
    let position = null;
    try {
      position = await this.geoloc.getCurrentCoords();
    } catch (err){
      console.log(err)
    }
    if(position) {
      if(this.platform.is('android')) {
        window.open(`geo:${position.latitude},${position.longitude}?q=${position.latitude},${position.longitude}`);
      }
      if(this.platform.is('ios')) {
        window.open(`http://maps.apple.com/?q:${position.latitude},${position.longitude}`)
      }
    }
  }
}
