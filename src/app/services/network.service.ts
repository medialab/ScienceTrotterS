import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';
import { AlertController } from '@ionic/angular';

const { Network } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
  ) {
  }

  getStatus() {
    return new Promise(async (resolve) => {
      const status = await Network.getStatus();
      resolve(status.connected)
    })
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
