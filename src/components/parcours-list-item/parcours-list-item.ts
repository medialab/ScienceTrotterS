import { OfflineStorageProvider } from './../../providers/offlineStorage';
import { Subscription } from 'rxjs/Subscription';
import { tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { PlayerAudioProvider } from './../../providers/playerAudio';
import {
  ApiProvider
} from './../../providers/api';
import {
  Component,
  Input
} from '@angular/core';
import {
  TranslateProvider
} from "../../providers/translate";
import {
  Events,
  NavController,
  NavParams, Platform
} from "ionic-angular";
import {
  LocalDataProvider
} from "../../providers/localData";
import {
  ConfigProvider
} from "../../providers/config";

import { ConnectionStatus, NetworkService } from './../../providers/network';
import { LoadingController, Loading } from 'ionic-angular';
import {DataProvider} from "../../providers/data";


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
  @Input() interestsList: Array < any > = [];
  @Input() sortOrder: any = null;
  @Input() cityName: string = '';
  @Input() cityId: string = '';
  @Input() schedule: string = '';
  @Input() focusId: string = 'focusId';
  @Input() isDownloaded: boolean = false;

  timeToObj = '';
  isShowTimeToObj: boolean = false;

  isItemDownloadable: boolean = true;
  isNetworkOff: boolean = false;

  subscription: Subscription;
  @Input()
  set isOpenDiscover(nextState: boolean) {
    this._isOpenDiscover = nextState;
  }
  get isOpenDiscover() {
    return this._isOpenDiscover;
  }


  constructor(public localData: LocalDataProvider,
              public translate: TranslateProvider,
              public config: ConfigProvider,
              public navParams: NavParams,
              public events: Events,
              public api: ApiProvider,
              public data: DataProvider,
              public navCtrl: NavController,
              public platform: Platform,
              public networkService: NetworkService,
              private offlineStorage: OfflineStorageProvider,
              public loader : LoadingController,
              public playerAudioProvider : PlayerAudioProvider ) {

  }

  ngOnInit() {
    this.subscription = this.networkService.getStatus().subscribe((status)=> {
      this.isNetworkOff = status === ConnectionStatus.Offline;
      this.isItemDownloadable = !this.config.data.enableOfflineMode || (this.isNetworkOff && !this.isDownloaded) ? false : true;
    })
  }

  ngOnDestory() {
    this.subscription.unsubscribe()
  }

  ionViewWillEnter(){
  }

  ngOnChanges() {
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
  handlerOnClickItemMap = ({ target, id }) => {
    if (id === this.openId && this.target === 'parcours') {
      this.updateDiscoverStateOrOpen();
    }
  };

  /**
   * Met à jour l'état du dropdown contenant les informations.
   */
  updateDiscoverStateOrOpen() {
    if(this.isNetworkOff && !this.isDownloaded) {
      this.networkService.alertIsNetworkOff();
      return;
    }
    if (this.target === 'parcours') {
      this.isOpenDiscover = this.isOpenDiscover ? false : true;
    } else {
      this.openNext()
    }
  }

  /**
   * Ouvre la page "PointOfInterest"
   */
  openNext() {
    if (this.isNetworkOff && !this.isDownloaded) {
      this.networkService.alertIsNetworkOff();
      return;
    }

    this.navCtrl.push('PointOfInterest', {
      'target': 'interests',
      'openId': this.target === 'parcours' ? this.interestsList[0].id: this.openId,
      'pageName': this.previewTitle,
      'createdAt': this.createdAt,
      'interestsList': this.interestsList,
      'geoloc': this.geoloc,
      'curPositionUser': this.curPositionUser,
      'sortOrder': this.sortOrder,
      'cityName': this.cityName,
      'cityId': this.cityId
    });
  }

  isDone() {
    const data = {
      'uuid': this.openId,
      'created_at': this.createdAt
    };

    const isDone = this.target === 'parcours' ?
      this.localData.isParcoursIsDone(data, this.config.getLanguage()) :
      this.localData.isPOIIsDone(data, this.config.getLanguage());

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
  calculGeoLocDistance() {
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
  getClosetLandmarkGeolocFromParcours() {
    if (this.interestsList.length === 0) {
      return null;
    } else {
      return this.interestsList[0].geoloc;
    }
  }

  download() {
    if(this.isNetworkOff) {
      this.networkService.alertIsNetworkOff();
      return;
    }
    if (this.parcourTime == "") {
      this.downloadPOI()
    } else {
      this.downloadParcours();
    }
  }

  downloadParcours() {
    // show loader
    let loading = this.loader.create({
      content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
    });

    loading.present();

    const interestsRequest = this.interestsList.map((poi) => this.savePOI(poi));
    forkJoin([
      this.api.getFile(this.audioURI).pipe(tap(res => this.offlineStorage.setRequest(this.audioURI, res))),
      ...interestsRequest]).subscribe(() => {
      loading.dismiss();
      this.offlineStorage.updateDownloaded(this.cityId, 'parcours', this.openId);
    })
  }

  savePOI(poi: object) {

    //Téléchargement de la cover
    const coverUrl = this.api.getAssetsUri(poi['header_image']);

    // Téléchargement de l'audio
    const audioUrl = this.api.getAssetsUri(poi['audio'][this.config.getLanguage()]);

    // Téléchargement des images de la galerie pour ce POI
    var gallery = poi['gallery_image'];

    const galleryRequest = Object.keys(gallery)
    .map((key, i) =>  {
      const url = this.api.getAssetsUri(gallery[key]);
      return this.api.getFile(url)
        .pipe(tap(res => this.offlineStorage.setRequest(url, res)))
    });

    return forkJoin([
      this.api.getFile(coverUrl).pipe(tap(res => this.offlineStorage.setRequest(coverUrl, res))),
      this.api.getFile(audioUrl).pipe(tap(res => this.offlineStorage.setRequest(audioUrl, res))),
      ...galleryRequest
    ]).pipe(tap(() => {
      this.offlineStorage.updateDownloaded(this.cityId, 'POIs', poi['id']);
    }))
  }

  downloadPOI() {
    const poi = this.interestsList[0];

    // show loader
    let loading = this.loader.create({
      content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
    });
    loading.present();

    this.savePOI(poi)
    .subscribe(() => {
      // hide loader
      loading.dismiss();
    });
  }

  canBeDownloadCls() {
    return this.isDownloaded ? 'isDownloaded': ''
  }

  getDownloadBtnTitle() {
    if (this.target === 'parcours') {
      return this.translate.getKey('COMP_PLI_BTN_DOWNLOAD_PARCOURS');
    } else {
      return this.translate.getKey('COMP_PLI_BTN_DOWNLOAD_LANDMARK');
    }
  }

}
