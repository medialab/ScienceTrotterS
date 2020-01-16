import {AlertProvider} from "./alert";
import {TranslateProvider} from "./translate";
import {Geolocation} from '@ionic-native/geolocation';
import {Injectable} from "@angular/core";
import {Diagnostic} from "@ionic-native/diagnostic";
import {Platform, ToastController} from "ionic-angular";

@Injectable()
export class GeolocProvider {

  opts: object = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 5000
  };

  /**
   * Constructeur.
   *
   * @param geolocation
   * @param alert
   * @param translate
   */
  constructor(private geolocation: Geolocation,
              public alert: AlertProvider,
              public platform: Platform,
              private toastCtrl: ToastController,
              public diagnostic: Diagnostic,
              public translate: TranslateProvider) {
  }

  debugLoad(msg: string = '') {
    /**
     let toast = this.toastCtrl.create({
     message: msg,
     duration: 3000,
     position: 'top'
     });
     toast.onDidDismiss(() => {
     console.log('Dismissed toast');
     });
     toast.present();
     */
  }

  /**
   * Détection de si la géolocalisation du téléphone est activée ou désactivée.
   * @returns TRUE ou FALSE
   */
  async isLocationEnabled() {
    const resp = await this.diagnostic.isLocationEnabled().then((isAvailable: boolean) => {
      return isAvailable;
    }).catch((onError: any) => {
      return false;
    });

    return resp;
  }

  /**
   * Détection de si la géolocalisatio est autorisée à être utilisé par l'application.
   * * @returns TRUE ou FALSE
   */
  async isLocationAuthorized() {
    const resp = await this.diagnostic.isLocationAuthorized().then((isAvailable: boolean) => {
      this.debugLoad('isLocationAuthorized success : ' + isAvailable);
      return isAvailable
    }).catch((onError: any) => {

      this.debugLoad('isLocationAuthorized error');
      return false;
    });

    return resp;
  }

  async getLocationAuthorizationStatus() {
    const authorizationStatus: string =  await this.diagnostic.getLocationAuthorizationStatus().then((status: string) => {
      return status;
    }).catch((onError) => {
      return 'denied';
    });

    return authorizationStatus;
  }

  /**
   * Récupère la position GPS actuellement de la personne
   * et retourne une Promise.
   *
   * @returns {Promise<T>}
   */
  checkGPSStatus() {
    return new Promise(async (resolve, reject) => {
      const isLocationEnabled: boolean = await this.isLocationEnabled();
      let isAccepted = null;
      let isLocationAuthorized: boolean = await this.isLocationAuthorized();

      // Si le GPS de l'appareil est OFF.
      if (!isLocationEnabled) {
        this.debugLoad('!isLocationEnabled');
        reject('isLocationEnabled');
      } else if (!isLocationAuthorized) {
        // Si le GPS n'est pas authorized.

        if (this.platform.is('ios')) {
          this.debugLoad('is ios');
          // CHECK: quand l'utilisateur refuse il doit aller dans ses paramètres pour
          // Activer la géolocalisation.
          const authorizationStatus = await this.getLocationAuthorizationStatus();
          if (authorizationStatus !== 'not_determined') {
            reject('isLocationAuthorized');
          } else {
            isAccepted = await this.diagnostic.requestLocationAuthorization();
            isLocationAuthorized = await this.isLocationAuthorized();
            if (!isLocationAuthorized) {
              this.debugLoad('!isLocationAuthorized ios');
              reject('isLocationAuthorized');
            } else {
              resolve(true);
            }
          }
        } else {
          this.debugLoad('is android');
          // Here for android.
          isAccepted = await this.diagnostic.requestLocationAuthorization();
          isLocationAuthorized = await this.isLocationAuthorized();
          if (!isLocationAuthorized) {
            this.debugLoad('!isLocationAuthorized android');
            reject('isLocationAuthorized');
          } else {
            resolve(true);
          }
        }
      } else {
        resolve(true);
      }
    });
  }

  getCurrentCoords(errorMessageCode: string = '') {
    return new Promise((resolve, reject) => {
      let _loader = this.alert.createLoader();

      //this.checkGPSStatus().then((onSuccess: boolean) => {
        /**
         * Retrieve the user localisation.
         */
        // --> START.
        this.platform.ready().then(() => {
          this.geolocation.getCurrentPosition(this.opts).then((resp: any) => {
            /**
             * RESOLVE THE RESULT.
             */
            _loader.dismiss();
            resolve(resp.coords);
          }).catch(() => {
            this.throwError('', errorMessageCode);
            _loader.dismiss();
            reject(false);
          })
        }).catch(() => {
          this.throwError('', errorMessageCode);
          _loader.dismiss();
          reject(false);
        });
        // <-- END.
      // }).catch((errorCode: string) => {
      //   this.throwError(errorCode, errorMessageCode);
      //   _loader.dismiss();
      //   reject(false);
      // });
    });
  }

  throwError(errorCode: string = '', errorMessageCode: string = '') {
    let bodyKey = '';

    switch (true) {
      // La géolocalisation est bloquée pour cette app.
      case errorMessageCode === '' && errorCode === 'isLocationEnabled':
        bodyKey = 'PV_GEOLOC_ASKGEO_ERROR_BODY_NOT_AUTHORIZED';
        break;
      case errorMessageCode === '' && errorCode === 'isLocationAuthorized':
        bodyKey = 'PV_GEOLOC_ASKGEO_ERROR_BODY_GPS_DISABLED';
        break;
      // La géolocalisation est désactivée.
      default:
        bodyKey = undefined;
        break;
    }

    /**
     * Prompt alert to user.
     */
    if (bodyKey)
      this.alert.create(
        this.translate.getKey('PV_GEOLOC_ASKGEO_ERROR_TITLE'),
        this.translate.getKey(bodyKey)
      );
    else
        console.log(errorMessageCode);
  }
}
