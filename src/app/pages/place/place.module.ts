import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlacePageRoutingModule } from './place-routing.module';

import { ComponentsModule } from './../../components/components.module';
import { PlacePage } from './place.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ComponentsModule,
    IonicModule,
    PlacePageRoutingModule
  ],
  declarations: [PlacePage]
})
export class PlacePageModule {}
