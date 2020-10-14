import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  fontSize = '4'

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  /**
  * Mise a jour de la langue à la modification de l'état du toggle.
  */
  updateLanguage() {
  }

  /**
  * Mise a jour de la taille de la police.
  */
  updateFontSize() {
  }

  /**
  * Mise a jour du thème à la modification de l'état du toggle.
  */
  updateTheme() {
  }

  deleteMedia () {
  }

}
