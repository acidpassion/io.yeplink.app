import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ConferenceData } from '../../providers/conference-data';

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
    public navCtrl: NavController
  ) 
  {
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
        games
      ) {
        this.games = games[0].data;
        console.log(this.games);
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
