import { Component } from '@angular/core';

@Component({
  selector: 'player-audio',
  templateUrl: 'player-audio.html',
})

export class PlayerAudioComponent {
  currentDuration: number = 22.5;
  timerCurrent: string = '02.33';
  timerLeft: string = '-10:22';

  constructor () {
  }

  durationChange ($event) {
    this.currentDuration = parseInt($event.target.value, 10);
  }
}
