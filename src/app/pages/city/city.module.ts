import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CityPageRoutingModule } from './city-routing.module';
import { ComponentsModule } from './../../components/components.module';

import { CityPage } from './city.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    CityPageRoutingModule
  ],
  declarations: [CityPage]
})
export class CityPageModule {}
