import { HttpClient, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { LocalStorageService, localStorageName } from './local-storage.service';
import { DialogService } from './dialog.service';
import { SocketioService } from './socketio.service';
import { GetUserResponseData, LoginResponseData, RegisterResponseData, CompleteRegisterResponseData, IpApiResponseData, LocationIQApiResponseData, UpdateLocationResponseData, EmailValidationResponseData, PasswordResetRequestResponseData, PasswordResetValidationResponseData } from '../models/models';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url: string;
  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorageService: LocalStorageService,
    private dialogService: DialogService,
    private socketService: SocketioService
  ) {
    this.socketService.initSocket();
    this.url = environment.backendUrl || 'http://localhost:3000';
  }

  private isLogged = new Subject<boolean>();
  public isLoggedEmitter = this.isLogged.asObservable();
  logEmitChange(usr: boolean) {
    this.isLogged.next(usr);
  }

  getUserInfos(username: string): Observable<GetUserResponseData> {
    return this.http.post<GetUserResponseData>(this.url + '/users/username', { username }, { withCredentials: true });
  }

  getUserInfosById(id: number): Observable<GetUserResponseData> {
    return this.http.post<GetUserResponseData>(this.url + '/users/id', { id }, { withCredentials: true });
  }

  checkLog() {
    if (!this.localStorageService.getItem(localStorageName.username))
      return false;
    return true;
  }

  checkCompleteRegister() {
    if (!this.localStorageService.getItem(localStorageName.completeRegister)) {
      return false;
    }
    return true;
  }

  checkLogAndLogout() {
    if (!this.checkLog()) {
      return;
    }
    this.http.get<GetUserResponseData>(this.url + '/users/id', { withCredentials: true }).subscribe({
      next: (response) => {
        this.localStorageService.setMultipleItems(
          { key: localStorageName.id, value: response.user.id || -1 },
          { key: localStorageName.username, value: response.user.username || "" },
          { key: localStorageName.firstName, value: response.user.first_name || "" },
          { key: localStorageName.lastName, value: response.user.last_name || "" },
          { key: localStorageName.age, value: response.user.age || -1 },
          { key: localStorageName.gender, value: response.user.gender || "" },
          { key: localStorageName.sexualPreferences, value: response.user.sexual_preferences || "" },
          { key: localStorageName.biography, value: response.user.biography || "" },
          { key: localStorageName.emailChecked, value: response.user.email_checked || false },
          { key: localStorageName.locationPermission, value: response.user.location_permission || false },
          { key: localStorageName.completeRegister, value: response.user.complete_register || false }
        );
        if (!this.socketService.socketExists()) {
          this.socketService.initSocket();
        }
        this.logEmitChange(true);
      },
      error: (error) => {
        if (error == 'User not found') {
          this._frontLogOut('');
        } else {
          this._frontLogOut('Please try to log in again.');
        }
      }
    });
  }

  register(username: string, first_name: string, last_name: string, age: number, email: string, password: string): any {
    this.http.post<RegisterResponseData>(this.url + '/users/register', { username, first_name, last_name, age, email, password }, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.localStorageService.removeAllUserItem()
          const dialogData = {
            title: 'Check yours emails',
            text: "An email has been sent to you for check your email address",
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { this.router.navigate(['/auth/login']); },
            reload: false
          };
          this.dialogService.openDialog(dialogData);
        },
        error: (error) => {
          const errorToDisplay = this._checkRegexError(error.error)
          const dialogData = {
            title: 'Registration failed',
            text: errorToDisplay,
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(dialogData);
        }
      });
  }

  login(username: string, password: string) {
    this.http.post<LoginResponseData>(this.url + '/users/login', { username, password }, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.localStorageService.removeAllUserItem()
          this.localStorageService.setMultipleItems(
            { key: localStorageName.id, value: response.user.id || -1 },
            { key: localStorageName.username, value: response.user.username || "" },
            { key: localStorageName.firstName, value: response.user.first_name || "" },
            { key: localStorageName.lastName, value: response.user.last_name || "" },
            { key: localStorageName.age, value: response.user.age || -1 },
            { key: localStorageName.emailChecked, value: response.user.email_checked || false },
            { key: localStorageName.completeRegister, value: response.user.complete_register || false },
            { key: localStorageName.sexualPreferences, value: response.user.sexual_preferences || "" },
            { key: localStorageName.biography, value: response.user.biography || "" },
            { key: localStorageName.picture1, value: response.user.picture_1 || "" },
            { key: localStorageName.picture2, value: response.user.picture_2 || "" },
            { key: localStorageName.picture3, value: response.user.picture_3 || "" },
            { key: localStorageName.picture4, value: response.user.picture_4 || "" },
            { key: localStorageName.picture5, value: response.user.picture_5 || "" },
            { key: localStorageName.tags, value: response.user.tags || [] },
            { key: localStorageName.locationPermission, value: response.user.location_permission || false },
            { key: localStorageName.createdAt, value: response.user.created_at || "" },
          );
          if (!this.socketService.socketExists()) {
            this.socketService.initSocket();
          }
          this.socketService.userConnect(response.user.id || -1);
          this.router.navigate(['']);
          location.reload();
          this.logEmitChange(true);
        },
        error: (error) => {
          const errorToDisplay = this._checkRegexError(error.error)
          const dialogData = {
            title: 'Login failed',
            text: errorToDisplay,
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(dialogData);
        }
      });
  }

  logout() {
    this.socketService.disconnect();
    this.http.post(this.url + '/users/logout', {}, { withCredentials: true })
      .subscribe({
        next: (response) => {
        },
        error: (error) => {
        },
        complete: () => {
          this._frontLogOut('');
        }
      });
  }

  completeRegister(gender: string, sexual_preferences: string[], biography: string, files: string[], tags: string[]): any {
    this.http.post<CompleteRegisterResponseData>(this.url + '/users/updateInfos', { gender, sexual_preferences, biography, files, tags }, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.localStorageService.setMultipleItems(
            { key: localStorageName.completeRegister, value: true },
            { key: localStorageName.gender, value: response.user.gender || "" },
            { key: localStorageName.sexualPreferences, value: response.user.sexual_preferences || "" },
            { key: localStorageName.biography, value: response.user.biography || "" },
            { key: localStorageName.picture1, value: response.user.picture_1 || "" },
            { key: localStorageName.picture2, value: response.user.picture_2 || "" },
            { key: localStorageName.picture3, value: response.user.picture_3 || "" },
            { key: localStorageName.picture4, value: response.user.picture_4 || "" },
            { key: localStorageName.picture5, value: response.user.picture_5 || "" },
            { key: localStorageName.tags, value: response.user.tags || [] },
          );
          this.router.navigate(['']);
        },
        error: (error) => {
        }
      });
  }

  emailValidation(token: string): Observable<EmailValidationResponseData> {
    return this.http.post<EmailValidationResponseData>(this.url + '/users/emailvalidation', { token }, { withCredentials: true });
  }

  sendPasswordResetRequest(email: string): Observable<PasswordResetRequestResponseData> {
    return this.http.post<PasswordResetRequestResponseData>(this.url + '/users/resetpasswordrequest', { email }, { withCredentials: true });
  }

  passwordResetValidation(token: string, password: string): Observable<PasswordResetValidationResponseData> {
    return this.http.post<PasswordResetValidationResponseData>(this.url + '/users/resetpasswordvalidation', { token, password }, { withCredentials: true });
  }

  _frontLogOut(error: string) {
    this.logEmitChange(false);
    this.localStorageService.removeAllUserItem();
    this.router.navigate(['auth/login']);
    if (error.length > 0) {
      const dialogData = {
        title: 'Server error',
        text: error,
        text_yes_button: "",
        text_no_button: "Close",
        yes_callback: () => { },
        no_callback: () => { },
        reload: false
      };
      this.dialogService.openDialog(dialogData);
    }
  }

  refreshToken(): Observable<any> {
    return this.http.post(this.url + '/users/refreshToken', {}, { withCredentials: true });
  }

  getLocation() {
    if (this.localStorageService.getItem('location_permission') == true) {
      return;
    }
    else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const latitudeSaved = this.localStorageService.getItem(localStorageName.latitude);
        const longitudeSaved = this.localStorageService.getItem(localStorageName.longitude);
        if (!latitudeSaved || !longitudeSaved || !this._isInsideRadius(latitudeSaved, longitudeSaved, latitude, longitude, 30)) {
          this.updateLocation(latitude, longitude);
        }
      },
        (error) => {
          this.getLocationWithIp();
        });
    } else {
      this.getLocationWithIp();
    }
  }

  getLocationWithIp() {
    const latitudeSaved = this.localStorageService.getItem(localStorageName.latitude);
    const longitudeSaved = this.localStorageService.getItem(localStorageName.longitude);
    this.http.get<IpApiResponseData>('http://ip-api.com/json/?fields=status,message,lat,lon').subscribe(data => {
      const ipApiData: IpApiResponseData = data;
      if ((ipApiData && ipApiData.lat && ipApiData.lon && ipApiData.lat > -90.0
        && ipApiData.lat < 90.0 && ipApiData.lon > -180.0 && ipApiData.lon < 180.0)
        && ((!latitudeSaved || !longitudeSaved) || (latitudeSaved < 0 && longitudeSaved < 0)) ||
        !this._isInsideRadius(latitudeSaved, longitudeSaved, ipApiData.lat, ipApiData.lon, 30)) {
        this.updateLocation(ipApiData.lat, ipApiData.lon);
      }
    });
  }

  updateLocation(latitude: number, longitude: number) {
    if (!this.localStorageService.getItem(localStorageName.username)) {
      return;
    }
    const apiKey = environment.location_iq_key || 'default';
    const url = "https://us1.locationiq.com/v1/reverse?key=" + apiKey + "&lat=" + latitude + "&lon=" + longitude + "&format=json";
    this.http.get<LocationIQApiResponseData>(url).subscribe(data => {
      const locationApiData = data;
      var city = "";
      if (!locationApiData.address || locationApiData.address == undefined) {
        city = "Null Island";
      } else {
        if (locationApiData.address.municipality) {
          city = locationApiData.address.municipality;
        } else if (locationApiData.address.city) {
          city = locationApiData.address.city;
        } else if (locationApiData.address.district) {
          city = locationApiData.address.district;
        } else {
          city = "Null Island";
        }
      }
      this.http.post<UpdateLocationResponseData>(this.url + '/users/updateLocation', { latitude, longitude, city }, { withCredentials: true })
        .subscribe({
          next: (response) => {
            this.localStorageService.setMultipleItems(
              { key: localStorageName.latitude, value: latitude },
              { key: localStorageName.longitude, value: longitude },
              { key: localStorageName.city, value: response.user.city || "" }
            );
          },
          error: (error) => {
          }
        });
    });
  }

  _isInsideRadius(originalLatitude: number, originalLongitude: number, newLatitude: number, newLongitude: number, radiusInKm: number): boolean {
    const earthRadiusInKm = 6371;
    const differenceLatitude = this._toRadians(newLatitude - originalLatitude);
    const differenceLongitude = this._toRadians(newLongitude - originalLongitude);
    const a =
      Math.sin(differenceLatitude / 2) * Math.sin(differenceLatitude / 2) +
      Math.cos(this._toRadians(originalLatitude)) * Math.cos(this._toRadians(newLatitude)) *
      Math.sin(differenceLongitude / 2) * Math.sin(differenceLongitude / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusInKm * c;

    return distance <= radiusInKm;
  }

  _toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  _checkRegexError(error: String) {
    if (error.includes("must match")) {
      const split1 = error.split("/^");
      if (split1 && split1.length > 1) {
        const split2 = split1[1].split("+$/");
        if (split2 && split2.length > 0 && split2[0] && split1[0]) {
          return split1[0] + split2[0];
        }
      }
    }
    return error;
  }
}