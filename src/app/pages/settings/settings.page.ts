import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from './../../services/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  isEnglish = false;
  constructor(
    private translate: TranslateService,
    private config: ConfigService
    ) {
      this.isEnglish = this.translate.currentLang === 'en';
    }
    ngOnInit() {
    }

  /**
  * Mise a jour de la langue à la modification de l'état du toggle.
  */
  updateLanguage() {
    const language = this.isEnglish ? 'en':'fr';
    localStorage.setItem('config::locale', language);
    this.translate.use(language);
  }

  /**
  * Mise a jour du thème à la modification de l'état du toggle.
  */
  updateTheme() {
  }

  deleteMedia () {
  }

}
