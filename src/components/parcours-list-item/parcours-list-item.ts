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
  @Input() parcourTotalInterets: number = 0;
  @Input() parcourTime: string = '';
  @Input() createdAt: string = '';
  @Input() interestAddress: string = '';
  @Input() audioURI: string = '';
  @Input() geoloc: any = undefined;
  @Input() curPositionUser: any = undefined;

  timeToObj = 'à 1k (10min)';
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
    console.group('@ngOnChanges');
    console.log('curPositionUser', this.curPositionUser);
    console.log('geoloc', this.geoloc);
    console.groupEnd();

    if (typeof this.geoloc !== 'undefined' && this.curPositionUser !== 'undefined') {
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
      'createdAt': this.createdAt
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

    return {
      'isDone': isDone
    };
  }

  distance (lat1, lon1, lat2, lon2, unit = 'K') {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist.toFixed(2);
  }

  calculGeoLocDistance () {
    this.timeToObj = this.distance(
      this.geoloc.latitude, this.geoloc.longitude,
      this.curPositionUser.longitude, this.curPositionUser.latitude);
  }
}
