import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {App, Content, Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import leaflet from 'leaflet';
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";
import {GeolocProvider} from "../../providers/geoloc";
import {AlertProvider} from "../../providers/alert";

@IonicPage()
@Component({
  selector: 'page-preview-by-city',
  templateUrl: 'preview-by-city.html',
})

export class PreviewByCityPage {
  @ViewChild(Content) content: Content;

  eventOnClickItemMapName = 'boxMap::onClickItemMap';

  city: any;

  // Variables contenant les données non trié.
  _parcours: Array<any> = new Array();
  _interests: Array<any> = new Array();

  // Variables contenant les données trié.
  parcours: Array<any> = new Array();
  interests: Array<any> = new Array();

  parcoursListItemHandler: any = null;
  eventUpdateLanguage: any = null;

  /**
   * Filtre les parcours suivant les critères.
   * @returns {any[]}
   */
  getParcours () {
    return this._parcours.filter((item: any) => {
      return item.force_lang === null || item.force_lang === this.config.getLanguage();
    });
  }

  /**
   * Filtre les points d'intérêts suivant les critères.
   * @returns {any[]}
   */
  getInterests () {
    return this._interests.filter((item: any) => {
      return item.force_lang === null || item.force_lang === this.config.getLanguage();
    });
  }

  itemsList : Array<any> = new Array();

  contentListClass = {
    contentList: true,
    isOpen: false
  };

  optionsItemsSelected: number = 0;
  otpionsItems = [
    {
      id: 0,
      name: () => (this.translate.getKey('PLI_FILTER_ALPHA')),
      action: 'alpha'
    },
    {
      id: 1,
      name: () => (this.translate.getKey('PLI_FILTER_PROXIMITE')),
      action: 'proximite'
    },
  ];

  optionsItemClasse(itemId: number) {
    return {
      optionsItem: true,
      isSelected: this.optionsItemsSelected === itemId
    }
  }

  selectedTarget: boolean = false;

  selectTargetParcours = {
    selectedTarget: true,
    isSelected: true
  };

  selectTargetPoints = {
    selectedTarget: true,
    isSelected: false
  };

  constructor(public app: App,
              private renderer: Renderer2,
              public navCtrl: NavController,
              public navParams: NavParams,
              public geoloc: GeolocProvider,
              public config: ConfigProvider,
              public alert: AlertProvider,
              public api: ApiProvider,
              public events: Events,
              public translate: TranslateProvider) {
    if (typeof navParams.get('city') !== 'undefined') {
      this.city = navParams.get('city');
      this.init();
    }

    /** ONLY FOR DEV DEBUG.
    this.city = {
      id: "c661d0ba-f710-43d3-ac5b-79ea5e1fce8b",
      title: {
        fr: "Paris",
        en: "Paris"
      },
      image: "cities/image/paris.jpg_1530627611",
      geoloc: {
        latitude: 48.8566,
        longitude: 2.3522
      },
      force_lang: "fr",
      updated_at: "2018-07-06 10:16:36"
    };
    this.init();
    */
  }

  async init () {
    await this.loadParcours();
    await this.loadInterests();

    if (this.parcours.length === 0) {
      this.onChangeSelectedTarget({'next': true});
    }

    this.changeOptionListHandler();
  }

  onUpdateLanguage () {
    console.log('onUpdateLanguagee');
    this.interests = this.getInterests();
    this.parcours = this.getParcours();
  }

  focusAnElement (element: string) {
    const el: any = document.querySelector(element);
    if (el !== null) {
      //noinspection TypeScriptUnresolvedFunction
      el.focus();
    }
  }

  /**
   *
   * @returns {boolean}
   */
  ionViewCanEnter () {
    return this.city.id === null ? false : true;
  }

  /**
   *
   */
  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    const eventName = 'boxMap::onClickItemMap';

    if (this.eventUpdateLanguage === null) {
      this.eventUpdateLanguage = this.events.subscribe('config:updateLanguage', this.onUpdateLanguage.bind(this));
    }

    this.events.subscribe(this.eventOnClickItemMapName, (data: any) => {
      // Handler for event on a component.
      this.parcoursListItemHandler = data;

      setTimeout(() => {
        this.parcoursListItemHandler = null;
      }, 250);

      // Ouverture de la liste.
      this.openContentList();
    });
  }

  ionViewWillUnload () {
    console.log('ionViewWillUnload');
    this.eventUpdateLanguage = null;
    this.events.unsubscribe('config:updateLanguage', this.onUpdateLanguage.bind(this));
  }

  ionViewDidLeave () {
    console.log('ionViewDidLeave');
  }

  /**
   *
   */
  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    this.events.unsubscribe(this.eventOnClickItemMapName);
  }

  scrollToDiv (selector, to, duration) {
    const element: any = document.querySelector(selector);

    const easeInOutQuad =  (t, b, c, d) => {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };

    let start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    const animateScroll = () => {
      currentTime += increment;
      const val = easeInOutQuad(currentTime, start, change, duration);

      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };

    animateScroll();
  }

  /**
   *
   */
  openContentList() {
    const duration = 570;
    const selector = '#previewByCityContent .scroll-content';

    if (this.contentListClass.isOpen) {
      this.contentListClass.isOpen = false;
      this.scrollToDiv(selector, 0, duration);
    } else {
      this.contentListClass.isOpen = true;
      //noinspection TypeScriptUnresolvedFunction
      const contentHeight: any = document.querySelector('#previewByCityContent .scroll-content');

      if (contentHeight !== null) {
        this.scrollToDiv(selector, contentHeight.offsetHeight, duration);
      }
    }
  }

  /**
   *
   * @constructor
   */
  onClickItem () {
    if (! this.contentListClass.isOpen) {
      this.openContentList();
    }
  }

  /**
   *
   * @returns {string|string}
   */
  currentOpenIcon() {
    return this.contentListClass.isOpen ? 'ios-arrow-down': 'ios-arrow-up';
  }

  /**
   *
   * @param next
   * @param isFromClick
   */
  onChangeSelectedTarget(next: any, isFromClick = false) {
    this.selectTargetPoints.isSelected = next.checked === true;
    this.selectTargetParcours.isSelected = next.checked === false;
    if (isFromClick) {
      this.selectedTarget = next.checked;
    }

    this.focusAnElement('#btnSortItemNext');

    this.parcours = this.getParcours();
    this.interests = this.getInterests();
  }

  /**
   *
   * @param next
   */
  changeOptionList(next: string) {
    switch (next) {
      case 'prev':
        if (this.optionsItemsSelected > 0) {
          this.optionsItemsSelected -= 1;
        } else {
          this.optionsItemsSelected = this.otpionsItems.length - 1;
        }
        break;
      case 'next':
        if (this.optionsItemsSelected < (this.otpionsItems.length - 1)) {
          this.optionsItemsSelected += 1;
        } else {
          this.optionsItemsSelected = 0;
        }
        break;
    }

    // TODO : Attendre la fin du tri pour mettre le focus sur le premier element de la liste.
    setTimeout(() => {
      if (typeof document.querySelector('.list li:first-child') !== null) {
        this.focusAnElement('.list li:first-child parcours-list-item .parcoursListItem .contentPreview button.info');
      }
    }, 100);

    // -->/
    this.changeOptionListHandler();
  }

  /**
   *
   */
  changeOptionListHandler () {
    switch (this.otpionsItems[this.optionsItemsSelected].action) {
      case 'alpha':
        this.actionSortAlpha();
        break;
      case 'proximite':
        this.actionSortProximite();
        break;
    }
  }

  async actionSortProximite () {
    const loaderContent = '';
    const loader = this.alert.createLoader(loaderContent);

    // Triage en fonction que la géolocalition est disponible ou non.
    await this.geoloc.getCurrentCoords().then(async (resp: any) => {
      const {latitude, longitude} = resp;

      if (this.parcours.length > 1) {
        await this.loadParcours(`${latitude};${longitude}`);
      }

      if (this.interests.length > 1) {
        await this.loadInterests(`${latitude};${longitude}`);
      }

      loader.dismiss();
    }, (err: any) => {
      this.changeOptionList('next');
      loader.dismiss();
    });
  }

  actionSortAlpha() {
    // Parcours.
    this._parcours = this._parcours.sort(this.sort_alpha);
    this.parcours = this.getParcours();

    // Points d'intérêts.
    this._interests = this._interests.sort(this.sort_alpha);
    this.interests = this.getInterests();
  }

  sort_alpha = (a, b) => {
    const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
    const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

    if (aTitle < bTitle) return -1;
    if (aTitle > bTitle) return 1;
    return 0;
  };

  /**
   *
   */
  async loadParcours(closest: string = '') {
    const path = closest === ''
      ? `/public/parcours/byCityId/${this.city.id}`
      : `/public/parcours/closest/${this.city.id}?geoloc=${closest}`;

    this.api.get(path).subscribe((resp: any) => {
      if (resp.success) {
        this._parcours = closest === ''
          ? resp.data
          : resp.data.parcours;

        this.parcours = this.getParcours();
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  /**
   *
   */
  async loadInterests(closest: string = '') {
    const path = closest === ''
      ? `/public/interests/byCityId/${this.city.id}`
      : `public/interests/closest/?city=${this.city.id}&geoloc=${closest}`;

    this.api.get(path).subscribe((resp: any) => {
      if (resp.success) {

        this._interests = resp.data;
        this.interests = this.getInterests();
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  /**
   *
   * @param parcourId
   * @returns {number}
   */
  getTotalInterestsByParcourId(parcourId: string) {
    return this.getInterests().filter(interest => {
      return interest.parcours_id === parcourId
    }).length;
  }

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
}
