import { Plugins } from '@capacitor/core';
import { LanguageService } from './../../services/language.service';
import { NetworkService } from './../../services/network.service';
import { AudioPlayerComponent } from './../../components/audio-player/audio-player.component';
import { OfflineStorageService } from './../../services/offline-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { minifyString } from './../../utils/helper';
import { GeolocService } from 'src/app/services/geoloc.service';
import { LoadingController} from '@ionic/angular';
@Component({
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss'],
})
export class CityPage implements OnInit {
  city: any;

  // Variables contenant les données trié.
  parcours: Array<any> = new Array();
  places: Array<any> = new Array();

  curPositionUser: any = {
    'longitude': '',
    'latitude': ''
  };
  // TODO: click list-item callback
  selectedItemId: string = null;

  isListOpen = false;
  selectedTarget: string = "parcours";

  filterLang: string = "fr";

  isConnected: any = true;

  // Tri par défaut sélectionné qui est par proximité.
  optionsItemsSelected: number = 0;
  optionsItems = [
    {
      id: 0,
      action: 'alpha'
    },
    {
      id: 1,
      action: 'proximite'
    },
  ];

  @ViewChildren(AudioPlayerComponent) audioPlayers:[AudioPlayerComponent];

  constructor(
    public translate: TranslateService,
    public language: LanguageService,
    private geoloc: GeolocService,
    private network: NetworkService,
    private activatedRoute: ActivatedRoute,
    private loader: LoadingController,
    public offlineStorage: OfflineStorageService,
    public api: ApiService
  ) {
    this.language.filter.subscribe((lang) => {
      this.filterLang = lang;
      this.initCityData();
    })
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    if(this.audioPlayers) {
      this.audioPlayers.forEach((item) => item.forcePause())
    }
  }

  /**
   * get all data for city page
   */

  async initCityData() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    let closest = '';
    if(id) {
      const loading = await this.loader.create({
        duration: 5000,
        backdropDismiss: true
      });
      loading.present();
      try {
        this.city = await this.api.get(`/public/cities/byId/${id}?lang=${this.filterLang}`);
      } catch(err) {
        this.city = null;
        this.parcours =[];
        this.places = [];
        return;
      }
      // try {
      //   this.curPositionUser = await this.geoloc.getCurrentCoords();
      //   closest = `${this.curPositionUser.latitude};${this.curPositionUser.longitude}`;
      // } catch (err){
      //   loading.dismiss();
      //   console.log(err);
      // }
      const parcours = await this.fetchParcours(id, closest);
      const places = await this.fetchPlaces(id, closest);
      // if(places) {
      //   places.forEach((place) => this.api.get(`/public/interests/byId/${place.id}?lang=${this.filterLang}`));
      // }

      this.parcours = parcours ? parcours : [];
      this.places = places ? places: [];
      loading.dismiss();
    }
  }

  /**
   * fetch places of the city
   */
  fetchPlaces(cityId: string, closest: string = '') {
    const path = closest === ''
      ? `/public/interests/byCityId/${cityId}?lang=${this.filterLang}`
      : `/public/interests/closest/?city=${cityId}&geoloc=${closest}&lang=${this.filterLang}`;
    return this.api.get(path);
  }

   /**
   * fetch places of the city
   */
  fetchParcours(cityId: string, closest: string = '') {
    const path = closest === ''
      ? `/public/parcours/byCityId/${cityId}?lang=${this.filterLang}`
      : `/public/parcours/closest/${cityId}?geoloc=${closest}&lang=${this.filterLang}`;
    return this.api.get(path);
  }

  /**
   * Return les points d'intérêt relié à un id de parcours
   * @param parcourId - id du parcours
   * @returns {any[]}
   */
  getPlacesByParcoursId(parcoursId: string) {
    return this.places.filter(place => {
      return place.parcours_id === parcoursId
    });
  }

   /**
   * Return un point d'intérêt relié à son id.
   * @param placeId
   * @returns {any[]}
   */
  getPlacesById(placeId: string) {
    return this.places.filter(place => {
      return place.id === placeId
    });
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
   * @param next
   * @param isFromClick
   */
  onChangeSelectedTarget(next: any) {
    this.selectedTarget = next;
    // this.focusAnElement('#btnSortItemNext');
    // const target = next === 'place' ? 'point-of-interest' : 'parcours';
  }

  optionsItemClasse(itemId: number) {
    return {
      optionsItem: true,
      isSelected: this.optionsItemsSelected === itemId
    }
  };

  /**
   *
   */
  actionSortAlpha() {
    // Parcours.
    this.parcours = this.parcours.sort(this.sort_alpha);
    // Points d'intérêts.
    this.places = this.places.sort(this.sort_alpha);
  }

  /**
   *
   * @param a
   * @param b
   * @returns {number}
   */
  sort_alpha = (a, b) => {
    const aTitle = minifyString(a.title[this.filterLang]);
    const bTitle = minifyString(b.title[this.filterLang]);

    if (aTitle < bTitle) return -1;
    if (aTitle > bTitle) return 1;
    return 0;
  };

  onSelectItem (selectedItem: any) {
    this.selectedItemId = selectedItem.id;
    const focusElement = document.getElementById(selectedItem.id);
    focusElement.scrollIntoView({ behavior: 'smooth'});
    // only open parcours contentList on click item
    if (this.selectedTarget === 'parcours') {
      this.isListOpen = true;
    }
  }

  async actionSortProximite(msgAlertError: string = '') {
    if (!this.network.isConnected()) return;
    return new Promise(async (success, error) => {
      // Triage en fonction que la géolocalition est disponible ou non.

      // try {
      //   this.curPositionUser = await this.geoloc.getCurrentCoords();
      // } catch (err){
      //   loading.dismiss();
      //   this.changeOptionListAction('alpha');
      // }
      try {
        const position = await Plugins.Geolocation.getCurrentPosition();
        console.log(position);
        if (position && position.coords) {
          this.curPositionUser = position.coords;

          const loading = await this.loader.create({
            duration: 5000,
            backdropDismiss: true
          });
          loading.present();
          if (this.parcours.length > 1) {
            const parcours = await this.fetchParcours(this.city.id, `${this.curPositionUser.latitude};${this.curPositionUser.longitude}`);
            this.parcours = parcours.filter((item: any) => {
              return item.force_lang === null || item.force_lang === this.filterLang;
            });
          }

          if (this.places.length > 1) {
            const places = await this.fetchPlaces(this.city.id, `${this.curPositionUser.latitude};${this.curPositionUser.longitude}`);
            this.places = places.filter((item: any) => {
              return item.force_lang === null || item.force_lang === this.filterLang;
            });
          }
          loading.dismiss();
        }
      } catch (err) {
        console.log(err);
        this.changeOptionListAction('alpha');
        this.geoloc.alertMessage();
      }
    });
  }

  changeOptionListAction(nextAction: string) {
    const findAction = this.optionsItems.find(item => item.action === nextAction);
    if (typeof findAction !== 'undefined') {
      this.optionsItemsSelected = findAction.id;
      if (findAction.action === 'alpha') {
        this.actionSortAlpha();
      } else {
        this.actionSortProximite();
      }
    }
  }

  isOptionsActionSelected(actionName: string) {
    let isSelected = false;
    const findAction = this.optionsItems.find(item => item.action === actionName);
    if (typeof findAction !== 'undefined') {
      isSelected = this.optionsItemsSelected === findAction.id;
    }
    return isSelected;
  }

  /**
   *
   */
  toggleContentList() {
    this.isListOpen = !this.isListOpen;
  }
  openMap() {
    this.isListOpen = false;
  }
}
