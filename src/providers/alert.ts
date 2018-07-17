import { Injectable } from '@angular/core';
import {AlertController, LoadingController} from "ionic-angular";

@Injectable()
export class AlertProvider {

  constructor (private alertCtrl: AlertController,
               public loadingCtrl: LoadingController) {
  }

  create (title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          role: 'ok',
          handler: () => {
            console.log('Buy clicked');
          }
        }
      ]
    });
    alert.present();

    return alert;
  }

  createLoader (content: string) {
    let loader = this.loadingCtrl.create({
      content: content
    });

    loader.present();

    return loader;
  }
}
