import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ApiProvider} from "../../providers/api";
import {TranslateProvider} from "../../providers/translate";
import {ConfigProvider} from "../../providers/config";

@IonicPage()
@Component({
  selector: 'page-point-of-interest',
  templateUrl: 'point-of-interest.html',
})
export class PointOfInterestPage {
  helpItemActive = '';

  curTarget: string = '';
  curId: string = '';
  pageName: string = '';

  interests: Array<any> = new Array();
  activeItem = 0;

  mainContentCls = {
    mainContent: true,
    isHidden: false,
  };

  constructor (public navCtrl: NavController,
               public navParams: NavParams,
               public api: ApiProvider,
               public config: ConfigProvider,
               public translate: TranslateProvider) {
    this.curTarget = navParams.get('target');
    this.curId = navParams.get('openId');
    this.pageName = navParams.get('pageName');

    this.init(navParams.get('target'), navParams.get('openId'));
  }

  init(curTarget: string, curId: string) {
    this.fetchData(curTarget, curId);
  }

  fetchData (curTarget: string, curId: string) {
    let resURI = '';
    resURI = curTarget === 'interests'
      ? '/public/interests/byId/'
      : '/public/interests/byParcourId/';

    this.api.get(resURI + curId).subscribe((resp: any) => {
      if (resp.success) {
        this.interests = resp.data;
        console.log('success fetchPOI', resp.data);
      }
    }, (error: any) => {
      console.log('error fetchPOI', error);
    });
  }

  showMoveBtn (dir: string) {
    let show = false;

    switch (dir) {
      case 'prev':
        show =  this.activeItem === 0 ? false : true;
        break;
      case 'next':
        if (this.interests.length > (this.activeItem + 1)) {
          show = true;
        } else {
          show = false;
        }
        break;
    }

    return show;
  }

  setHelpItemActive (target: string) {
    this.helpItemActive = target;
  }

  updateMainContentState (action: boolean) {
    this.mainContentCls.isHidden = action ? false: true;
  }

  onClickMoveList (dir: string) {
    switch (dir) {
      case 'prev':
        if (this.activeItem > 0) {
          this.activeItem = this.activeItem - 1;
          this.updateMainContentState(true);
          this.setHelpItemActive("");
        }
        break;
      case 'next':
        if (this.interests.length > (this.activeItem + 1)) {
          this.activeItem = this.activeItem + 1;
          this.updateMainContentState(true);
          this.setHelpItemActive("");
        }
        break;
    }
  }

  onClickSetHelpItemActive (target: string) {
    if (this.helpItemActive === target) {
      this.setHelpItemActive("");
      this.updateMainContentState(true);
    } else {
      this.setHelpItemActive(target);
      this.updateMainContentState(false);
    }
  }

  getHelpItemActive (target: string, isMainContent: boolean = false) {
    if (isMainContent && this.helpItemActive !== '') {
      return 'isActive';
    }  else {
      return this.helpItemActive !== target ? 'isHidden' : 'isActive';
    }
  }

  getData (key: string, translate: boolean = false) {
    let value = "";
    if (typeof this.interests[this.activeItem] === 'undefined') {
      return '';
    } else {
      if (!translate) {
        return this.interests[this.activeItem][key];
      } else {
        return this.translate.fromApi(this.config.getLanguage(), this.interests[this.activeItem][key]);
      }
    }
  }

  sliceStr (str: string, length: number) {
    if (str.length > length) {
      return str.slice(0, (length - 3)) + '...';
    } else {
      return str.slice(0, length);
    }
  }

  btnReportProblem () {
    console.log('btnReportProblem');
  }

  btnEndPointOfInterest () {
    console.log('btnEndPointOfInterest');
  }
}
