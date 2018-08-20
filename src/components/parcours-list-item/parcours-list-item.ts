import { PlayerAudioProvider } from './../../providers/playerAudio';
import {
  HttpClient
} from '@angular/common/http';
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
  NavParams
} from "ionic-angular";
import {
  LocalDataProvider
} from "../../providers/localData";
import {
  ConfigProvider
} from "../../providers/config";
import {
  FileTransfer,
  FileUploadOptions,
  FileTransferObject
} from '@ionic-native/file-transfer';
import {
  File
} from '@ionic-native/file';
import {
  normalizeURL
} from '../../../node_modules/ionic-angular/util/util';
import {
  Network
} from '@ionic-native/network';
import { LoadingController, Loading } from 'ionic-angular';


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

  timeToObj = '';
  isShowTimeToObj: boolean = false;
  fileTrans: FileTransferObject;


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
    public navCtrl: NavController,
    public fileTransfer: FileTransfer,
    private file: File,
    public network: Network,
    public loader : LoadingController,
    public playerAudioProvider : PlayerAudioProvider ) {
    this.fileTrans = this.fileTransfer.create();
  }

  ionViewWillEnter(){
    // this.playerAudioProvider.clearAll();
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
  handlerOnClickItemMap = ({
    target,
    id
  }) => {
    if (id === this.openId) {
      this.updateDiscoverStateOrOpen();
    }
  };

  /**
   * Met à jour l'état du dropdown contenant les informations.
   */
  updateDiscoverStateOrOpen() {
    if (this.target === 'interests') {
      this.openNext();
    } else {
      this.isOpenDiscover = this.isOpenDiscover ? false : true;
    }
  }

  /**
   * Ouvre la page "PointOfInterest"
   */
  openNext() {
    this.navCtrl.push('PointOfInterest', {
      'target': this.target,
      'openId': this.openId,
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
    let loading = this.loader.create({
      content : this.translate.getKey('PLI_ACTION_DOWNLOAD_DATA_LOADER')
    });

    loading.present();


    if (this.parcourTime == "") {
      this.downloadPOI()
    } else {
      this.downloadParcours();
    }

    loading.dismiss();


  }

  downloadParcours() {

    var id = this.openId;
    var audioURL = this.audioURI;
    var filename = id + ".mp3"

    // // Téléchargement de l'audio du parc
    this.downloadFile(audioURL, filename, id, "audio", "Parcours");

    for (let poi of this.interestsList) {
      this.downloadPOI(poi);
    }

  }


  downloadPOI(poi = this.interestsList[0]) {

    //Téléchargement de la cover
    var urlCover = this.api.getAssetsUri(poi['header_image']);
    var filename = poi['id'] + '--cover.jpeg';
    this.downloadFile(urlCover, filename, poi['id'], 'cover');

    // Téléchargement de l'audio
    var urlAudio = this.api.getAssetsUri(poi['audio'][this.config.getLanguage()]);
    var filename = poi['id'] + '--' + this.config.getLanguage() + '.mp3';
    this.downloadFile(urlAudio, filename, poi['id'], 'audio');

    // Téléchargement des images de la galerie pour ce POI
    var gallery = poi['gallery_image'];
    var i = 1;
    for (let key of Object.keys(gallery)) {
      var urlImage = this.api.getAssetsUri(gallery[key]);
      var filename = poi['id'] + '--' + i + '.jpeg';
      this.downloadFile(urlImage, filename, poi['id'], 'gallery' + i);
      i++;
    }
  }

  downloadFile(url, filename, id, label, localStorageName = "POI") {
    this.fileTrans.download(url, this.file.dataDirectory + filename).then((entry) => {
      // Téléchargement réussi : entry.toURL()
      var imageURL = normalizeURL(entry.toURL());
      // Je récupère le local storage
      var sPoi = localStorage.getItem(localStorageName);

      // Je le converti en objet
      var oPOI = {};
      if (sPoi != null) {
        oPOI = JSON.parse(sPoi);
      }
      // Je mets à jour le fichier concerné

      if (!oPOI[id]) {
        oPOI[id] = {};
      }

      oPOI[id][label] = imageURL;

      // J'enregistre la date de téléchargement du POI
      oPOI[id]['date'] = Date.now();

      // Je converti en string
      sPoi = JSON.stringify(oPOI);
      // Je stocke dans local storage
      localStorage.setItem(localStorageName, sPoi);

      if (this.parcourTime != "") {
        this.getAudio();
      }

    }, (error) => {
      console.log(error)
    });
  }

  // retourne si le parcours/poi peut etre téléchargé et verifie qu'il soit a jour (le met à jour dans le cas contraire)
  canBeDownload() {
    // On regarde si l'id du poi est dans le tableau du localstorage
    var localStorageName = (this.parcourTime == "") ? "POI" : "Parcours";
    var sPoi = localStorage.getItem(localStorageName);

    if (sPoi != null) {
      var oPOI = JSON.parse(sPoi);

      if (oPOI[this.openId]) {
        var updateDate = this.createdAt.replace(/-/g, "/");
        var formatedDate = Date.parse(updateDate);

        if (formatedDate > oPOI[this.openId]['date']) {
          console.log("mise à jour des données locales");

          if (localStorageName == "POI") {
            this.downloadPOI();
          } else {
            this.downloadParcours();
          }

        }

        return false;
      }
    }

    return this.network.type != "none";

  }


  getAudio() {
    // if (this.parcourTime) {

      var sPoi = localStorage.getItem("Parcours");

      if (sPoi != null) {
        var oPOI = JSON.parse(sPoi);

        if (oPOI[this.openId]) {
          return oPOI[this.openId]['audio'];
        }
      }
      return this.audioURI;
    // }
  }

  getDownloadBtnTitle() {
    if (this.target === 'parcorus') {
      return this.translate.getKey('COMP_PLI_BTN_DOWNLOAD_PARCOURS');
    } else {
      return this.translate.getKey('COMP_PLI_BTN_DOWNLOAD_LANDMARK');
    }
  }

}
