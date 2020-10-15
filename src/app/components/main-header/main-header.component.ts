import { ConfigService } from './../../services/config.service';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {
  @Input() withMenu: boolean = false;
  @Input() withBackButton: boolean = false;

  constructor(
    private location: Location,
    private config: ConfigService
  ) {}
  ngOnInit() {}

  goBack () {
    this.location.back();
  }
}
