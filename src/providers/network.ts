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
    private toastController: ToastController,
    private alert: AlertProvider,
    public translate: TranslateProvider,
    private plt: Platform) {
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      let status = (this.plt.is('mobile') && this.network && this.network.type !== 'none') || !this.plt.is('mobile') || this.plt.is('core') ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  public initializeNetworkEvents() {
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
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);

    let connection = status == ConnectionStatus.Offline ? 'Offline' : 'Online';
    let toast = this.toastController.create({
      message: `You are now ${connection}`,
      duration: 3000,
      position: 'bottom'
    });

    toast.present()
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
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