import { Component, ViewChild } from '@angular/core';
import { ActionSheetController } from 'ionic-angular'
import { Platform, AlertController, App, FabContainer, ItemSliding, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';

/*
  To learn how to use third party libs in an
  Ionic app check out our docs here: http://ionicframework.com/docs/v2/resources/third-party-libs/
*/
// import moment from 'moment';

import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import {Filter} from '../../providers/filter';

import { SessionDetailPage } from '../session-detail/session-detail';
import { GameDetailPage } from '../games/game';

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', { read: List }) scheduleList: List;

  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any = [];
  filters: any = [];
  confDate: string;
  statusCode: number;

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public confData: ConferenceData,
    public user: UserData,
    public platform: Platform,
    public actionSheetCtrl: ActionSheetController
  ) {}

  ionViewDidLoad() {
    this.app.setTitle('Schedule');
    this.updateSchedule(true);
  }

  updateSchedule(refresh: boolean) {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();
    this.confData.getTimeline(this.queryText, this.excludeTracks, this.segment, refresh).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.filters = data;
    });
  }

  addFilter() {
    this.goToSessionDetail(new Filter('','', 0,0,0,0,'',0,0,0,0,'',0,0,0,0,'',0,0,0,0,''));
  }

  goToSessionDetail(sessionData: any) {
    // go to the session detail page
    // and pass in the session data

    this.navCtrl.push(SessionDetailPage, { sessionId: sessionData.id, description: sessionData.description });
  }

  goToGameDetail(sessionData: any) {
    // go to the session detail page
    // and pass in the session data

    this.navCtrl.push(GameDetailPage, { sessionId: sessionData.id, description: sessionData.description });
  }

  deleteSession(sessionData: any){
    this.presentActionSheet(sessionData);
  }

  addFavorite(slidingItem: ItemSliding, sessionData: any) {

    if (this.user.hasFavorite(sessionData.description)) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.description);

      // create an alert instance
      let alert = this.alertCtrl.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      alert.present();
    }

  }

  removeFavorite(slidingItem: ItemSliding, sessionData: any, title: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Remove',
          handler: () => {
            // they want to remove this session from their favorites
            this.user.removeFavorite(sessionData.description);
            this.updateSchedule(true);
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });
    // now present the alert on top of all other content
    alert.present();
  }

  openSocial(network: string, fab: FabContainer) {
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }

  doRefresh(refresher: Refresher) {
    this.confData.getTimeline(this.queryText, this.excludeTracks, this.segment, true).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.filters = data;
      // simulate a network request that would take longer
      // than just pulling from out local json file
      setTimeout(() => {
        refresher.complete();
        const toast = this.toastCtrl.create({
          message: 'Sessions have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }
  presentActionSheet(session: any) {
    let actionSheet = this.actionSheetCtrl.create({
      title: '过滤条件',
      buttons: [
        {
          text: '确定删除？',
          role: 'destructive',
          icon: !this.platform.is('ios') ? 'trash' : null,
          handler: () => {
            this.confData.deleteSession(session.id).subscribe(successCode => {
                this.statusCode = successCode;
                this.updateSchedule(true);
            },
            errorCode => this.statusCode = errorCode);  
          }
        },
        {
          text: '取消',
          role: 'cancel',
          handler: () => {
            this.updateSchedule(false);
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }
}
