import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from './../../services/api.service';
@Component({
  selector: 'app-place',
  templateUrl: './place.page.html',
  styleUrls: ['./place.page.scss'],
})
export class PlacePage implements OnInit {
  place: any;
  constructor(
    public translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    public api: ApiService
  ) { }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if(id) {
      this.api.get(`/public/interests/byId/${id}?lang=${this.translate.currentLang}`)
        .subscribe((resp: any) => {
          if (resp.success) {
            this.place = resp.data;
          }
        }, (err: any) => {});
    }
  }

}
