import { Component, Input } from '@angular/core';
import { TranslateProvider } from "../../providers/translate";
import {PlayerAudioProvider} from "../../providers/playerAudio";
import {NavParams} from "ionic-angular";
import {PlayerAudio} from "../../models/PlayerAudio";

@Component({
  selector: 'player-audio',
  templateUrl: 'player-audio.html'
})
export class PlayerAudioComponent {
  @Input() playerUUID: string = '';
  @Input() loadPlayer: boolean = false;
  @Input() audioURI: string = '';

  get audioPlayer () {
    return this._audioPlayer();
  }

  constructor (public navParams: NavParams,
               public translate: TranslateProvider,
               public playerAudioProvider: PlayerAudioProvider) {
  }

  /**
   * Evenement émis lorsque les paramètres "Input" sont récupéré.
   */
  ngOnChanges() {
    if (this.loadPlayer && this.audioURI !== '') {
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

    this.playerAudioProvider.isPlayingAndStopThem(this.playerUUID);
  }
}
