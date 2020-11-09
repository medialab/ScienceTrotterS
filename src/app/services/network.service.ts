import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';
import { AlertController, ToastController } from '@ionic/angular';

const { Network } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  connected: boolean = true;
  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private toastCtrl: ToastController
  ) {
    Network.addListener('networkStatusChange', (status) => {
      this.connected = status.connected;
      const connection = status.connected ? 'online' : 'offline'
      this.translate.get('TOAST_MSG_NETWORK', { connection }).subscribe(async (message) => {
        const toast = await this.toastCtrl.create({
          message,
          duration: 1000,
          position: 'bottom'
        });

        toast.present();
      })
    });
  }

  getStatus() {
    return new Promise(async (resolve) => {
      const status = await Network.getStatus();
      resolve(status.connected)
    })
  }

  isConnected() {
    return this.connected;
  }

  alertMessage() {
    this.translate.get(['GLOBAL_NETWORK_IS_NOT_AVAILABLE', 'GLOBAL_NEED_NETWORK_FOR_DATA' ])
    .subscribe(async (resp) => {
      const header = resp['GLOBAL_NETWORK_IS_NOT_AVAILABLE'];
      const message = resp['GLOBAL_NEED_NETWORK_FOR_DATA'];
      const alert = await this.alertCtrl.create({
        header,
        message,
        buttons: ['OK']
      });
      await alert.present()
    })
  }
}
