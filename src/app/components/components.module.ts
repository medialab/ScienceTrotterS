import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MainHeaderComponent } from './main-header/main-header.component';
import { ListItemComponent } from './list-item/list-item.component';
import { BoxMapComponent } from './box-map/box-map.component';

import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations:[
    MainHeaderComponent,
    MainContentComponent,
    BoxMapComponent,
    AudioPlayerComponent,
    ListItemComponent
  ],
  imports: [
    IonicModule,
    TranslateModule,
    CommonModule
  ],
  exports:[
    MainHeaderComponent,
    MainContentComponent,
    AudioPlayerComponent,
    BoxMapComponent,
    ListItemComponent
  ]
})

export class ComponentsModule{}