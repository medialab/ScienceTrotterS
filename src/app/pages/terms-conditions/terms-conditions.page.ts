import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './../../services/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.page.html',
  styleUrls: ['./terms-conditions.page.scss'],
})
export class TermsConditionsPage implements OnInit {
  content: string = '';

  constructor(
    public api: ApiService,
    public translate: TranslateService,
  ) {
    this.loadCreditsFromApi()
  }

  ngOnInit() {
  }

  loadCreditsFromApi() {
    this.api.get('/public/credits/latest').subscribe((resp: any) => {
      if(resp.success) {
        this.content = resp.data.content[this.translate.currentLang];
        console.log('content', this.content);
      }
    }, (onError) => {
      console.log('onError');
    });
  }

}
