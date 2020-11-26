import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeolocService {
  // geolocation options
  options = {
    timeout: 5000,
    enableHighAccuracy: true,
    maximumAge: 5000
  };

  constructor(
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private geolocation: Geolocation
  ) {
    //  let watch = this.geolocation.watchPosition();
    //  watch.subscribe((data) => {
    //   // data can be a set of coordinates, or an error (if an error occurred).
    //   // data.coords.latitude
    //   // data.coords.longitude
    //  });
  }

  getCurrentCoords() {
    return new Promise((async (resolve, reject) =>{
      this.geolocation.getCurrentPosition(this.options)
      .then((resp) => {
        resolve ({
          latitude: resp.coords.latitude,
          longitude: resp.coords.longitude
        })
      }).catch((err: PositionError) => {
        console.log("error : " + err.message);
        reject(err.message);
      });
    } ))
  }

  alertMessage() {
    this.translate.get(['GLOBAL_GPS_IS_NOT_AVAILABLE', 'GLOBAL_GPS_IS_REQUIRED' ])
    .subscribe(async (resp) => {
      const alert = await this.alertCtrl.create({
        header: resp['GLOBAL_GPS_IS_NOT_AVAILABLE'],
        message: resp['GLOBAL_GPS_IS_REQUIRED'],
        buttons: ['OK']
      });
      await alert.present()
    })
  }
}
