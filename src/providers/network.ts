import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/'
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController, Platform } from 'ionic-angular';
import {AlertProvider} from "./alert";
import { TranslateProvider} from "./translate";

export enum ConnectionStatus {
  Online,
  Offline
}

@Injectable()
export class NetworkService {

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Online);

  constructor(
    private network: Network,
    private toastCtrl: ToastController,
    private alert: AlertProvider,
    public translate: TranslateProvider,
    private plt: Platform) {
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
    });
  }

  public initializeNetworkEvents() {
    let status;
    if (this.network && this.network.type) {
      status = (this.plt.is('mobile') && this.network && this.network.type)
      || !this.plt.is('mobile')
      || this.plt.is('core') ? ConnectionStatus.Online : ConnectionStatus.Offline;

      // cordova platform
      this.network.onDisconnect().subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Online) {
          this.updateNetworkStatus(ConnectionStatus.Offline);
        }
      });

      this.network.onConnect().subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Offline) {
          this.updateNetworkStatus(ConnectionStatus.Online);
        }
      });
    } else if (window && navigator) {
      // pwa mode
      status = navigator.onLine ? ConnectionStatus.Online : ConnectionStatus.Offline;
      Observable.fromEvent(window, "offline").subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Online) {
          this.updateNetworkStatus(ConnectionStatus.Offline);
        }
      });
      Observable.fromEvent(window, "online").subscribe(() => {
        if (this.status.getValue() === ConnectionStatus.Offline) {
          this.updateNetworkStatus(ConnectionStatus.Online);
        }
      });
    }
    this.status.next(status);
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);

    let connection = status == ConnectionStatus.Offline ? 'offline' : 'online';
    let toast = this.toastCtrl.create({
      message: this.translate.getKeyAndReplaceWords('TOAST_MSG_NETWORK', { connection }),
      duration: 3000,
      position: 'bottom'
    });

    toast.present()
  }

  public getStatus(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getStatusValue(): ConnectionStatus {
    return this.status.getValue();
  }

  public alertIsNetworkOff() {
    const title = this.translate.getKey('GLOBAL_NETWORK_IS_NOT_AVAILABLE');
    const message = this.translate.getKey('GLOBAL_NEED_NETWORK_FOR_DATA');
    this.alert.create(
      title,
      message
    )
  }
}