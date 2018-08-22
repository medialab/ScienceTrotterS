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
import {Events} from "ionic-angular";
import {LocalDataProvider} from "../../providers/localData";

@Component({
  selector: 'box-map',
  templateUrl: 'box-map.html'
})
export class BoxMapComponent {
  @Input() citiesCoords: any = {
    'longitude': null,
    'latitude': null
  };

  userCoords: any = {
    'longitude': null,
    'latitude': null
  };

  @Input() selectedTarget: string = '';
  @Input() parcoursList: Array<any> = [];
  @Input() pointOfInterestList: Array<any> = [];

  onClickItemMapEventName = 'boxMap::onClickItemMap';
  onClickGeolocEventName = 'boxMap::updateCurrentGeoLoc';

  pointOfInterestMarkerList: Array<any> = [];
  clusterList: Array<any> = [];
  firstInit = true;

  map: any = null;
  posMarker: any = null;
  isMapRendered: boolean = false;

  config = {
    'tileLayer': 'https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}',
    'tmptileLayer': 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
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
              public localData: LocalDataProvider,
              private alert: AlertProvider,
              private geolocation: Geolocation,
              public events: Events) {
    leaflet.markercluster = leafletMarkercluster;

    this.events.subscribe('previewByCity::initMapData', async (data) => {
      this.parcoursList = await data.parcours;
      this.pointOfInterestList = await data.interests;

      this.initMapData.bind(this);
      this.initMapData();
    });

    this.events.subscribe('previewByCity::onChangeSelectedTarget', (target) => {
      this.selectedTarget = target;
      this.initMapData.bind(this);

      if (this.userCoords.longitude !== null && this.userCoords.latitude !== null) {
        this.initMapData(true, this.userCoords.longitude, this.userCoords.latitude);
      } else {
        this.initMapData();
      }
    });

    // -->. Obtenir les coords de l'utilisation longitude, latitude.
    this.events.subscribe('previewByCity::updateCurrentGeoLoc', (data: any) => {
      const {latitude, longitude} = data;

      this.addCurrentPosition(longitude, latitude);
    });

    // -->. Evenement à la sortie de la page " preview by city "
    // pour annuler tous les écoutes des évènements.
    this.events.subscribe('previewByCity::ionViewWillLeave', () => {
      this.events.unsubscribe('previewByCity::updateCurrentGeoLoc');
      this.events.unsubscribe('previewByCity::ionViewWillLeave');
      this.events.unsubscribe('previewByCity::initMapData');
      this.events.unsubscribe('previewByCity::onChangeSelectedTarget');
    });
  }

  ngAfterViewInit () {
  }

  async ngOnChanges () {
    const selectedTarget = this.selectedTarget;

    // Remove all previous evenements.
    if (this.isMapRendered) {
      this.events.unsubscribe(this.onClickItemMapEventName);
    } else {
      await this.renderMap(this.citiesCoords.latitude, this.citiesCoords.longitude, this.config.defaultZoom);
    }

    /**
     * Chargement de la map par défaut ou changement des coordonnées du centre de la map.
     */
    // await this.renderMap(this.citiesCoords.latitude, this.citiesCoords.longitude, this.config.defaultZoom);

    // this.initMapData();
  }

  initMapData (askCurPosition: boolean = false, longitude: any = null, latitude: any = null) {
    // On supprime les données de la map pour afficher les nouvelles données.
    this.removeMarkers();
    this.removeParcours();

    // Si aucune coords on sélectionne ceux de la ville.
    if (! askCurPosition) {
      longitude = this.citiesCoords.longitude;
      latitude = this.citiesCoords.latitude;
    }

    // Initialise les données des points d'intérêts et des parcours.
    this.initializePointOfInterest(this.pointOfInterestList).then((listGroup: any) => {
      if (this.selectedTarget === 'point-of-interest') {
        this.addPointsOfInterests.bind(this);
        this.addPointsOfInterests(listGroup);
      }

      if (this.selectedTarget === 'parcours') {
        this.initializeParcours.bind(this);
        this.initializeParcours(this.parcoursList, listGroup, longitude, latitude);
      }
    });
  }

