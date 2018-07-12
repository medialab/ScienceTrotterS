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
    this.addFuncs();

  }

  ngAfterViewInit () {
  }

  async ngOnChanges () {
    console.group('ngOnChanges');
      console.log('this.selectedTarget', this.selectedTarget);
      console.log('this.parcoursList', this.parcoursList);
      console.log('this.pointOfInterestList', this.pointOfInterestList);
    console.groupEnd();

    /**
     * Chargement de la map par défaut ou changement des coordonnées du centre de la map.
     */
    await this.renderMap(this.citiesCoords.latitude, this.citiesCoords.longitude, this.config.defaultZoom);

    /**
     * Gestion des points d'intérêts.
     */
    if (this.selectedTarget === 'point-of-interest') {
      this.addMarkers(this.pointOfInterestList);
    } else {
      this.removeMarkers();
    }

    /**
     * Gestion des parcours.
     */
    if (this.selectedTarget === 'parcours') {
      // TODO: parcours.
    }
  }

  addFuncs() {
    const requestHttp = this.http;

    leaflet.mPolyline = leaflet.FeatureGroup.extend({
      'initialize': function (items) {
        const oThis = this;

        oThis._layers = {};

        /**
         *
         * @param _items
         */
        const loadJsonRoute = function (_items) {
          const routeInfos = {
            'timeTrajet': 0
          };
          const pointsArray = [];

          if (typeof items.route !== 'undefined') {
            requestHttp.get('/assets/routes/' + items.route + '.json').subscribe((resp: any) => {
              const jsonRoute = resp;
              const routes = jsonRoute.routes[0].geometry.coordinates;
              const timeTrajet = jsonRoute.routes[0].summary.duration;

              routeInfos.timeTrajet = timeTrajet;

              for (var i = 0; i < routes.length; i++) {
                pointsArray.push(new leaflet.LatLng(routes[i][1], routes[i][0]));
              }
              oThis.addLayer(new leaflet.Polyline(pointsArray, {color: _items.polylineColor.color}));

            }, (err: any) => {
              console.log('error mPolyline');
            });
          }

          /**
           *
           */
          oThis.addLayer(oThis._markersArray(items, routeInfos));
          return pointsArray;
        };

        /**
         *
         */
        loadJsonRoute(items);
      },

      '_markersArray': function(_items, _routeInfos) {
        const markers = new leaflet.featureGroup();

        const clusterGroupTPL = (bgColor, nb, time) => {
          return `<div class='cluster' style='background-color: ${bgColor}'>`
          + `<p>${nb}</p>`
          + `<div><i class="icon icon--clock"></i><span>${time}</span></div></div>`
        };

        const cluster = new leaflet.markerClusterGroup({
          iconCreateFunction: function(cl) {
            return new leaflet.DivIcon({
              html: clusterGroupTPL(_items.clustergroup.bg, cl.getChildCount(), '2H')
            });
          },
          maxClusterRadius: 4000,
          // disableClusteringAtZoom: 17,
          // spiderfyOnMaxZoom: 15
        });

        for (var i = 0; i < _items.markers.length; i++) {
          const item = _items.markers[i];
          const icon = leaflet.icon({
            iconUrl: (item.icon == undefined ? '/assets/imgs/map/pin.png' : item.icon.url),
            iconSize: [35,35],
            iconAnchor: [16,35],
            popupAnchor:  [0,-37]
          });
          const marker = new leaflet.marker([item['lat'],item['lng']], {icon: icon}).bindPopup(item['title']);

          cluster.addLayer(marker);
        }

        markers.on('mouseover', function (e) {
          e.layer.openPopup()
        })
        markers.on('mouseout', function (e) {
          e.layer.closePopup()
        })

        return cluster;
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

  addPoyline (item: any) {
    const polyline = new leaflet.mPolyline(item);
    this.map.addLayer(polyline);
  }

  /**
   * Création et ajout d'un marker à la map.
   * @param item
   * @returns {any}
   */
  createAndAddMarker (title: any, lat: any, lng: any) {
    const icon = leaflet.icon({
      iconUrl: '/assets/imgs/map/marker.svg',
      iconSize: [35,35],
      iconAnchor: [16,35],
      popupAnchor:  [0,-37]
    });

    const marker = new leaflet.marker([lat, lng], {icon: icon}).bindPopup(title);

    marker.addTo(this.map);
    return marker;
  }

  /**
   * Creation du HTML du cluster.
   * @param bgColor
   * @param nb
   * @param time
   * @returns {string}
   */
  clusterGroupTPL (bgColor, nb, time) {
    return `<div class='cluster' style='background-color: ${bgColor}'>`
      + `<p>${nb}</p>`
      + `<div><i class="icon icon--clock"></i><span>${time}</span></div></div>`
    ;
  }

  createCluster (name: string, color: string, nb: any) {
    const _clusterGroupTPL = this.clusterGroupTPL('red', '0', '0');

    const cluster = new leaflet.markerClusterGroup({
      iconCreateFunction: function(cl) {
        return new leaflet.DivIcon({
          html: _clusterGroupTPL
        });
      },
      maxClusterRadius: 4000
    });

    return cluster;
  }

  /**
   * Ajout des différents markers des points d'intérêts.
   * @param list
   */
  addMarkers (list: Array<any>) {
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

    // Création et ajout des markers.
    for (const groupId in listGroup) {
      const group = listGroup[groupId];

      for (const item of group.data) {
        const {latitude, longitude} = item.geoloc;
        const marker = this.createAndAddMarker(
          item.title[this.configProvider.getLanguage()],
          latitude, longitude);

        // Save de la référence du marker.
        this.pointOfInterestMarkerList.push(marker);
      }
    }

  }

  /**
   * Supprime  tous les markers des points d'intérêts de la map.
   */
  removeMarkers () {
    console.log('removeMarkers');
    for (const item of this.pointOfInterestMarkerList) {
      item.remove();
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










