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

@Component({
  selector: 'box-map',
  templateUrl: 'box-map.html'
})
export class BoxMapComponent {
  @Input() citiesCoords: any = {
    'longitude': null,
    'latitude': null
  };

  map: any;
  posMarker: any = null;

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
              private dataProvider: DataProvider,
              public translate: TranslateProvider,
              private alert: AlertProvider,
              private geolocation: Geolocation) {
    leaflet.markercluster = leafletMarkercluster;
    this.addFuncs();

  }

  ngAfterViewInit () {
  }

  ngOnChanges () {
    this.renderMap(this.citiesCoords.latitude, this.citiesCoords.longitude, this.config.defaultZoom);
    this.addMarkers();
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

  renderMap (lat: any, lng: any, zoom: any) {
    // Initialisation du système et de la configuration.
    this.map = leaflet.map(this.config.selector, {
      'minZoom': this.config.minZoom,
      'maxZoom': this.config.maxZoom
    });

    // Mise en place de la map.
    const tileLayer = leaflet.tileLayer(this.config.tileLayer, {
      'attribution': ''
    }).addTo(this.map);

    // Positionnement de la vue courante.
    this.map.setView([lat, lng], zoom);
  }

  addPoyline (item: any) {
    const polyline = new leaflet.mPolyline(item);
    this.map.addLayer(polyline);
  }

  addMarkers () {
    for (const item of this.dataProvider.aInterest) {
      this.addPoyline(item);
    }
  }

  addMockMaerkers () {
    const endpoint = 'https://api-sts.actu.com//public/interests/list';
    this.http.get(endpoint).subscribe((resp: any) => {
      const {data} = resp;

      for (const item of data) {
        const marker = {
          'markers': [
            {
              'title': item.title.fr,
              'lat': item.geo.latitude,
              'lng': item.geo.longitude,
              'icon': {
                'url': '/assets/imgs/map/marker.svg'
              }
            }
          ]
        };

        this.addPoyline(marker);
      }
    });
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










