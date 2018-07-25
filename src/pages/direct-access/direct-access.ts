import { Component } from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {ApiProvider} from "../../providers/api";
import {ConfigProvider} from "../../providers/config";

@IonicPage()
@Component({
  selector: 'page-direct-access',
  templateUrl: 'direct-access.html',
})
export class DirectAccessPage {
  fakeURI: string = 'http://domain.com/?';
  uri: URL = null;

  constructor(public navCtrl: NavController,
              public api: ApiProvider,
              public config: ConfigProvider,
              public events: Events,
              public navParams: NavParams) {
    this.initURI();
    this.waitForConfigToBeLoaded();
  }

  log (name: string) {
    console.log(name, Date.now());
  }

  initURI () {
    this.uri = new URL(this.fakeURI + this.navParams.get('criteria'));
  }

  getParam (key: string) {
    return this.uri !== null ? this.uri.searchParams.get(key) : null;
  }

  waitForConfigToBeLoaded () {
    this.log('waitForConfigToBeLoaded');
    this.events.subscribe('sts::configLoaded', () => {
      this.log('waitForConfigToBeLoaded done');
      this.setLang();
      this.openPage();
    });
  }

  setLang () {
    this.log('setLang');
    const nextLang = this.getParam('lang');

    if (nextLang !== null) {
      this.config.updateLanguage(nextLang);
    }
  }

  setRootPage (pageName: string, params: object = {}) {
    this.log('setRootPage ==>' + pageName);
    this.navCtrl.setRoot(pageName, params);
  }

  openPage () {
    const pageName = this.getParam('page_name');
    this.log('openPage ==> pagename : ' + pageName);

    if (pageName !== null) {
      switch (pageName) {
        case 'point-of-interest':
          this.loadPointOfInterestPage();
          break;
        default:
          // Redirect to HomePage.
          break;
      }
    }
  }

  /**
   * Chargement de la page "Point-of-interest"
   * avec commme target un seul point d'intérêt par son ID.
   */
  loadPointOfInterestPage () {
    console.log('loadPointOfInterestPage');

    const landmarkId = this.getParam('landmark_id');

    if (landmarkId !== null) {
      this.getInterestById(landmarkId).then(async (interest: any) => {
        const city: any = await this.getCityById(interest.cities_id).catch((resp) => throwError(resp));

        this.setRootPage('PointOfInterest', {
          'target': 'interest',
          'openId': landmarkId,
          'pageName': 'page name',
          'createdAt': interest.updated_at,
          'interestsList': [interest],
          'geoloc': city.geoloc,
          'curPositionUser': {'latitude': '', 'longitude': ''},
          'sortOrder': null
        });
      }, (resp) => throwError(resp));
    }

    const throwError = (resp: any) => {
      this.setRootPage('Cities');
    };
  }

  getCityById (cityId: string) {
    return new Promise ((success, error) => {
      const path = `/public/cities/byId/${cityId}?lang=${this.config.getLanguage()}`;
      let data: object = null;

      this.api.get(path).subscribe(
        (respOnSuccess: any) => onSuccess(respOnSuccess),
        (respOnFailed: any) => onFailed(respOnFailed),
        () => onDone()
      );

      const onSuccess = (resp: any) => {
        data = resp.data
      };
      const onFailed = (resp: any) => {
        error(resp);
        // Should redirect to HomePage.
      };
      const onDone = () => {
        if (data !== null) {
          success(data);
        }
      };
    });
  }

  getInterestById (interestid: string) {
    return new Promise ((success, error) => {
      const path = `/public/interests/byId/${interestid}?lang=${this.config.getLanguage()}`;
      let data: object = null;

      this.api.get(path).subscribe(
        (respOnSuccess: any) => onSuccess(respOnSuccess),
        (respOnFailed: any) => onFailed(respOnFailed),
        () => onDone()
      );

      const onSuccess = (resp: any) => {
        data = resp.data
      };
      const onFailed = (resp: any) => {
        error(resp);
        // Should redirect to HomePage.
      };
      const onDone = () => {
        if (data !== null) {
          success(data);
        }
      };
    });
  }
}
