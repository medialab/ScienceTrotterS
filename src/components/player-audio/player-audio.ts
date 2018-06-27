import { Component } from '@angular/core';
import { TranslateProvider } from "../../providers/translate";

@Component({
  selector: 'player-audio',
  templateUrl: 'player-audio.html',
})

export class PlayerAudioComponent {
  track: any;
  isPlaying: boolean = false;
  audioURI: string = 'http://sercan.actu.com/audio_test/audio_un.mp3';

  duration = {
    min: '00.00',
    current: '00.00',
    full: '00.00',
    track: {
      current: 0,
      min: 0,
      max: 0
    }
  };

  constructor (public translate: TranslateProvider) {
    this.track = new Audio(this.audioURI);
    this.track.ontimeupdate = this.onTimeUpdate.bind(this);
    this.track.oncanplay = this.onCanPlay.bind(this);
  }

  onModelDurationChange (nextDuration: any) {
    this.track.currentTime = nextDuration;
  }

  set durationCurrent (nextState: any) {

  }

  get durationCurrent () {
    return this.duration.track.current;
  }

  onCanPlay () {
    const duration: any = (this.track.duration / 60).toFixed(2);

    this.duration.track.max = this.track.duration;
    this.duration.full = duration < 10 ? '0' + duration : duration;
  }

  onTimeUpdate (e) {
    const nextCurTime = this.track.currentTime.toFixed(2);

    this.duration.track.current = parseInt(nextCurTime, 10);

    if (nextCurTime < 60) {
      this.duration.current = nextCurTime < 10 ? '00.0' + parseInt(nextCurTime) : '00.' + parseInt(nextCurTime);
    } else {
      this.duration.current = '0' + (nextCurTime / 60).toFixed(2);
    }
  }

  actionFastLeft () {
    this.track.currentTime -= 30.00;
  }

  actionFastRight () {
    this.track.currentTime += 30.00;
  }

  updateActionState () {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.track.pause();
    } else {
      this.isPlaying = true;
      this.track.play();
    }
  }

  upVolume () {
    if (this.track.volume <= 0.9) {
      this.track.volume += 0.1;
    }
  }

  downVolume () {
    if (this.track.volume >= 0.1) {
      this.track.volum -= 0.1;
    }
  }
}
