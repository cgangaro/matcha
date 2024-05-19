import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() {
    if (typeof localStorage === 'undefined') {
      console.log('LocalStorage is not supported in this browser.');
      return;
    }
  }

  setMultipleItems(...items: { key: string; value: any }[]): void {
    items.forEach(({ key, value }) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.log(`Error setting key "${key}" in localStorage :`, error);
      }
    });
  }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): any {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  }

  removeAllUserItem() {
    const localStorageKeys = Object.values(localStorageName);
    localStorageKeys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

export const localStorageName = {
  id: "id",
  username: "username",
  firstName: "first_name",
  lastName: "last_name",
  age: "age",
  emailChecked: "email_checked",
  completeRegister: "complete_register",
  gender: "gender",
  sexualPreferences: "sexual_preferences",
  biography: "biography",
  picture1: "picture_1",
  picture2: "picture_2",
  picture3: "picture_3",
  picture4: "picture_4",
  picture5: "picture_5",
  locationPermission: "location_permission",
  createdAt: "created_at",
  tags: "tags",
  latitude: "latitude",
  longitude: "longitude",
  city: "city"
}
