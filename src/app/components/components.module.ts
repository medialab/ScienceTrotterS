import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MainHeaderComponent } from './main-header/main-header.component';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations:[MainHeaderComponent],
  imports: [
    IonicModule,
    TranslateModule,
    CommonModule
  ],
  exports:[MainHeaderComponent]
})

export class ComponentsModule{}