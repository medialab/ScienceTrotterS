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
    private translate: TranslateService,
    private api: ApiService,
    private router: Router
  ) {
    this.initCities();
    this.translate.onLangChange.subscribe(() => {
      this.initCities();
    })
  }

  updateLanguage(language: string) {
    localStorage.setItem('locale', language);
    this.translate.use(language);
  }

  initCities() {
    this.api.get('/public/cities/list?lang=' + this.translate.currentLang).subscribe((resp: any) => {
      if (resp.success) {
        this.listCities = resp.data;
      }
    }, (err: any) => {});
  }

  viewCity(event: any, city: any) {
    this.router.navigate([`/city/${city.id}`])
  }
}
