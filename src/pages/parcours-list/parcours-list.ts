import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {App, Content, IonicPage, NavController, NavParams} from 'ionic-angular';
import {TranslateProvider} from "../../providers/translate";
import leaflet from 'leaflet';
import {ConfigProvider} from "../../providers/config";
import {ApiProvider} from "../../providers/api";

@IonicPage()
@Component({
  selector: 'page-parcours-list',
  templateUrl: 'parcours-list.html',
})
export class ParcoursListPage {
  @ViewChild(Content) content: Content;
  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  city: any;
  parcours: Array<any> = new Array();
  interests: Array<any> = new Array();

  contentListClass = {
    contentList: true,
    isOpen: false
  };

  optionsItemsSelected: number = 2;
  otpionsItems = [
    {
      id: 0,
      name: 'Tri par proximité 1'
    },
    {
      id: 1,
      name: 'Tri par proximité 2'
    },
    {
      id: 2,
      name: 'Tri par proximité 3'
    }
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
              public translate: TranslateProvider) {
    this.city = navParams.get('city');
    this.loadParcours();
    this.loadInterests();
  }

  ionViewDidEnter() {
    // this.loadMap();
  }

  openContentList() {
    this.contentListClass.isOpen = this.contentListClass.isOpen ? false : true;
  }

  currentOpenIcon() {
    return this.contentListClass.isOpen ? 'ios-arrow-down': 'ios-arrow-up';
  }

  onChangeSelectedTarget(next: any) {
    this.selectTargetPoints.isSelected = next.checked === true;
    this.selectTargetParcours.isSelected = next.checked === false;
  }

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
  }

  loadParcours() {
    console.log('city', this.city);
    this.api.get('/public/parcours/byCityId/' + this.city.id).subscribe((resp: any) => {
      if (resp.success) {
        this.parcours = resp.data;
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  loadInterests() {
    console.log('city', this.city);
    this.api.get('/public/interests/byCityId/' + this.city.id).subscribe((resp: any) => {
      if (resp.success) {
        this.interests = resp.data;
      }
    }, (error: any) => {
      console.log('error', error);
    });
  }

  getTotalInterestsByParcourId(parcourId: string) {
    return this.interests.filter(interest => {
      return interest.parcours_id === parcourId
    }).length;
  }

  loadMap() {
    /**
    this.map = leaflet.map("map").fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.map.locate({
      setView: true,
      maxZoom: 10
    }).on('locationfound', (e) => {
      let markerGroup = leaflet.featureGroup();
      let marker: any = leaflet.marker([e.latitude, e.longitude]).on('click', () => {
        alert('Marker clicked');
      })

      markerGroup.addLayer(marker);
      this.map.addLayer(markerGroup);
    }).on('locationerror', (err) => {
      alert(err.message);
    })
    */
  }
}
