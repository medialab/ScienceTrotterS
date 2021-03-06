import { ServiceWorkerModule, SwUpdate} from '@angular/service-worker';
import { NetworkService } from './services/network.service';
import { GeolocService } from 'src/app/services/geoloc.service';
import { OfflineStorageService } from './services/offline-storage.service';
import { ConfigService } from './services/config.service';
import { Component } from '@angular/core';

import { MenuController, Platform, ToastController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {TranslateService} from '@ngx-translate/core';

import { Plugins } from '@capacitor/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  deferredPrompt: any = null;
  isInstallPromptShown: boolean = false;
  isAppInstalled: boolean = false;

  toastEl: any = null;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private swUpdate: SwUpdate,
    public translate: TranslateService,
    private network: NetworkService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private offlineStorage: OfflineStorageService,
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

    // Service worker update listener
    this.swUpdate.available.subscribe(async (event) => {
      console.log('A newer version is now available. Refresh the page now to update the cache');
      this.translate.get(['ALERT_UPDATE_APP_TITLE', 'ALERT_UPDATE_APP_MSG'])
      .subscribe(async (resp) => {
        const alert = await this.alertCtrl.create({
          header: resp['ALERT_UPDATE_APP_TITLE'],
          message: resp['ALERT_UPDATE_APP_MSG'],
          buttons: [
            {
              text: 'ok',
              role: 'cancel',
              handler: () => {
                this.swUpdate.activateUpdate().then(() => document.location.reload());
              }
            }
          ]
        })
        await alert.present();
      })
    });

    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    try {
      await this.swUpdate.checkForUpdate();
    } catch(err) {
      console.log(err)
    }

    // PWA installation notification
    this.isAppInstalled = localStorage.getItem('config::isAppInstalled') === 'true';
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (!this.isInStandaloneMode() &&
        !this.isAppInstalled &&
        !this.platform.is('desktop') &&
        (!isChrome || (isChrome && this.platform.is('ios')))
      ) {
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
      if(!this.isInstallPromptShown && !this.platform.is('desktop')) {
        this.showInstallBanner();
      }
    });
  }

  isInStandaloneMode = () => {
    return ('standalone' in window.navigator) && window.navigator['standalone'] ||
    (window.matchMedia('(display-mode: standalone)').matches);
  }

  isDesktop = () => {
    return this.platform.is('desktop');
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
    if(this.deferredPrompt) {
      this.showInstallPrompt();
    } else {
      this.showInstallBanner();
    }
    this.menu.close();
  }

  async showInstallBanner() {
    const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    this.translate.get(['TOAST_MSG_INSTALL_SAFARI', 'TOAST_MSG_INSTALL_NON_SAFARI', 'TOAST_BTN_INSTALL_IOS', 'TOAST_BTN_INSTALL_ANDROID', 'TOAST_MSG_INSTALL_CHROME', 'TOAST_MSG_INSTALL_CHROME_MANUAL', 'TOAST_MSG_INSTALL_NON_CHROME'], {icon: '<ion-icon name="share-outline"></ion-icon>'})
    .subscribe(async (resp) => {
      const messageIOS = isSafari ? resp["TOAST_MSG_INSTALL_SAFARI"] : resp["TOAST_MSG_INSTALL_NON_SAFARI"];
      const messageAndroid = isChrome? (this.deferredPrompt ? resp['TOAST_MSG_INSTALL_CHROME'] : resp['TOAST_MSG_INSTALL_CHROME_MANUAL']) :  resp['TOAST_MSG_INSTALL_NON_CHROME'];
      const message = this.platform.is('ios') ? messageIOS : messageAndroid;
      const toast = await this.toastCtrl.create({
        message: `<span>${message}</span>`,
        cssClass: 'app-toast',
        buttons: [
          {
            text: '', // replace text with app icon, check global.scss
            role: 'cancel',
            handler: () => {
              this.showInstallPrompt();
            }
          }
        ]
      })
      toast.present();
      this.toastEl = document.querySelector(".app-toast");
      if(this.toastEl) {
        this.toastEl.addEventListener(('click'), () => {
          this.showInstallPrompt();
          toast.dismiss();
        });
      }
    })
  }

  async openMap() {
    if (this.platform.is('ios')) {
      window.open(`http://maps.apple.com/?ll=`)
    } else {
      try {
        const position:any = await Plugins.Geolocation.getCurrentPosition();
        if (position && position.coords) {
          if(this.platform.is('android')) {
            window.open(`geo:${position.coords.latitude},${position.coords.longitude}?q=${position.coords.latitude},${position.coords.longitude}`);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}
