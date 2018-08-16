import {AlertProvider} from "./alert";
import {TranslateProvider} from "./translate";
import {Geolocation} from '@ionic-native/geolocation';
import {Injectable} from "@angular/core";

@Injectable()
export class GeolocProvider {
  /**
   * Constructeur.
   *
   * @param geolocation
   * @param alert
   * @param translate
   */
  constructor(private geolocation: Geolocation,
              public alert: AlertProvider,
              public translate: TranslateProvider) {
  }

  /**
   * Récupère la position GPS actuellement de la personne
   * et retourne une Promise.
   *
   * @returns {Promise<T>}
   */
  getCurrentCoords () {
    return new Promise((resolve, reject) => {
      const otps = {
        'enableHighAccuracy': true
      };

      this.geolocation.getCurrentPosition(otps).then((resp: any) => {
        /**
         * coords {
         *  longitude
         *  longitude
         * }
         */
        resolve(resp.coords);
      }).catch((err: any) => {
        // -> Alert error.
        let bodyKey = '';

        switch (err.message) {
          // La géolocalisation est bloquée pour cette app.
          case 'Illegal Access':
            bodyKey = 'PV_GEOLOC_ASKGEO_ERROR_BODY_NOT_AUTHORIZED';
            break;
          // La géolocalisation est désactivée.
          default:
            bodyKey = 'PV_GEOLOC_ASKGEO_ERROR_BODY_GPS_DISABLED';
            break;
        }

        this.alert.create(
          this.translate.getKey('PV_GEOLOC_ASKGEO_ERROR_TITLE'),
          this.translate.getKey(bodyKey)
        );

        /**
         * err {
         *  code,
         *  message
         * }
         */
        reject(err)
      });
    });
  }
}
