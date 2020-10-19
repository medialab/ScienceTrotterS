import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { GeolocService } from 'src/app/services/geoloc.service';

@Component({
  selector: 'box-map',
  templateUrl: './box-map.component.html',
  styleUrls: ['./box-map.component.scss'],
})
export class BoxMapComponent implements OnInit, OnChanges {
  @Input() citiesCoords: any = {
    'longitude': null,
    'latitude': null
  };
  @Input() curPositionUser: any = {
    'longitude': null,
    'latitude': null
  };

  @Input() selectedTarget: string = '';
  @Input() parcoursList: Array<any> = [];
  @Input() placesList: Array<any> = [];

  @Output() updateCurrentPosition = new EventEmitter<any>();

  constructor(
    private geoloc: GeolocService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
  }

  ngOnChanges() {
    // console.log(this.curPositionUser)
  }

  handleUpdateCurrentPosition = () => {
    this.geoloc.getCurrentCoords().then((resp: any) => {
      this.updateCurrentPosition.emit(resp)
    }, (err: any) => {
    });
  }
}
