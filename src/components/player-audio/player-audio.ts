import { Component, Input } from '@angular/core';
import { TranslateProvider } from "../../providers/translate";
import {PlayerAudioProvider} from "../../providers/playerAudio";
import {NavParams} from "ionic-angular";
import {PlayerAudio} from "../../models/PlayerAudio";
import {ApiProvider} from "../../providers/api";
import {ConfigProvider} from "../../providers/config";
import { Device } from '@ionic-native/device';
import {LocalDataProvider} from "../../providers/localData";

@Component({
  selector: 'player-audio',
  templateUrl: 'player-audio.html'
})
export class PlayerAudioComponent {
  @Input() playerUUID: string = '';
  @Input() loadPlayer: boolean = false;
  @Input() audioURI: string = '';
  @Input() target: string = '';
  @Input() uuid: string = '';
  @Input() audioScript: string = '';
  @Input() showAudioScriptListener: any = null;
  showAudioScript: boolean = false;

  configAudio: any = {
    'playerUUID': '',
    'loadPlayer': false,
    'audioURI': '',
    'target': '',
    'uuid': '',
  };

  get audioPlayer () {
    return this._audioPlayer();
  }

  constructor (public navParams: NavParams,
               public api: ApiProvider,
               private device: Device,
               public localData: LocalDataProvider,
               public translate: TranslateProvider,
               public config: ConfigProvider,
               public playerAudioProvider: PlayerAudioProvider) {
  }

  ngOnChanges() {
    this.initData();
  }

  initData () {
    if (this.loadPlayer && this.audioURI !== '' && (this.configAudio.audioURI === '' || this.audioURI !== this.configAudio.audioURI)) {
      this.configAudio.audioURI = this.audioURI;

      const audioPlayer = new PlayerAudio(
        this.playerUUID,
        this.audioURI
      );

      audioPlayer.init();
      this.playerAudioProvider.add(audioPlayer, this.playerUUID);
    }
  }

  _audioPlayer () {
    return this.playerAudioProvider.get(this.playerUUID);
  }

  onModelDurationChange (nextDuration: any) {
    this.audioPlayer.track.currentTime = nextDuration;
  }

  updateActionState () {
    this.addListenToLog();

    this.playerAudioProvider.isPlayingAndStopThem(this.playerUUID);
  }

  getUniqIdBrowser () {
    const key = 'sts:browserUniqId';
    let uuid = localStorage.getItem(key);

    if (uuid === null) {
      uuid = 'browser-id-' + (Math.floor(Math.random() * 10000) + 1);
      localStorage.setItem(key, uuid);
      return uuid;
    } else {
      return uuid;
    }
  }

  /**
   * Log des écoutes des audios.
   */
  addListenToLog () {
    const target = this.target;
    const uuid = this.uuid;
    const lang = this.config.getLanguage();
    let phoneId = this.device.uuid;
    phoneId = phoneId !== null ? phoneId : this.getUniqIdBrowser();

    if (target === 'parcours' || target === 'interests') {
      if (! this.localData.isAudioLoggedOrLogIt(target, uuid, lang)) {
        this.addListenToLogApiCall(target, uuid, phoneId, lang);
      }
    }
  }

  /**
   * Envoi la requête de log vers l'api.
   * @param target - "parcours" ou "interests".
   * @param uuid - uuid du target.
   * @param phoneId - uuid du téléphone.
   * @param lang - langue d'écoute.
   */
  addListenToLogApiCall (target: string, uuid: string, phoneId: string, lang: string) {
    const endpoint = `/public/${target}/listen/${uuid}?phone_id=${phoneId}&lang=${lang}`;

    this.api.get(endpoint).subscribe((resp: any) => {
      // console.log('addListenToLogApiCall resp', resp);
    }, (error: any) => {
      // console.log('addListenToLogApiCall error', error);
    });
  }

  /**
   * Affichage ou cache le script audio au clique du bouton.
   */
  openAudioScriptPopup () {
    this.showAudioScript = this.showAudioScript ? false : true;

    if (this.showAudioScriptListener !== null) {
      this.showAudioScriptListener(this.showAudioScript);
    }
  }
}
