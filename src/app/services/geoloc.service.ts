import { Platform } from '@ionic/angular';
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
    private geolocation: Geolocation,
    private platform: Platform
  ) {
    //  let watch = this.geolocation.watchPosition();
    //  watch.subscribe((data) => {
    //   // data can be a set of coordinates, or an error (if an error occurred).
    //   // data.coords.latitude
    //   // data.coords.longitude
    //  });
  }

  getCurrentCoords() {
    return new Promise(((resolve, reject) =>{
      this.geolocation.getCurrentPosition(this.options).then((resp) => {
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
}
