import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import leaflet from 'leaflet';
import {HttpClient} from "@angular/common/http";
import leafletMarkercluster from 'leaflet.markercluster';
import {DataProvider} from "../../providers/data";
import {ApiProvider} from "../../providers/api";
import { Geolocation } from '@ionic-native/geolocation';
import {AlertProvider} from "../../providers/alert";
import {TranslateProvider} from "../../providers/translate";
import {GeolocProvider} from "../../providers/geoloc";
import {ConfigProvider} from "../../providers/config";

@Component({
  selector: 'box-map',
  templateUrl: 'box-map.html'
})
export class BoxMapComponent {
  @Input() citiesCoords: any = {
    'longitude': null,
    'latitude': null
  };

  @Input() selectedTarget: string = '';
  @Input() parcoursList: Array<any> = [];
  @Input() pointOfInterestList: Array<any> = [];

  pointOfInterestMarkerList: Array<any> = [];
  clusterList: Array<any> = [];

  map: any = null;
  posMarker: any = null;
  isMapRendered: boolean = false;
  
  config = {
    'tileLayer': 'https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
    'selector': 'map_component__content',
    'minZoom': 9,
    'maxZoom': 18,
    'defaultZoom': 13
  };

  constructor(private http: HttpClient,
              private api: ApiProvider,
              public geoloc: GeolocProvider,
              public configProvider: ConfigProvider,
              private dataProvider: DataProvider,
              public translate: TranslateProvider,
              private alert: AlertProvider,
              private geolocation: Geolocation) {
    leaflet.markercluster = leafletMarkercluster;
  }

  ngAfterViewInit () {
  }

  async ngOnChanges () {
    const selectedTarget = this.selectedTarget;

    /**
     * Chargement de la map par défaut ou changement des coordonnées du centre de la map.
     */
    await this.renderMap(this.citiesCoords.latitude, this.citiesCoords.longitude, this.config.defaultZoom);

    // On supprime les données de la map pour afficher les nouvelles données.
    this.removeMarkers();
    this.removeParcours();

    // Initialise les données des points d'intérêts et des parcours.
    this.initializePointOfInterest(this.pointOfInterestList).then((listGroup: any) => {
      if (this.selectedTarget === 'point-of-interest') {
        this.addPointsOfInterests(listGroup);
      }

      if (this.selectedTarget === 'parcours') {
        this.initializeParcours(this.parcoursList, listGroup);
      }
    });
  }

  /**
   * Construction de la map et affichage à l'écran
   * Cette méthode peut-être appelée de multiple fois
   * la map ne sera initialisé que une seule fois mais les coords
   * latitude <lat>, longitude <lng>, zoom seront assigné à chaque appel.
   * @param lat - Latitude
   * @param lng - Longitude
   * @param zoom - Zoom de la map (ex: 14, 15, 15).
   */
  renderMap (lat: any, lng: any, zoom: any) {
    if (this.map === null) {
      // Initialisation du système et de la configuration.
      this.map = leaflet.map(this.config.selector, {
        'minZoom': this.config.minZoom,
        'maxZoom': this.config.maxZoom
      });

      // Mise en place de la map.
      const tileLayer = leaflet.tileLayer(this.config.tileLayer, {
        'attribution': ''
      }).addTo(this.map);
    }

    // Positionnement de la vue courante.
    this.map.setView([lat, lng], zoom);
  }

  /**
   * Création et ajout d'un marker à la map.
   * @param item
   * @returns {any}
   */
  createAndAddMarker (title: any, lat: any, lng: any, addToMap: boolean = true) {
    const icon = leaflet.icon({
      iconUrl: '/assets/imgs/map/marker.svg',
      iconSize: [35,35],
      iconAnchor: [16,35],
      popupAnchor:  [0,-37]
    });

    const marker = new leaflet.marker([lat, lng], {icon: icon}).bindPopup(title);

    if (addToMap) {
      marker.addTo(this.map);
    }

    return marker;
  }

  /**
   * Creation du HTML du cluster.
   * @param bgColor
   * @param nb
   * @param time
   * @returns {string}
   */
  clusterGroupTPL (bgColor: string, nb: string, time: string) {
    return `<div class='cluster' style='background-color: ${bgColor}'>`
      + `<p>${nb}</p>`
      + `<div><i class="icon icon--clock"></i><span>${time}</span></div></div>`
      ;
  }

  /**
   * Création d'un cluster.
   * @param bgColor
   * @param nb
   * @param time
   * @returns {leaflet.markerClusterGroup}
   */
  createCluster (bgColor: string, nb: string, time: string) {
    const _clusterGroupTPL = this.clusterGroupTPL(bgColor, nb, time);

    const cluster = new leaflet.markerClusterGroup({
      iconCreateFunction: function(cl) {
        return new leaflet.DivIcon({
          html: _clusterGroupTPL
        });
      },
      maxClusterRadius: 16000,
      disableClusteringAtZoom: 20
    });

    return cluster;
  }

