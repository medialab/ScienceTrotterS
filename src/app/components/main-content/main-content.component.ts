import { Component, OnInit } from '@angular/core';
import { ConfigService } from './../../services/config.service';

@Component({
  selector: 'main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
})
export class MainContentComponent implements OnInit {

  constructor(public config: ConfigService) { }

  ngOnInit() {}

}
