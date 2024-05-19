import { Component, OnInit } from '@angular/core';
import { LocalStorageService, localStorageName } from '../services/local-storage.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { HomeUserData, UserSimplified, filterSelectType, sortSelectType } from 'src/app/models/models';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../app.component.scss']
})
export class HomeComponent implements OnInit {

  username = "";
  interestingUsers: UserSimplified[] = [];
  userDisplayed!: HomeUserData;
  img: string[] = [];
  userIndex = 0;

  sortSelected = "";
  sortType: String[] = [
    sortSelectType.Age,
    sortSelectType.Location,
    sortSelectType.Tags,
    sortSelectType.FameRating
  ];

  filterSelected = "";
  filterType: String[] = [
    filterSelectType.Age,
    filterSelectType.Location,
    filterSelectType.Tags,
    sortSelectType.FameRating
  ];

  loading = true;
  error = false;
  notConnected = true;

  personalFameRating = 0;

  constructor(
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private homeService: HomeService,
    private dialogService: DialogService,
    private router: Router,
  ) {
    if (!this.authService.checkLog()) {
      this.notConnected = true;
      return;
    }
    this.notConnected = false;
    if (!this.authService.checkCompleteRegister()) {
      this.router.navigate(['auth/completeRegister']);
      return;
    }
    this.authService.getLocation();
    this.username = this.localStorageService.getItem(localStorageName.username);
    this.authService.isLoggedEmitter.subscribe(value => {
      this.username = this.localStorageService.getItem(localStorageName.username);
    });
    this.loading = true;
    this.error = false;
    this.homeService.getInterestingUsers().subscribe(
      (response) => {
        this.interestingUsers = response.users;
        if (this.interestingUsers.length <= 0) {
          this.error = true;
        } else {
          this.homeService.getPersonnalFameRating().subscribe(
            (response) => {
              this.personalFameRating = response.fame_rating;
            },
            (error) => {
              // const dialogData = {
              //   title: 'Error',
              //   text: error.error,
              //   text_yes_button: "",
              //   text_no_button: "Close",
              //   yes_callback: () => { },
              //   no_callback: () => { },
              //   reload: false
              // };
              // this.dialogService.openDialog(dialogData);
              this.error = true;
            }
          );
          this.newUserGenerate();
        }
      },
      (error) => {
        // const dialogData = {
        //   title: 'Error',
        //   text: error.error,
        //   text_yes_button: "",
        //   text_no_button: "Close",
        //   yes_callback: () => { },
        //   no_callback: () => { },
        //   reload: false
        // };
        // this.dialogService.openDialog(dialogData);
        this.error = true;
      }
    );
  }

  newUserGenerate() {
    this.loading = true;
    this.img.splice(0, this.img.length);
    this.authService.getUserInfosById(this.interestingUsers[this.userIndex].id).subscribe(
      (response) => {
        this.userDisplayed = response.user;
        if (this.userDisplayed.picture_1) {
          this.img.push("data:image/jpeg;base64," + this.userDisplayed.picture_1);
        }
        if (this.userDisplayed.picture_2) {
          this.img.push("data:image/jpeg;base64," + this.userDisplayed.picture_2);
        }
        if (this.userDisplayed.picture_3) {
          this.img.push("data:image/jpeg;base64," + this.userDisplayed.picture_3);
        }
        if (this.userDisplayed.picture_4) {
          this.img.push("data:image/jpeg;base64," + this.userDisplayed.picture_4);
        }
        if (this.userDisplayed.picture_5) {
          this.img.push("data:image/jpeg;base64," + this.userDisplayed.picture_5);
        }
        this.loading = false;
        if (this.userIndex + 1 >= this.interestingUsers.length)
          this.userIndex = 0;
        else
          this.userIndex++;
      },
      (error) => {
        this.loading = false;
        this.error = true;
        if (this.userIndex + 1 >= this.interestingUsers.length)
          this.userIndex = 0;
        else
          this.userIndex++;
      }
    );
  }

  sortOrFilterChange() {
    this.filterSelectChange();
    this.sortSelectChange();
    this.userIndex = 0;
    this.newUserGenerate();
  }

  sortSelectChange() {
    if (this.sortSelected == sortSelectType.Age) {
      this.interestingUsers = this.interestingUsers.sort((a, b) => a.age - b.age);

    } else if (this.sortSelected == sortSelectType.Location) {
      const userLatitude = this.localStorageService.getItem(localStorageName.latitude);
      const userLongitude = this.localStorageService.getItem(localStorageName.longitude);
      this.interestingUsers = this.interestingUsers.sort((a, b) =>
        this.homeService.positionToDistance(userLatitude, userLongitude, a.latitude, a.longitude) -
        this.homeService.positionToDistance(userLatitude, userLongitude, b.latitude, b.longitude));
    } else if (this.sortSelected == sortSelectType.Tags) {
      const tags = this.localStorageService.getItem(localStorageName.tags);
      this.interestingUsers = this.interestingUsers.sort((a, b) => {
        return this.homeService.nbCommonTags(tags, b.tags) -
          this.homeService.nbCommonTags(tags, a.tags);
      });
    } else if (this.sortSelected == sortSelectType.FameRating) {
      this.interestingUsers = this.interestingUsers.sort((a, b) => {
        return a.fame_rating - b.fame_rating;
      });
    }
  }

  filterSelectChange() {
    if (this.filterSelected == filterSelectType.Age) {
      const userAge = this.localStorageService.getItem(localStorageName.age);
      this.interestingUsers = this.interestingUsers.filter(it => it.age < userAge + 5 && it.age > userAge - 5);
    } else if (this.filterSelected == filterSelectType.Location) {
      const userLatitude = this.localStorageService.getItem(localStorageName.latitude);
      const userLongitude = this.localStorageService.getItem(localStorageName.longitude);
      this.interestingUsers = this.interestingUsers.filter(it => this.homeService.positionToDistance(userLatitude, userLongitude, it.latitude, it.longitude) < 30.0);
    } else if (this.filterSelected == filterSelectType.Tags) {
      const tags = this.localStorageService.getItem(localStorageName.tags);
      this.interestingUsers = this.interestingUsers.filter(it => this.homeService.nbCommonTags(tags, it.tags) >= 3);
    } else if (this.filterSelected == filterSelectType.FameRating) {
      const tags = this.localStorageService.getItem(localStorageName.tags);
      this.interestingUsers = this.interestingUsers.filter(it => {
        return this.personalFameRating + 30 > it.fame_rating && this.personalFameRating - 30 < this.personalFameRating
      });
    }
  }

  ngOnInit(): void {

  }
}
