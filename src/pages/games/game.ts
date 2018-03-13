import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ConferenceData } from '../../providers/conference-data';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Platform } from 'ionic-angular'; 

@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GameDetailPage {
  session: any;
  games:any;
  description:string
  constructor(
    public dataProvider: ConferenceData,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    private localNotifications: LocalNotifications,
    private platform: Platform
  ) 
  {
    if (this.platform.is('android')) {
      console.log("running on Android device!");
    }
    if (this.platform.is('ios')) {
        console.log("running on iOS device!");
    }
    if (this.platform.is('mobileweb')) {
        console.log("running in a browser on mobile!");
    }
    if (this.platform.is('core')) {
      console.log("running on a desktop web browser!");
    }
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
    
    this.description = this.navParams.data.description;
    this.dataProvider.getGamesByFilterId(this.navParams.data.sessionId).subscribe((games: any) => {
      console.log(games);
      if (
         games.length >0
      ) {
        this.games = games[0].data;
        console.log(this.games);
        if (this.platform.is('android')) {
          this.localNotifications.schedule({
            id: 1,
            text: '有 ' + this.games.length + ' 场比赛',
            sound:'file://sound.mp3',
            title: '有料到'
          });
        }
      }
    });

    this.dataProvider.load(false).subscribe((data: any) => {
      
      if (
        data
      ) {
        for (const session of data) {
          if (session && session.id === this.navParams.data.sessionId) {
            this.session = session;
            break;
          }
        }
      }
    });
  }
}
