import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private translate: TranslateService
  ) {}

  updateLanguage(language: string) {
    localStorage.setItem('locale', language);
    this.translate.use(language);
  }

  getCurrentLang() {
    return this.translate.currentLang;
  }
}
