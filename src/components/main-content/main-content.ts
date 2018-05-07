import { Component } from '@angular/core';
import {ConfigProvider} from "../../providers/config";

@Component({
  selector: 'main-content',
  templateUrl: 'main-content.html'
})
export class MainContentComponent {

  constructor(public config: ConfigProvider) {
  }

}
