import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from './../../services/api.service';

@Component({
  selector: 'app-city',
  templateUrl: './city.page.html',
  styleUrls: ['./city.page.scss'],
})
export class CityPage implements OnInit {
  city: any;
  constructor(
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private api: ApiService
  ) {}
  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id) {
      this.api.get(`/public/cities/byId/${id}?lang= ${this.translate.currentLang}`)
        .subscribe((resp: any) => {
          if (resp.success) {
            this.city = resp.data;
          }
        }, (err: any) => {});
    }
  }

}
