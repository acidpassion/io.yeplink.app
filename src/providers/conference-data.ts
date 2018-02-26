import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { UserData } from './user-data';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';


@Injectable()
export class ConferenceData {
  data: any;
  pankos: any;
  apiUrl = 'http://112.74.57.41:8000/api';
  pythonApiUrl = 'http://112.74.57.41:8001/';
  // apiUrl = 'http://localhost:5000/api';
  headers: Headers;
  options: RequestOptions;
  constructor(public http: Http, public user: UserData) {
    this.headers = new Headers({ 'Content-Type': 'application/json', 'Accept': 'q=0.8;application/json;q=0.9' });
    this.options = new RequestOptions({ headers: this.headers });
    
   }

  load(refresh: boolean): any {
    if (this.data&&!refresh) {
      return Observable.of(this.data);
    } else {
      return this.http.get(this.apiUrl + '/filters')
        .map(this.processData, this);
    }
  }

  getPankos(): any {
    return this.http.get(this.apiUrl + '/pankos')
    .map(this.processPanko, this);
  }

  getGameDetails(): any {
    return this.http.get(this.pythonApiUrl + 'games')
      .map(response => response.json());
  }

  getGamesByFilterId(filterId:string): any {
    return this.http.get(this.pythonApiUrl + 'games/' + filterId)
      .map(response => response.json());
  }

  deleteSession(sessionId: string): any{
    let cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: cpHeaders });
    return this.http.delete(this.apiUrl +"/filters/" + sessionId, options)
      .map(success => success.status)
      .catch(this.handleError);
  }

  handleError(error: any) {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  processPanko(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.pankos = data.json();
    return this.pankos;
  }
  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data.json();
    return this.data;
  }

  

  getTimeline(queryText = '', excludeTracks: any[] = [], segment = 'all', refresh = false) {
    return this.load(refresh).map((data: any) => {
      let day = data;
      console.log(data);
      day.shownSessions = 0;

      queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
      let queryWords = queryText.split(' ').filter(w => !!w.trim().length);

      day.forEach((session: any) => {
        // check if this session should show or not
        this.filterSession(session, queryWords, excludeTracks, segment);

        if (!session.hide) {
          // if this session is not hidden then this group should show
          day.shownSessions++;
        }
      });

      return day;
    });
  }

  filterSession(session: any, queryWords: string[], excludeTracks: any[], segment: string) {

    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach((queryWord: string) => {
        if (session.description.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }

    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test
    let matchesTracks = false;
    if (excludeTracks.indexOf(session.description) === -1) {
      matchesTracks = true;
    }

    // if the segement is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.description)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }

    // all tests must be true if it should not be hidden
    session.hide = !(matchesQueryText && matchesTracks && matchesSegment);
  }

  saveFilter(data) {
    console.log(data);
    if(data.id==''){
      return new Promise((resolve, reject) => {
        this.http.post(this.apiUrl + '/filters/', data)
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      });
    }
    else{
      return new Promise((resolve, reject) => {
        this.http.put(this.apiUrl + '/filters/' + data.id, data)
          .subscribe(res => {
            resolve(res);
          }, (err) => {
            reject(err);
          });
      });
    }
  }

}
