import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {App, Content, Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import leaflet from 'leaflet';
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";

@IonicPage()
@Component({
  selector: 'page-preview-by-city',
  templateUrl: 'preview-by-city.html',
})

export class PreviewByCityPage {
  @ViewChild(Content) content: Content;

  eventOnClickItemMap: any = null;

  city: any;

  // Variables contenant les données non trié.
  _parcours: Array<any> = new Array();
  _interests: Array<any> = new Array();

  // Variables contenant les données trié.
  parcours: Array<any> = new Array();
  interests: Array<any> = new Array();

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
      name: this.translate.getKey('PLI_FILTER_ALPHA'),
      action: 'alpha'
    },
    {
      id: 1,
      name: this.translate.getKey('PLI_FILTER_PROXIMITE'),
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
              public config: ConfigProvider,
              public api: ApiProvider,
              public events: Events,
              public translate: TranslateProvider) {
    /** DEBUG MAP
    if (typeof navParams.get('city') !== 'undefined') {
      this.city = navParams.get('city');
      this.loadParcours();
      this.loadInterests();

     // events.subscribe('config:updateLanguage', this.onUpdateLanguage.bind(this));
    }
    */

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
  }

  init () {
    this.loadParcours();
    this.loadInterests();
  }

  onUpdateLanguage () {
    console.log('onUpdateLanguage');
  }

  focusAnElement (element: string) {
    const el = <HTMLElement>document.querySelector(element);
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
    const eventName = 'boxMap::onClickItemMap';
    this.eventOnClickItemMap = this.events.subscribe(eventName, this.openContentList.bind(this));
  }

  /**
   *
   */
  openContentList() {
    const duration = 500;

    if (this.contentListClass.isOpen) {
      if (this.content.scrollTo !== null) {
        this.contentListClass.isOpen = false;
        this.content.scrollTo(0, 0, duration);
      }
    } else {
      if (this.content.scrollToBottom !== null) {
        this.contentListClass.isOpen = true;
        this.content.scrollToBottom(duration);
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
  }

  /**
   *
   */
  loadParcours() {
    this.api.get('/public/parcours/byCityId/' + this.city.id).subscribe((resp: any) => {
      if (resp.success) {
        this._parcours = resp.data;
        this.parcours = this.getParcours();
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  /**
   *
   */
  loadInterests() {
    this.api.get('/public/interests/byCityId/' + this.city.id).subscribe((resp: any) => {
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
   * @param arr
   * @returns {any}
   */
  sortItems (arr: any) {
    const sort_alpha = (a, b) => {
      const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
      const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

      if (aTitle < bTitle) return -1;
      if (aTitle > bTitle) return 1;
      return 0;
    };

    const sort_proximite = (a, b) => {
      const aTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), a.title));
      const bTitle = this.minifyString(this.translate.fromApi(this.config.getLanguage(), b.title));

      if (aTitle > bTitle) return -1;
      if (aTitle < bTitle) return 1;
      return 0;
    };

    switch (this.otpionsItems[this.optionsItemsSelected].action) {
      case 'alpha':
        return arr.sort(sort_alpha);
      case 'proximite':
        return arr.sort(sort_proximite);
      default:
        return arr;
    }
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
