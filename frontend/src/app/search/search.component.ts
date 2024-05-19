import { Component, OnInit } from '@angular/core';
import { LocalStorageService, localStorageName } from '../services/local-storage.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { UserSimplified, ageGapType, fameRatingGapType, filterSelectType, sortSelectType } from 'src/app/models/models';
import { SearchService } from 'src/app/services/search.service';
import { FormControl } from '@angular/forms';
import { TagsService } from '../services/tags.service';

@Component({
selector: 'app-home',
templateUrl: './search.component.html',
styleUrls: ['./search.component.scss', '../app.component.scss']
})
export class SearchComponent implements OnInit {

loading = false;
error = false;
success = false;
textError = "Error";

resultList: UserSimplified[] = []
resultListOrigin: UserSimplified[] = []

ageGapFormControl = new FormControl('');
ageGapValue: String[] = [
  ageGapType._18_25,
  ageGapType._26_35,
  ageGapType._36_50,
  ageGapType._51
];

fameRatingGapFormControl = new FormControl('');
fameRatingGapValue: String[] = [
  fameRatingGapType._30,
  fameRatingGapType._31_60,
  fameRatingGapType._61_100,
  fameRatingGapType._101_150,
  fameRatingGapType._151_250,
  fameRatingGapType._251
];

locationFormControl = new FormControl('');
locationValue: String[] = [];

tagFormControl = new FormControl('');
availableTagsValue: string[] = [];

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

personalFameRating = 0;

constructor(
  private authService: AuthService,
  private searchService: SearchService,
  private router: Router,
  private localStorageService: LocalStorageService,
  private homeService: HomeService,
  private tagService: TagsService
) {
  if (!this.authService.checkLog()) {
    this.router.navigate(['auth/login']);
    return;
  }
  if (!this.authService.checkCompleteRegister()) {
    this.router.navigate(['auth/completeRegister']);
    return;
  }
  this.searchService.getCities().subscribe(
    (response) => {
      const cities = response.cities;
      cities.forEach(city => this.locationValue.push(city));
    },
    (error) => {
    }
  );
  this.homeService.getPersonnalFameRating().subscribe(
    (response) => {
      this.personalFameRating = response.fame_rating;
    },
    (error) => {
      this.error = true;
    }
  );
  this.tagService.getTagsSearch().subscribe((tags) => {
    this.availableTagsValue = tags;
  });
}

ngOnInit(): void {
}

ageChange() {

}

fameRatingChange() {

}

locationChange() {

}

tagChange() {

}

search() {
  this.success = false;
  this.error = false;
  this.textError = "Error";
  this.loading = true;
  this.resultList = [];
  this.sortSelected = "";
  this.filterSelected = "";
  const age = (this.ageGapFormControl.value && this.ageGapFormControl.value.length > 0) ? this.ageGapFormControl.value : "none";
  const fameRating = (this.fameRatingGapFormControl.value && this.fameRatingGapFormControl.value.length > 0) ? this.fameRatingGapFormControl.value : "none";
  const location = (this.locationFormControl.value && this.locationFormControl.value.length > 0) ? this.locationFormControl.value : "none";
  const tags = (this.tagFormControl.value && this.tagFormControl.value.length > 0) ? this.tagFormControl.value : "none";
  this.searchService.getSearchResult(age, fameRating, location, tags).subscribe(
    (response) => {
      this.loading = false;
      if (response.users.length <= 0) {
        this.textError = "No users found";
        this.error = true;
      } else {
        this.success = true;
        this.resultListOrigin = response.users;
        this.resultList = this.resultListOrigin;
      }
    },
    (error) => {
      this.error = true;
    }
  );
}

goToProfile(user: UserSimplified) {
  this.router.navigate(['/profile/' + user.username]);
}

sortOrFilterChange() {
  this.resultList = this.resultListOrigin;
  this.filterSelectChange();
  this.sortSelectChange();
}

sortSelectChange() {
  if (this.sortSelected == sortSelectType.Age) {
    this.resultList = this.resultList.sort((a, b) => a.age - b.age);

  } else if (this.sortSelected == sortSelectType.Location) {
    const userLatitude = this.localStorageService.getItem(localStorageName.latitude);
    const userLongitude = this.localStorageService.getItem(localStorageName.longitude);
    this.resultList = this.resultList.sort((a, b) =>
      this.homeService.positionToDistance(userLatitude, userLongitude, a.latitude, a.longitude) -
      this.homeService.positionToDistance(userLatitude, userLongitude, b.latitude, b.longitude));
  } else if (this.sortSelected == sortSelectType.Tags) {
    const tags = this.localStorageService.getItem(localStorageName.tags);
    this.resultList = this.resultList.sort((a, b) => {
      return this.homeService.nbCommonTags(tags, b.tags) -
        this.homeService.nbCommonTags(tags, a.tags);
    });
  } else if (this.sortSelected == sortSelectType.FameRating) {
    this.resultList = this.resultList.sort((a, b) => {
      return a.fame_rating - b.fame_rating;
    });
  }
}

filterSelectChange() {
  if (this.filterSelected == filterSelectType.Age) {
    const userAge = this.localStorageService.getItem(localStorageName.age);
    this.resultList = this.resultList.filter(it => it.age < userAge + 5 && it.age > userAge - 5);
  } else if (this.filterSelected == filterSelectType.Location) {
    const userLatitude = this.localStorageService.getItem(localStorageName.latitude);
    const userLongitude = this.localStorageService.getItem(localStorageName.longitude);
    this.resultList = this.resultList.filter(it => this.homeService.positionToDistance(userLatitude, userLongitude, it.latitude, it.longitude) < 30.0);
  } else if (this.filterSelected == filterSelectType.Tags) {
    const tags = this.localStorageService.getItem(localStorageName.tags);
    this.resultList = this.resultList.filter(it => this.homeService.nbCommonTags(tags, it.tags) >= 3);
  } else if (this.filterSelected == filterSelectType.FameRating) {
    this.resultList = this.resultList.filter(it => {
      return this.personalFameRating + 30 > it.fame_rating && this.personalFameRating - 30 < this.personalFameRating
    });
  }
}

}
