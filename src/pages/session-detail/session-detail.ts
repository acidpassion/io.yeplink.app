import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ConferenceData } from '../../providers/conference-data';

@Component({
  selector: 'page-session-detail',
  templateUrl: 'session-detail.html'
})
export class SessionDetailPage {
  session: any;
  defaultTab: string = "startPanko";
  constructor(
    public dataProvider: ConferenceData,
    public navParams: NavParams,
    public toastCtrl: ToastController
  ) {}

  saveFilter() {
    this.dataProvider.saveFilter(this.session).then((result) => {
      console.log(result);
      this.showToast('bottom', 'success','保存成功!');
    }, (err) => {
      console.log(err);
      this.showToast('bottom', 'error', '保存失败');
    });
  }

  showToast(position: string, type:string, msg:string) {
    let toast = this.toastCtrl.create({
      message:  msg,
      duration: 2000,
      position: position,
      cssClass: 'toast-'+type
    });

    toast.present(toast);
  }

  ionViewWillEnter() {
    this.dataProvider.load(false).subscribe((data: any) => {
      console.log(data);
      if (
        data
      ) {
        for (const session of data) {
          if (session && session.id === this.navParams.data.sessionId) {
            this.session = session;
            this.defaultTab = 'startPanko';
            break;
          }
        }
      }
    });
  }
}
