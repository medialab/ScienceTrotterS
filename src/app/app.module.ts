import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Camera } from '@ionic-native/camera';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { File } from '@ionic-native/file';

import { MyApp } from './app.component';
import { TranslateProvider } from '../providers/translate';
import { ConfigProvider } from "../providers/config";
import { ApiProvider } from '../providers/api';
import { MainHeaderComponent } from "../components/main-header/main-header";

import { HomePage } from '../pages/home/home';
import { SettingsPage } from "../pages/settings/settings";
import {MainContentComponent} from "../components/main-content/main-content";
import {CreditsPage} from "../pages/credits/credits";
import {PreviewByCityPage} from "../pages/preview-by-city/preview-by-city";
import { Geolocation } from '@ionic-native/geolocation';
import {ParcoursListItemComponent} from "../components/parcours-list-item/parcours-list-item";
import {DataProvider} from "../providers/data";
import {PointOfInterestPage} from "../pages/point-of-interest/point-of-interest";
import {PlayerAudioComponent} from "../components/player-audio/player-audio";

import { IonicImageViewerModule } from 'ionic-img-viewer';

import { CacheModule } from 'ionic-cache';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const linksConfig = {
  links: [
    {
      component: HomePage,
      name: 'Cities',
      segment: 'cities'
    },
    {
      component: SettingsPage,
      name: 'Settings',
      segment: 'settings',
      defaultHistory: [HomePage]
    },
    {
      component: CreditsPage,
      name: 'Credits',
      segment: 'credits',
      defaultHistory: [HomePage]
    },
    {
      component: PreviewByCityPage,
      name: 'PreviewByCity',
      segment: 'preview_by_city/:uuid',
      defaultHistory: [HomePage]
    },
    {
      component: PointOfInterestPage,
      name: 'PointOfInterest',
      segment: 'point_of_interest',
      defaultHistory: [HomePage]
    }
  ]
};

@NgModule({
  declarations: [
    MyApp,

    HomePage,
    SettingsPage,
    CreditsPage,
    PreviewByCityPage,
    PointOfInterestPage,

    MainHeaderComponent,
    MainContentComponent,
    ParcoursListItemComponent,
    PlayerAudioComponent
  ],
  imports: [
    IonicImageViewerModule,
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp, {
        tabsPlacement: 'bottom',
        platforms: {
          ios: {
            menuType: 'overlay',
          }
        }
      },
      linksConfig
    ),
    CacheModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingsPage,
    CreditsPage,
    PreviewByCityPage,
    PointOfInterestPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},

    TranslateProvider,
    ConfigProvider,
    ApiProvider,

    Camera,
    File,
    Geolocation,
    DataProvider
  ]
})

export class AppModule {}
