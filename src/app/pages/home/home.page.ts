import { NetworkService } from './../../services/network.service';
import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { ApiService } from './../../services/api.service';
import { City } from "../../models/City";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  listCities: Array<City> = new Array();

  constructor(
    public translate: TranslateService,
    public api: ApiService,
    private network: NetworkService,
    private router: Router
  ) {
    this.initCities();
    this.translate.onLangChange.subscribe(() => {
      this.initCities();
    })
  }

  updateLanguage(language: string) {
    localStorage.setItem('config::locale', language);
    this.translate.use(language);
  }

  async initCities() {
    this.listCities = await this.api.get('/public/cities/list?lang='+this.translate.currentLang);
  }

  async viewCity(event: any, city: any) {
    const connected = this.network.isConnected();
    const cityPath = `/public/cities/byId/${city.id}?lang=${this.translate.currentLang}`;
    const cityData = await this.api.get(cityPath);

    console.log(cityData);
    if (connected || cityData) {
      this.router.navigate([`/city/${city.id}`])
    } else {
      this.network.alertMessage();
    }
  }
}
