import { Network } from '@ionic-native/network';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule, NavParams} from 'ionic-angular';
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
import { Media } from '@ionic-native/media';

import { CacheModule } from 'ionic-cache';
import {AlertProvider} from "../providers/alert";
import {LoaderPage} from "../pages/loader/loader";
import {BoxMapComponent} from "../components/box-map/box-map";
import {PlayerAudioProvider} from "../providers/playerAudio";
import {CarouselComponent} from "../components/carousel/carousel";
import {GeolocProvider} from "../providers/geoloc";
import {NativeAudio} from "@ionic-native/native-audio";
import {LocalDataProvider} from "../providers/localData";
import { OfflineStorageProvider } from './../providers/offlineStorage';
import { NetworkService } from './../providers/network';
import {FileTransfer} from '@ionic-native/file-transfer';
import {IonicStorageModule} from '@ionic/storage';
import {UniqueDeviceID} from "@ionic-native/unique-device-id";
import {Device} from "@ionic-native/device";
import {DirectAccessPage} from "../pages/direct-access/direct-access";
import {Diagnostic} from "@ionic-native/diagnostic";


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const linksConfig = {
  links: [
    {
      component: LoaderPage,
      name: 'Loader',
      segment: ''
    },
    {
      component: HomePage,
      name: 'Cities',
      segment: ''
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
    },
    {
      component: DirectAccessPage,
      name: 'DirectAccessPage',
      segment: 'direct_access/:criteria',
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
    LoaderPage,
    DirectAccessPage,

    MainHeaderComponent,
    MainContentComponent,
    ParcoursListItemComponent,
    PlayerAudioComponent,
    BoxMapComponent,
    CarouselComponent
  ],
  imports: [
    IonicImageViewerModule,
    BrowserModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      name: 'STS',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
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
    PointOfInterestPage,
    LoaderPage,
    DirectAccessPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    TranslateProvider,
    ConfigProvider,
    ApiProvider,
    AlertProvider,
    LocalDataProvider,
    OfflineStorageProvider,
    Camera,
    File,
    Geolocation,
    NativeAudio,
    Device,
    DataProvider,
    UniqueDeviceID,
    Media,
    PlayerAudioProvider,
    Diagnostic,
    GeolocProvider,
    FileTransfer,
    Network,
    NetworkService
  ]
})

export class AppModule {}
