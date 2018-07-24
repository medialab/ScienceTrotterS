import { Injectable } from '@angular/core';
import {AlertController, LoadingController} from "ionic-angular";

@Injectable()
export class AlertProvider {

  constructor (private alertCtrl: AlertController,
               public loadingCtrl: LoadingController) {
  }

  /**
   * Création d'une alerte affiché à l'écran.
   * @param title - titre
   * @param message - message
   * @param okHandler - function au clique du bouton "OK"
   * @param onDidDismiss - function au clique extérieur de la zone de l'alerte. (Par défaut désactivé)
   * @returns {Alert}
   */
  create (title: string, message: string, okHandler: any = null, onDidDismiss: any = null) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'Ok',
          role: 'ok',
          handler: okHandler
        }
      ]
    });
    alert.present();

    if (onDidDismiss !== null) {
      alert.onDidDismiss(onDidDismiss);
    }

    return alert;
  }

  /**
   * Création d'un loader affiché à l'écran.
   * @param content
   * @returns {Loading}
   */
  createLoader (content: string) {
    let loader = this.loadingCtrl.create({
      content: content
    });

    loader.present();

    return loader;
  }
}
