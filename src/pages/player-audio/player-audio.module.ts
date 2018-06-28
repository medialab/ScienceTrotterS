import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayerAudioPage } from './player-audio';

@NgModule({
  declarations: [
    PlayerAudioPage,
  ],
  imports: [
    IonicPageModule.forChild(PlayerAudioPage),
  ],
})
export class PlayerAudioPageModule {}