  createParcoursTraces (parcoursId: string, longitude: any, latitude: any) {
    return new Promise((resolve) => {
      const geoloc = `${longitude};${latitude}`;

      this.api.get(`/public/parcours/trace/${parcoursId}?geoloc=${geoloc}&lang=${this.configProvider.getLanguage()}`).subscribe((resp: any) => {
        const {data} = resp;
        const time = data.length.time;
        const poiArray = [];

        for (const poi of data.interests) {
          if (typeof poi.api_data !== 'undefined') {
            const colorTraceIsDone = '#929090';
            const isTraceIsDone = this.localData.isLandmarkIsDone(poi.id, this.configProvider.getLanguage());

            // Création de la route.
            const _polyline = leaflet.geoJSON(poi.api_data.routes[0].geometry, {
              'color': (isTraceIsDone ? colorTraceIsDone : data.color),
              'weight': 5,
              'opacity': 0.65
            });
            poiArray.push(_polyline);
          }
        }

        resolve({
          'poiArray': poiArray,
          'time': time
        });
      });
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
  createAndAddMarker(target: string, id: string, title: any, lat: any, lng: any, addToMap: boolean = true, color: string = '#1E155E', landmarkId: string = null) {
    const colorMarkerIsDone = '929090';
    const colorMarker = (this.localData.isLandmarkIsDone(landmarkId === null ? id : landmarkId, this.configProvider.getLanguage())
      ? colorMarkerIsDone
      : color.substr(1));

    const markerURI = this.api.getRequestURI('/public/marker/get/' + colorMarker);

    const icon = leaflet.icon({
      iconUrl: markerURI,
      iconSize: [35,35],
      iconAnchor: [16,35],
      popupAnchor:  [0,-37]
    });

    // Création de l'objet du marker.
    const marker = new leaflet.marker([lat, lng], {icon: icon}).bindPopup(title);
    // Ajout des données du marker pour l'utiliser à son clique.
    marker.getData = this.eventOnClickItemMapGetData(target, id);
    // Ajout de l'évènement du clique d'un marker.
    marker.on('click', this.handlerOnClickItemMap);

    if (addToMap && this.map !== null) {
      marker.addTo(this.map);
    }

    return marker;
  }

  /**
   * Mock des données pour la gestion du handler.
   * @param target - "point-of-interest" ou "parcours"
   * @param id - uuid du target.
   * @returns {{target: string, id: string}}
   */
  eventOnClickItemMapGetData (target: string, id: string) {
    return {
      'target': target,
      'id': id
    };
  }

  /**
   * Création d'un évènement au clique d'un item de la map pour
   * utiliser les données récupérer dans la page "preview-by-city" et
   * ouvrir le contenu de l'item à son clique.
   * @param e
   */
  handlerOnClickItemMap = (e) => {
    // @eventOnClickItemMapGetData
    const data = e.target.getData;
    // Publication de l'évènement.
    this.events.publish(this.onClickItemMapEventName, data);
  };

  /**
   * Creation du HTML du cluster.
   * @param bgColor
   * @param nb
   * @param time
   * @returns {string}
   */
  clusterGroupTPL(bgColor: string, nb: string, time: string) {
    return `<div class='cluster' style='background-color: ${bgColor}'>`
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
      disableClusteringAtZoom: 15
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
  async initializeParcours (parcoursList: Array<any>, listGroup: Array<any>, longitude: any, latitude: any) {
    // Loop les parcours.
    for (const parcours of parcoursList) {
      // Check s'il y a des points d'intérêts pour ce parcours
      if (typeof listGroup[parcours.id] !== 'undefined') {
        const pointOfInterests = listGroup[parcours.id];

        // 1. GET /parcours/trace
        const parcoursTraces: any = await this.createParcoursTraces(parcours.id, longitude, latitude);

        // 2. CREATE CLUSTER
        const cluster = this.createCluster(parcours.color, pointOfInterests.data.length, this.createParcoursTime(parcoursTraces.time));
        cluster.getData = this.eventOnClickItemMapGetData('parcours', parcours.id);
        cluster.on('clusterclick', this.handlerOnClickItemMap);

        // 3. ADD All landmarks
        for (const poi of pointOfInterests.data) {
          // Création du marker.
          const {latitude, longitude} = poi.geoloc;
          const marker = this.createAndAddMarker(
            'parcours',
            parcours.id,
            poi.title[this.configProvider.getLanguage()],
            latitude,
            longitude,
            false,
            parcours.color,
            poi.id);

          // Ajout du marker au groupe.
          cluster.addLayer(marker);
        }

        // 4. ADD route.
        for (const trace of parcoursTraces.poiArray) {
          cluster.addLayer(trace);
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

        const marker = this.createAndAddMarker(
          'point-of-interest',
          item.id,
          item.title[this.configProvider.getLanguage()],
          latitude,
          longitude,
          item.id);

        if (this.map !== null) {
          marker.addTo(this.map);
        }

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

    this.events.publish(this.onClickGeolocEventName);

    /**
    const elBtnGeoloc = document.querySelector('#btn__geoloc');

    // -- ADD: spinner de chargement.
    elBtnGeoloc.classList.add('btn__geoloc--isLoading');

    this.geoloc.getCurrentCoords().then((resp: any) => {
      const {latitude, longitude} = resp;

      this.addCurrentPosition(longitude, latitude);
      this.initMapData(true, longitude, latitude);

      // -- DEL: spinner de chargement.
      elBtnGeoloc.classList.remove('btn__geoloc--isLoading');
    }, (err: any) => {
      // -- DEL: spinner de chargement.
      elBtnGeoloc.classList.remove('btn__geoloc--isLoading');
    });
     */
  }

  /**
   * ADD: Le marker de la position GPS de l'utilisateur.
   *
   * @param latitude
   * @param longitude
   */
  addCurrentPosition = async (longitude: any, latitude: any) => {
    await this.initMapData(true, longitude, latitude);

    if (this.map !== null) {
      // --->
      const icon = leaflet.icon({
        iconUrl: 'assets/imgs/map/marker-user.svg',
        iconSize: [30,30],
        popupAnchor:  [0,-15]
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

      setTimeout(() => {
        this.map.flyTo({lat: latitude, lng: longitude}, this.config.defaultZoom);
      }, 110);
    }
  }

  /**
   * Construction d'une date en forme humaine.
   * @param time {'h': '03', 'm': '10'}
   * @returns {string}
   */
  createParcoursTime (time: any) {
    const durationHour = parseInt(time.h);
    const durationMinute = parseInt(time.m);

    if (durationHour > 0) {
      return parseInt(time.h) + 'h' + parseInt(time.m) + 'm';
    } else {
      return parseInt(time.m) + 'm';
    }
  }
}
