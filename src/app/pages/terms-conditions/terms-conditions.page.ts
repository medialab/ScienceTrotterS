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

  async loadCreditsFromApi() {
    const response: any = await this.api.get('/public/credits/latest')
    this.content = response.content[this.translate.currentLang]
  }
}