  /**
   * Initilisation des points d'intérêts.
   * On en a besoin dans les 2 cas. si le mode "point d'intérêt" ou "parcours"
   * est sélectionné.
   * @param list
   */
  initializePointOfInterest (list: Array<any>) {
    return new Promise((resolve, reject) => {
      /**
       * Construction d'un nouveau tableau groupant les points d'intérêt
       * par parcours pour former un group et pouvoir switcher entre "parcours" et point d'intérêt.
       *
       * TODO: Vérifier que c.parcours.id n'est pas null
       * TODO: Si null = point d'intérêt hors parcours sinon parcours.
       * @type {any}
       * @private
       */
      const listGroup = {};

      // Tri des parcours en group de parcours.
      for(const item of list) {
        const isParcours = item.parcours_id !== null;
        const idList = isParcours ? item.parcours_id : item.id;

        if (typeof listGroup[idList] !== 'undefined') {
          listGroup[idList].data.push(item);
        } else {
          listGroup[idList] = {
            'isParcours': isParcours,
            'data': []
          };
          listGroup[idList].data.push(item);
        }
      }

      // Retour des données triées.
      resolve(listGroup);
    });
  }

  /**
   * Initialisation des parcours si le mode est celui sélectionné.
   * @param parcoursList
   * @param listGroup
   */
  initializeParcours (parcoursList: Array<any>, listGroup: Array<any>) {
    // Loop les parcours.
    for (const parcours of parcoursList) {
      // Check s'il y a des points d'intérêts pour ce parcours
      if (typeof listGroup[parcours.id] !== 'undefined') {
        const pointOfInterests = listGroup[parcours.id];

        // Création du cluster.
        const cluster = this.createCluster(parcours.color, pointOfInterests.data.length, '1h31m');

        // Ajout des point d'intérêts pour le positionnement du cluster du parcours.
        for (const poi of pointOfInterests.data) {
          // Création du marker.
          const {latitude, longitude} = poi.geoloc;
          const marker = this.createAndAddMarker(poi.title[this.configProvider.getLanguage()], latitude, longitude, false);
          // Ajout du marker au groupe.
          cluster.addLayer(marker);
        }

        // Ajout du cluster à la map.
        cluster.addTo(this.map);

        // Save de la référence du cluster.
        this.clusterList.push(cluster);
      }
    }
  }

  /**
   * Création de tous les points d'intérêts si le mode
   * "point-of-interest" est sélectionné.
   * @param listGroup
   */
  addPointsOfInterests (listGroup: any) {
    // Loop des groupes
    for (const groupId in listGroup) {
      for (const item of listGroup[groupId].data) {
        // TODO: vérification des données reçu de la geo loc.
        const {latitude, longitude} = item.geoloc;
        const marker = this.createAndAddMarker(item.title[this.configProvider.getLanguage()], latitude, longitude);
        marker.addTo(this.map);

        // Save de la référence du marker.
        this.pointOfInterestMarkerList.push(marker);
      }
    }
  }

  /**
   * Supprime  tous les markers des points d'intérêts de la map.
   */
  removeMarkers () {
    for (const item of this.pointOfInterestMarkerList) {
      item.remove();
    }
  }

  /**
   * Supprime tous les cluster des parcours de la map.
   */
  removeParcours () {
    for (const item of this.clusterList) {
      item.clearLayers();
    }
  }

  /**
   * Récupération de la position GPS.
   */
  updateCurrentGeoLoc () {
    const elBtnGeoloc = document.querySelector('#btn__geoloc');

    // -- ADD: spinner de chargement.
    elBtnGeoloc.classList.add('btn__geoloc--isLoading');

    this.geoloc.getCurrentCoords().then((resp: any) => {
      const {latitude, longitude} = resp;

      this.addCurrentPosition(latitude, longitude);
      // -- DEL: spinner de chargement.
      elBtnGeoloc.classList.remove('btn__geoloc--isLoading');
    }, (err: any) => {
      // -- DEL: spinner de chargement.
      elBtnGeoloc.classList.remove('btn__geoloc--isLoading');
    });
  }

  /**
   * ADD: Le marker de la position GPS de l'utilisateur.
   *
   * @param latitude
   * @param longitude
   */
  addCurrentPosition (latitude: any, longitude: any) {
    const icon = leaflet.icon({
      iconUrl: '/assets/imgs/map/marker.svg',
      iconSize: [35,35],
      iconAnchor: [16,35],
      popupAnchor:  [0,-37]
    });

    if (this.posMarker !== null) {
      this.posMarker.remove();
    }
    // --> REF. du marker.
    this.posMarker = leaflet
      .marker([latitude, longitude], {icon: icon})
      .bindPopup(this.translate.getKey('C_BOX_MAP_USER_MARKER'));
    this.posMarker.addTo(this.map);
    this.posMarker.openPopup();
    this.map.flyTo({lat: latitude, lng: longitude}, this.config.defaultZoom);
  }
}
