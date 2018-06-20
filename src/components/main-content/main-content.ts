import {Component, ViewChild} from '@angular/core';
import {ConfigProvider} from "../../providers/config";
import {Content} from "ionic-angular";

@Component({
  selector: 'main-content',
  templateUrl: 'main-content.html'
})
export class MainContentComponent {
  constructor(public config: ConfigProvider) {
  }
}
