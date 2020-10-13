import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {
  @Input() withMenu: boolean = false;
  @Input() withBackButton: boolean = false;

  constructor() {

  }

  ngOnInit() {}

  goBack () {
    console.log('goback');
    // if (this.navCtrl.canGoBack()) {
    //   this.navCtrl.pop();
    // } else {
    //   this.navCtrl.setRoot('Cities');
    // }
  }

}
