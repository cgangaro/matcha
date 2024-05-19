import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LocalStorageService, localStorageName } from './local-storage.service';
import { DialogService } from './dialog.service';
import { SocketioService } from './socketio.service';
import { GetFameRatingResponseData, GetInterestingUsersResponseData, GetUserResponseData, UserTags } from '../models/models';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HomeService {
  url: string;
  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private dialogService: DialogService,
    private socketService: SocketioService
  ) {
    this.url = environment.backendUrl || 'http://localhost:3000';
  }

  getInterestingUsers(): Observable<GetInterestingUsersResponseData> {
    return this.http.get<GetInterestingUsersResponseData>(this.url + '/users/interesting', { withCredentials: true });
  }

  getPersonnalFameRating(): Observable<GetFameRatingResponseData> {
    return this.http.get<GetFameRatingResponseData>(this.url + '/users/famerating/' + this.localStorageService.getItem(localStorageName.id), { withCredentials: true });
  }

  positionToDistance(originalLatitude: number, originalLongitude: number, newLatitude: number, newLongitude: number): number {
    const earthRadiusInKm = 6371;
    const differenceLatitude = this._toRadians(newLatitude - originalLatitude);
    const differenceLongitude = this._toRadians(newLongitude - originalLongitude);

    const a =
      Math.sin(differenceLatitude / 2) * Math.sin(differenceLatitude / 2) +
      Math.cos(this._toRadians(originalLatitude)) * Math.cos(this._toRadians(newLatitude)) *
      Math.sin(differenceLongitude / 2) * Math.sin(differenceLongitude / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusInKm * c;

    return distance;
  }

  _toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  nbCommonTags(tags1: UserTags[], tags2: UserTags[]) {
    var count = 0;
    for (var i = 0; i < tags1.length; i++) {
      for (var y = 0; y < tags2.length; y++) {
        if (tags1[i] == tags2[y])
          count++;
      }
    }
    return count;
  }
}