import { Injectable } from '@angular/core';
import {AlertController} from "ionic-angular";

@Injectable()
export class AlertProvider {

  constructor (private alertCtrl: AlertController) {
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
  }
}
