import {Component, Input} from '@angular/core';
import {TranslateProvider} from "../../providers/translate";
import {Events, NavController, NavParams} from "ionic-angular";
import {LocalDataProvider} from "../../providers/localData";
import {ConfigProvider} from "../../providers/config";

@Component({
  selector: 'parcours-list-item',
  templateUrl: 'parcours-list-item.html',
})
export class ParcoursListItemComponent {
  _isOpenDiscover: boolean = false;

  @Input() handler: any = null;
  @Input() openId: string = '';
  @Input() previewTitle: string = '';
  @Input() previewDescription: string = '';
  @Input() color: string = '';
  @Input() target: string = '';
  @Input() parcourTime: string = '';
  @Input() createdAt: string = '';
  @Input() interestAddress: string = '';
  @Input() audioURI: string = '';
  @Input() geoloc: any = undefined;
  @Input() curPositionUser: any = undefined;
  @Input() audioScript: string = '';
  @Input() interestsList: Array<any> = [];
  @Input() sortOrder: any = null;

  timeToObj = '';
  isShowTimeToObj: boolean = false;

  @Input()
  set isOpenDiscover(nextState: boolean) {
    this._isOpenDiscover = nextState;
  }
  get isOpenDiscover() {
    return this._isOpenDiscover;
  }

  constructor (public localData: LocalDataProvider,
               public translate: TranslateProvider,
               public config: ConfigProvider,
               public navParams: NavParams,
               public events: Events,
               public navCtrl: NavController) {
    // -->.
  }

  ngOnChanges () {
    if (typeof this.geoloc !== 'undefined' && this.curPositionUser.longitude !== '' && this.curPositionUser.latitude !== '') {
      this.isShowTimeToObj = true;
      this.calculGeoLocDistance();
    } else {
      this.isShowTimeToObj = false;
    }

    if (this.handler !== null) {
      this.handlerOnClickItemMap(this.handler);
      this.handler = null;
    }
  }

  /**
   * @ref components/box-map
   * @param e
   */
  handlerOnClickItemMap = ({target, id}) => {
    if (id === this.openId) {
      this.updateDiscoverStateOrOpen();
    }
  };

  /**
   * Met à jour l'état du dropdown contenant les informations.
   */
  updateDiscoverStateOrOpen () {
    if (this.target === 'interests') {
      this.openNext();
    } else {
      this.isOpenDiscover = this.isOpenDiscover ? false : true;
    }
  }

  /**
   * Ouvre la page "PointOfInterest"
   */
  openNext () {
    this.navCtrl.push('PointOfInterest', {
      'target': this.target,
      'openId': this.openId,
      'pageName': this.previewTitle,
      'createdAt': this.createdAt,
      'interestsList': this.interestsList,
      'geoloc': this.geoloc,
      'curPositionUser': this.curPositionUser,
      'sortOrder': this.sortOrder
    });
  }

  isDone () {
    const data = {
      'uuid': this.openId,
      'created_at': this.createdAt
    };

    const isDone = this.target === 'parcours'
      ? this.localData.isParcoursIsDone(data, this.config.getLanguage())
      : this.localData.isPOIIsDone(data, this.config.getLanguage())
    ;

    const hideIt = this.target === 'parcours' && parseInt(String(this.interestsList.length)) === 0;

    return {
      'isDone': isDone,
      'hideIt': hideIt
    };
  }

  getDistance = (start, end) => {
    const rayon = 6378137;
    const toRadians = Math.PI / 180;
    let dist = 0;

    const a = (start.latitude * toRadians);
    const b = (start.longitude * toRadians);
    const c = (end.latitude * toRadians);
    const d = (end.longitude * toRadians);
    const e = Math.asin(Math.sqrt(Math.pow(Math.sin((a - c) / 2), 2) + Math.cos(a) * Math.cos(c) * Math.pow(Math.sin((b - d) / 2), 2)));
    dist = e * rayon * 2;

    return {
      'distance': this.convertMeterToDistance(dist),
      'time': this.convertMeterToTime(dist)
    };
  };

  convertMeterToDistance = (meter) => {
    if (meter < 1000) {
      return meter.toFixed(0) + 'm';
    } else {
      const toKM = meter / 1000;
      return toKM.toFixed(0) + 'km';
    }
  };

  /**
   * La durée est calculée par : 1mètre = 1minute
   * @param meter
   */
  convertMeterToTime = (meter) => {
    meter = meter.toFixed(0);
    const meterToMinute = meter / 100;

    if (meterToMinute < 60) {
      return meterToMinute.toFixed(0) + 'm';
    } else {
      const meterToKM = meterToMinute / 60;

      return meterToKM.toFixed(0) + 'h';
    }
  };

  /**
   * Construction de la chaîne de caractère de la distance et de la durée jusqu'au
   * premier point d'intérêt.
   * EX ouput : "à 546m (5m)"
   */
  calculGeoLocDistance () {
    const distancePrefix = this.translate.getKey('PLI_DISTANCE_PREFIX');
    const res = this.getDistance(this.getClosetLandmarkGeolocFromParcours(), this.curPositionUser);

    this.timeToObj = `${distancePrefix} ${res.distance}`;
  }

  /**
   * Retourne les coordonées GPS du point d'intérêt le plus proche
   * d'un parcours.
   * @param parcoursId
   * @returns {any}
   */
  getClosetLandmarkGeolocFromParcours () {
    if (this.interestsList.length === 0) {
      return null;
    } else {
      return this.interestsList[0].geoloc;
    }
  }
}
