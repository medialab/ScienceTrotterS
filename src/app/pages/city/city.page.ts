import { OfflineStorageService } from './../../services/offline-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../../services/api.service';
import { forkJoin } from 'rxjs';
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

  // Tri par défaut sélectionné qui est par proximité.
  optionsItemsSelected: number = 1;
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
  constructor(
    public translate: TranslateService,
    private geoloc: GeolocService,
    private activatedRoute: ActivatedRoute,
    private loader: LoadingController,
    public offlineStorage: OfflineStorageService,
    public api: ApiService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.initCityData();
    })
  }
  ngOnInit() {
    this.initCityData();
  }

  /**
   * get all data for city page
   */

  async initCityData() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    let closest = '';
    if(id) {
      const loading = await this.loader.create();
      loading.present();
      const cityRequest = this.api.get(`/public/cities/byId/${id}?lang= ${this.translate.currentLang}`);
      try {
        this.curPositionUser = await this.geoloc.getCurrentCoords();
        closest = `${this.curPositionUser.latitude};${this.curPositionUser.longitude}`;
      } catch (err){
        console.log(err)
      }
      const parcoursRequest = this.fetchParcours(id, closest);
      const placesRequest = this.fetchPlaces(id, closest);
      forkJoin([cityRequest, parcoursRequest, placesRequest])
      .subscribe((resp: any) => {
        const [city, parcours, places] = resp;
        this.city = city.data;
        if (parcours.data) {
          this.parcours = parcours.data.filter((item: any) => {
            return item.force_lang === null || item.force_lang === this.translate.currentLang;
          });
        }
        if (places.data) {
          this.places = places.data.filter((item: any) => {
            return item.force_lang === null || item.force_lang === this.translate.currentLang;
          });
        }
        loading.dismiss();
      })
    }
  }

  /**
   * fetch places of the city
   */
  fetchPlaces(cityId: string, closest: string = '') {
    const path = closest === ''
      ? `/public/interests/byCityId/${cityId}?lang=${this.translate.currentLang}`
      : `/public/interests/closest/?city=${cityId}&geoloc=${closest}&lang=${this.translate.currentLang}`;
    return this.api.get(path);
  }

   /**
   * fetch places of the city
   */
  fetchParcours(cityId: string, closest: string = '') {
    const path = closest === ''
      ? `/public/parcours/byCityId/${cityId}?lang=${this.translate.currentLang}`
      : `/public/parcours/closest/${cityId}?geoloc=${closest}&lang=${this.translate.currentLang}`;
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
    const aTitle = minifyString(a.title[this.translate.currentLang]);
    const bTitle = minifyString(b.title[this.translate.currentLang]);

    if (aTitle < bTitle) return -1;
    if (aTitle > bTitle) return 1;
    return 0;
  };

  onSelectItem (selectedItem: any) {
    this.selectedItemId = selectedItem.id;
    const focusElement = document.getElementById(selectedItem.id);
    focusElement.scrollIntoView({ behavior: 'smooth'});
    // only open parcours contentList on click item
    if (this.selectedTarget==='parcours') {
      this.openContentList();
    }
  }

  actionSortProximite(msgAlertError: string = '') {
    return new Promise(async (success, error) => {
      const loading = await this.loader.create();
      loading.present();
      // Triage en fonction que la géolocalition est disponible ou non.
      this.geoloc.getCurrentCoords().then((resp: any) => {
        const {latitude, longitude} = resp;
        this.curPositionUser = resp;
        if (this.parcours.length > 1) {
          this.fetchParcours(this.city.id, `${latitude};${longitude}`)
          .subscribe((parcours: any) => {
            this.parcours = parcours.data.filter((item: any) => {
              return item.force_lang === null || item.force_lang === this.translate.currentLang;
            });
            loading.dismiss();
          })
        }

        if (this.places.length > 1) {
          this.fetchPlaces(this.city.id, `${latitude};${longitude}`)
          .subscribe((places: any) => {
            this.places = places.data.filter((item: any) => {
              return item.force_lang === null || item.force_lang === this.translate.currentLang;
            });
            loading.dismiss();
          })
        }

        success(resp);
      }, (err: any) => {
        this.changeOptionListAction('alpha');
        loading.dismiss();
        error();
      });
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
  openContentList() {
    this.isListOpen = !this.isListOpen;
  }
}
