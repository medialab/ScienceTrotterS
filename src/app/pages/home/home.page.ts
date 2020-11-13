import { LanguageService } from './../../services/language.service';
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
  filterLang: string = "fr";

  constructor(
    public translate: TranslateService,
    public language: LanguageService,
    public api: ApiService,
    private network: NetworkService,
    private router: Router
  ) {
    this.language.filter.subscribe((lang) => {
      this.filterLang = lang;
      this.initCities(lang);
    });
  }

  updateLanguageFilter(value: string) {
    this.language.updateLangFilter(value);
  }

  async initCities(lang) {
    this.listCities = await this.api.get('/public/cities/list?lang='+lang);
  }

  async viewCity(event: any, city: any) {
    const connected = this.network.isConnected();
    const cityPath = `/public/cities/byId/${city.id}?lang=${this.filterLang}`;
    const cityData = await this.api.get(cityPath);

    if (connected || cityData) {
      this.router.navigate([`/city/${city.id}`])
    } else {
      this.network.alertMessage();
    }
  }
}
