import {
  Component,
  ViewChild
} from '@angular/core';
import {
  Content,
  Events,
  IonicPage,
  NavController,
  NavParams, ToastController
} from 'ionic-angular';
import {
  ApiProvider
} from "../../providers/api";
import {
  TranslateProvider
} from "../../providers/translate";
import {
  ConfigProvider
} from "../../providers/config";
import {
  Platform
} from 'ionic-angular';
import {
  LocalDataProvider
} from "../../providers/localData";
import {
  DataProvider
} from "../../providers/data";
import {
  AlertProvider
} from "../../providers/alert";
import {
  PlayerAudioProvider
} from "../../providers/playerAudio";
import { Slides } from 'ionic-angular';
import {DomSanitizer} from "@angular/platform-browser";
import {GeolocProvider} from "../../providers/geoloc";

@IonicPage()
@Component({
  selector: 'page-point-of-interest',
  templateUrl: 'point-of-interest.html',
})
export class PointOfInterestPage {
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) slides: Slides;

  isActivePage: boolean = false;
  isOnUpdateLanguage: boolean = false;
  helpItemActive = '';
  curTarget: string = '';
  curId: string = '';
  pageName: string = '';
  createdAt: string = '';
  geoloc: any = undefined;
  curPositionUser: any = undefined;
  sortOrder: any = null;
  showScriptAudioSection: boolean = false;
  cityName: string = '';
  cityId: string = '';

  cover = "";
  gallery;
  galleryShowSlider: boolean = true;
  audio = "";

  _interests: Array < any > = new Array();
  interests: Array < any > = new Array();

  getInterests() {
    return this._interests.filter((item: any) => {
      return item.isDone === false && (item.item.force_lang === null || item.item.force_lang === this.config.getLanguage())
    });
  }

  activeItem = 0;

  mainContentCls = {
    mainContent: true,
    isHidden: false,
  };

  constructor(private _DomSanitizationService: DomSanitizer,
              public navCtrl: NavController,
              public navParams: NavParams,
              public api: ApiProvider,
              public config: ConfigProvider,
              public translate: TranslateProvider,
              public alert: AlertProvider,
              public geolocProvider: GeolocProvider,
              private toastCtrl: ToastController,
              public events: Events,
              public data: DataProvider,
              public localData: LocalDataProvider,
              public playerAudioProvider: PlayerAudioProvider,
              public platform: Platform) {
    if (typeof navParams.get('interestsList') !== 'undefined') {
      if (navParams.get('sortOrder') !== null) {
        this.sortOrder = navParams.get('sortOrder');
      }

      this.cityName = navParams.get('cityName');
      this.cityId = this.navParams.get('cityId');
      this.curTarget = navParams.get('target');
      this.curId = navParams.get('openId');
      this.geoloc = navParams.get('geoloc');
      this.curPositionUser = navParams.get('curPositionUser');
      this.createdAt = navParams.get('createdAt');
      this.pageName = navParams.get('pageName') ? navParams.get('pageName') : "";
      this.initInterestsList(navParams.get('interestsList'));

      this.cover = this.getCoverPicture();
    }

    events.subscribe('config:updateLanguage', () => {
      this.isOnUpdateLanguage = true;
    });
  }

  async onUpdateLanguage() {
    this.isOnUpdateLanguage = false;

    console.log('before');

    await this.initializeInterestsWithApi().catch((() => {
      console.log('catch msg');
      this.noInterestsAlertOnLangChange();
    }));

    console.log('after');

    if (true) {
      // MAJ Du titre de la page s'il s'agit d'un point d'intérêt seul
      if (this.curTarget === 'interests' && this.interests.length > 0) {
        this.pageName = this.interests[0].item.title[this.config.getLanguage()];
      }

      // MAJ du titre de la page s'il s'agit d'un parcours.
      this.updateCityData();
    }
  }

  ionViewWillEnter(){
    // ?.
    if(!(this.showMoveBtn("next") || this.showMoveBtn("prev"))){ //permet de savoir si nous somme dans un parcours
        this.playerAudioProvider.clearAll();
    }
  }

  ionViewDidEnter() {
    this.isActivePage = true;

    if (this.isOnUpdateLanguage) {
      this.onUpdateLanguage();
    }

    this.gallery = this.getGallery();
    this.galleryShowSlider = this.showSliderPager();
    this.audio = this.getAudio();
  }

  ionViewWillLeave() {
    this.isActivePage = false;
  }

  updateCityData() {
    if (this.curTarget === 'parcours') {
      this.api.get('/public/cities/byId/' + this.cityId).subscribe(async (resp: any) => {
        if (resp.data.title[this.config.getLanguage()] !== 'undefined') {
          this.pageName = resp.data.title[this.config.getLanguage()];
        }
      }, (onError) => {
      });
    }
  }

  /**
   *
   * @param elementId
   */
  scrollTo(elementId: string) {
    const yOffset = document.getElementById(elementId).offsetTop - 56;
    if (this.content.scrollTo !== null) {
      this.content.scrollTo(0, yOffset, 1000);
    }
  }

  initInterestsList(interestsList: Array < any > ) {
    this._interests = interestsList.map((item: any) => {
      return {
        'isDone': false,
        'item': item
      };
    });

    this.interests = this.getInterests();
  }

  /**
   *
   * @param curTarget
   * @param curId
   */
   initializeInterestsWithApi() {
     return new Promise((resolve, reject) => {
      let showAlert = true;
      let geolocStr = '';

      if (this.curPositionUser.latitude === '' && this.curPositionUser.longitude === '') {
        geolocStr = `${this.geoloc.latitude};${this.geoloc.longitude}`;
      } else {
        geolocStr = `${this.curPositionUser.latitude};${this.curPositionUser.longitude}`;
      }

      let endpoint = this.curTarget === 'interests' ?
        `/public/interests/byId/${this.curId}?lang=${this.config.getLanguage()}` :
        `/public/interests/closest/?parcours=${this.curId}&geoloc=${geolocStr}&lang=${this.config.getLanguage()}`;

      this.api.get(endpoint).subscribe((resp: any) => {
        if (resp.success && typeof resp.data === 'object') {
          showAlert = false;

          // Gestion du tri alphabétique.
          if (this.sortOrder !== null && this.sortOrder.action === 'alpha') {
            resp.data = resp.data.sort(this.sort_alpha);
          }

          this.initInterestsList(resp.data);
        } else {
          this.initInterestsList([]);
          reject();
        }

        this.interests = this.getInterests();
      }, (error: any) => {
        this.initInterestsList([]);
        reject();
      }, () => {
        if (showAlert) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  /**
   *
   * @param dir
   * @returns {boolean}
   */
  showMoveBtn(dir: string) {
    let show = false;

    switch (dir) {
      case 'prev':
        show = this.activeItem === 0 ? false : true;
        break;
      case 'next':
        if (this.interests.length > (this.activeItem + 1)) {
          show = true;
        } else {
          show = false;
        }
        break;
    }


    return show;
  }

  /**
   *
   * @param target
   */
  setHelpItemActive(target: string) {
    this.helpItemActive = target;
  }

  /**
   *
   * @param action
   */
  updateMainContentState(action: boolean) {
    this.mainContentCls.isHidden = action ? false : true;
  }

  /**
   *
   * @param dir
   */
  onClickMoveList(dir: string) {
    this.playerAudioProvider.isPlayingAndStopThem();


    switch (dir) {
      case 'prev':
        if (this.activeItem > 0) {
          this.playerAudioProvider.clearOne('player__audio' + this.getData('id'));
          this.activeItem = this.activeItem - 1;
          this.onClickSetHelpItemActive(null);
          this.audio = this.getAudio(); // nécéssaire pour mettre à jour l'audio
        }
        break;
      case 'next':
        if (this.interests.length > (this.activeItem + 1)) {
          this.playerAudioProvider.clearOne('player__audio' + this.getData('id'));
          this.activeItem = this.activeItem + 1;
          this.onClickSetHelpItemActive(null);
          this.audio = this.getAudio(); // nécéssaire pour mettre à jour l'audio
        } else {
          this.playerAudioProvider.clearOne('player__audio' + this.getData('id'));
          this.activeItem = 0;
        }
        break;
    }

    this.gallery = this.getGallery();

    this.slides.slideTo(0, 0, true);
  }

  /**
   *
   * @param target
   */
  onClickSetHelpItemActive(target: string) {
    if (target === null && this.helpItemActive !== '') {
      document.querySelector(`#${this.helpItemActive}`).setAttribute('aria-expanded', 'false');
      this.focusAnElement(`#${this.helpItemActive}`);
      this.setHelpItemActive('');
      this.updateMainContentState(true);
    } else if (target !== null) {
      if (this.helpItemActive === target) {
        document.querySelector(`#${target}`).setAttribute('aria-expanded', 'false');
        this.setHelpItemActive('');
        this.updateMainContentState(true);
      } else {
        if (this.helpItemActive !== '') {
          document.querySelector(`#${this.helpItemActive}`).setAttribute('aria-expanded', 'false');
        }
        document.querySelector(`#${target}`).setAttribute('aria-expanded', 'true');
        this.setHelpItemActive(target);
        this.updateMainContentState(false);
      }
    }
  }

  /**
   * Retourne le nombre de photo à afficher. (Il faut en afficher d'avantage sur ipad).
   * @returns {number}
   */
  getNbPicture() {
    if (this.platform.is('tablet')) {
      return 3;
    } else {
      return 1.5;
    }
  }

  showBiblio() {
    const biblio = this.getData('bibliography', true);
    let isShow = false;

    for (const itemDesc of biblio) {
      if (itemDesc !== '') {
        isShow = true;
        break;
      }
    }

    return isShow;
  }
  /**
   *
   * @param target
   * @param isMainContent
   * @returns {any}
   */
  getHelpItemActive(target: string, isMainContent: boolean = false) {
    if (isMainContent && this.helpItemActive !== '') {
      return 'isActive';
    } else {
      return this.helpItemActive !== target ? 'isHidden' : 'isActive';
    }
  }

  /**
   *
   * @param key
   * @param translate
   * @returns {any}
   */
  getData(key: string, translate: boolean = false) {

    if (typeof this.interests[this.activeItem] === 'undefined') {
      return '';
    } else {
      if (!translate) {
        return this.interests[this.activeItem].item[key];
      } else {
        return this.translate.fromApi(this.config.getLanguage(), this.interests[this.activeItem].item[key]);
      }
    }
  }

  /**
   *
   * @param str
   * @param length
   * @returns {string}
   */
  sliceStr(str: string, length: number) {
    if (str.length > length) {
      return str.slice(0, (length - 3)) + '...';
    } else {
      return str.slice(0, length);
    }
  }

  /**
   * TODO : dynamic data
   * Envoi d'un message pour signaler un problème
   * par mail.
   */
  btnReportProblem() {
    const to = this.config.data.contact_mail;
    const subject = this.translate.getKeyAndReplaceWords('MAIL_REPORT_PROBLEM_SUBJECT', {
      'landmarkName': this.getData('title', true),
      'cityName': this.cityName
    });
    const body = this.translate.getKeyAndReplaceWords('MAIL_REPORT_PROBLEM_BODY', {
      'landmarkName': this.getData('title', true),
      'cityName': this.cityName
    });

    this.data.sendEmail(to, subject, body);
  }

  /**
   * TODO : dynamic data
   * Partage du point d'inrétêt courant par mail.
   */
  btnShareRef() {
    const subject = this.translate.getKeyAndReplaceWords('MAIL_SHARE_BIBLIO_SUBJECT', {
      'landmarkName': this.getData('title', true),
      'cityName': this.cityName
    });

    const preBody = this.translate.getKey('MAIL_SHARE_BIBLIO_BODY');
    let body = preBody;

    for (let itemDesc of this.getData('bibliography', true)) {
      body += itemDesc + '[jumpLine]';
    }

    this.data.sendEmail('', subject, this.data.bbCodeToMail(body));
  }

  btnTogglePointOfInterest() {
    const data = {
      'uuid': this.getData('id'),
      'created_at': this.getData('updated_at'),
      'name': this.getData('title', true),
      'done': true
      };
    if (this.isPOIIsDone().isDoneBTN === false) {
      data.done = true;

      // Par défaut on enregistre le POI comme étant terminé.
      this.localData.updatePOIDone(data, this.config.getLanguage());

      if (this.interests.length === 1) {
        // --> Ajout de l'item courant dans la liste des parocurs ou point d'intérêt done.

        if (this.curTarget === 'parcours') {
          data.uuid = this.curId;
          data.created_at = this.createdAt;
          this.localData.addParcoursDone(data, this.config.getLanguage());
        }

        // --> On retourne à la page précèdente (liste poi ou parcours).
        //this.goBackOrGoCitiesList();

      } else {
        // Enregistrement du point d'intérêt éffectué dans la liste courante.
        this._interests[this.activeItem].isDone = true;
        this._interests = this.getInterests();
        this.interests = this.getInterests();

        if (this.activeItem > 0) {
          this.activeItem -= 1;
        }

        this.scrollTo('poiMainContent');
        this.onClickSetHelpItemActive(null);
      }

      this.playerAudioProvider.isPlayingAndStopThem();
    }
    else {
      data.done = false;
      // Par défaut on enregistre le POI comme étant terminé.
      this.localData.updatePOIDone(data, this.config.getLanguage());
      // Enregistrement du point d'intérêt éffectué dans la liste courante.
      this._interests[this.activeItem].isDone = false;
      this._interests = this.getInterests();
      this.interests = this.getInterests();


      this.scrollTo('poiMainContent');

    }
  }

  focusAnElement(element: string) {
    const el = < HTMLElement > document.querySelector(element);
    if (el !== null) {
      //noinspection TypeScriptUnresolvedFunction
      el.focus();
    }
  }

  openMapToLocation() {
    this.geolocProvider.getCurrentCoords('ALERT_MSG_MAP_GO').then(({latitude, longitude}) => {
      const _geoloc: any = this.getData('geoloc');
      if (this.platform.is('ios')) {
        const openMapIOS = window.open(`http://maps.apple.com/?daddr=${_geoloc.latitude},${_geoloc.longitude}`, '_system', 'location=no');
      } else if (this.platform.is('android')) {
        const openMapANDROID = window.open(`geo:${_geoloc.latitude},${_geoloc.longitude}?q=${_geoloc.latitude},${_geoloc.longitude}`, '_system', 'location=no');
      }
    }, (onError) => {
      // Nothing to do.
    });
  }

  showSliderPager() {
    return this.gallery.length > 1;

  }

  isPOIIsDone() {
    const data = {
      'uuid': this.getData('id'),
      'created_at': this.getData('updated_at')
    };

    const isDone = this.localData.isPOIIsDone(data, this.config.getLanguage());

    return {
      'isDoneBTN': isDone
    };
  }

  /**
   * Affichage une alerte et au clique du bouton "OK"
   * un retour arrière est effectué.
   */
  noInterestsAlertOnLangChange() {
    const title = this.translate.getKey('PLI_ALERT_NO_INTERESTS_TITLE');
    const message = this.translate.getKey('PLI_ALERT_NO_INTERESTS_MESSAGE');
    let okHandlerDone = false;

    /**
     * Reteur à la page précèdente.
     */
    const okHandler = () => {
      if (!okHandlerDone) {
        okHandlerDone = true;
        this.goBackOrGoCitiesList();
      }
    };

    this.alert.create(
      title,
      message,
      okHandler,
      okHandler
    );
  }

  /**
   *
   * @param a
   * @param b
   * @returns {number}
   */
  sort_alpha = (a, b) => {
    const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
    const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

    if (aTitle < bTitle) return -1;
    if (aTitle > bTitle) return 1;
    return 0;
  };

  /**
   *
   * @param str
   * @returns {string}
   */
  minifyString(str: string) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  scrollToScriptAudio(hideIt: boolean = true) {
    if (hideIt) {
      const selectorId = 'titleAudioScript';

      if (!this.showScriptAudioSection) {
        this.showScriptAudioSection = true;
      }
      setTimeout(() => {
        this.scrollTo(selectorId);
      }, 150);
    } else {
      this.showScriptAudioSection = false;
    }
  }

  showAudioScriptListener(nextState: boolean) {
    this.scrollToScriptAudio(nextState);
  }

  goBackOrGoCitiesList() {
    if (this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    } else {
      this.navCtrl.setRoot('Cities');
    }
  }

  getCoverPicture() {
    var sPoi = localStorage.getItem("POI");
    if (sPoi != null) {
      var oPOI = JSON.parse(sPoi);

      if (oPOI[this.curId]) {
        return oPOI[this.curId]['cover'];

      }

      if (oPOI[this.interests[this.activeItem].item.id]){
        return oPOI[this.interests[this.activeItem].item.id]['cover'];
      }
    }
    return this.api.getAssetsUri(this.getData('header_image'));

  }

  getGallery() {
    var sPoi = localStorage.getItem("POI");

    if (sPoi != null) {
      var oPOI = JSON.parse(sPoi);

      if (oPOI[this.curId]) {
        var gallery = [];
        var i = 1;

        while (i <= 5 && oPOI[this.curId]['gallery' + i]) {
          gallery.push(oPOI[this.curId]['gallery' + i]);
          i++;
        }
        return gallery;


      }


      if (oPOI[this.interests[this.activeItem].item.id]){

        var gallery = [];
        var i = 1;

        while (i <= 5 && oPOI[this.interests[this.activeItem].item.id]['gallery' + i]) {
          gallery.push(oPOI[this.interests[this.activeItem].item.id]['gallery' + i]);
          i++;
        }

        return gallery;

      }
    }

    if (typeof this.getData('gallery_image') === 'undefined') {
      return [];
    } else {
      return Object
          .keys(this.getData('gallery_image'))
          .map((itemId: any) => this.api.getAssetsUri(this.getData('gallery_image')[itemId]));
    }


  }

  getAudio() {
    const audioURI = this.localData.getLandmarkAudio(this.getData('id'));

    if (audioURI === '') {
      return this.api.getAssetsUri(this.getData('audio', true));
    } else {
      return audioURI;
    }
  }

  showGallery() {
    const resp = this.localData.isLandmarkDownloaded(this.getData('id'));

    return resp.isDownloaded === true || resp.isNetworkOff === false;
  }

  getThisCoverImg() {
    return this._DomSanitizationService.bypassSecurityTrustStyle(`url(${this.getCoverPicture()})`);
  }

}