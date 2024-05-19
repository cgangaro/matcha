import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, catchError, concatMap, map, of, startWith, throwError } from 'rxjs';
import { UserSettings } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { LocalStorageService, localStorageName } from 'src/app/services/local-storage.service';
import { SettingsService } from 'src/app/services/settings.service';
import { TagsService } from 'src/app/services/tags.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss', '../app.component.scss']
})
export class SettingsComponent implements OnInit {
  updateForm!: FormGroup;
  user: UserSettings | undefined;
  userTags: string[] = [];
  allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  files: string[] = [];
  actualImg: string[] = [];
  sexualPreferences: string[] = [];
  newImg: string[] = [];
  availableTags: string[] = [];
  selectedTags: string[] = [];
  filteredTags: Observable<string[]> | undefined;

  id!: number;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService,
    protected tagsService: TagsService,
    private dialogService: DialogService

  ) {
    if (!this.authService.checkLog()) {
      this.router.navigate(['auth/login']);
      return;
    }
    if (!this.authService.checkCompleteRegister()) {
      this.router.navigate(['auth/completeRegister']);
      return;
    }
    this.id = this.localStorageService.getItem("id");
  }

  ngOnInit(): void {
    this.updateForm = this.fb.group({
      username: ['', [Validators.pattern("^[a-zA-Z0-9]*$")]],
      first_name: ['', [Validators.pattern("^[A-Z][a-zA-Z- ]*$")]],
      last_name: ['', [Validators.pattern("^[A-Z][a-zA-Z- ]*$")]],
      email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      password: ['', Validators.minLength(8)],
      confirm_password: ['', Validators.minLength(8)],
      gender: '',
      biography: '',
      maleSexualPreference: false,
      femaleSexualPreference: false,
      nonBinarySexualPreference: false,
      otherSexualPreference: false,
      sexual_preferences: [[], (control: AbstractControl<Array<string>>) => {
        if (control.value === null) {
          return { empty: true };
        }
        return null;
      }],
      tags: false,
      newTag: ['', [Validators.maxLength(20), Validators.pattern('^#[A-Z][a-zA-Z]+$')]],
      fileStatus: false,
      latitude: null,
      longitude: null,
      location_permission: null,
      city: ''
    });
    this.getUser();
    this.tagsService.getSelectedTags();
    this.tagsService.getTags().subscribe((tags) => {
      this.availableTags = tags;
    });
    this.tagsService.selectedTags$.subscribe((tags) => {
        this.selectedTags = tags;
        this.localStorageService.setItem(localStorageName.tags, tags);
    });
    this.filteredTags = this.updateForm.get('newTag')?.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filterTags(value))
  );
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableTags.filter(tag => tag.toLowerCase().includes(filterValue));
  }

  getUser() {
    this.authService.getUserInfosById(this.id).subscribe((userJson: any) => {
      this.user = userJson.user;
      if (this.user) {
        const sexualPreferences = this.user.sexual_preferences || [];
        const maleSexualPreference = sexualPreferences.includes('Male');
        const femaleSexualPreference = sexualPreferences.includes('Female');
        const nonBinarySexualPreference = sexualPreferences.includes('Non-binary');
        const otherSexualPreference = sexualPreferences.includes('Other');

        this.updateForm.patchValue({
          gender: this.user.gender,
          maleSexualPreference,
          femaleSexualPreference,
          nonBinarySexualPreference,
          otherSexualPreference,
        });
        if (this.user.picture_1) {
          this.actualImg.push("data:image/jpeg;base64," + this.user.picture_1);
        }
        if (this.user.picture_2) {
          this.actualImg.push("data:image/jpeg;base64," + this.user.picture_2);
        }
        if (this.user.picture_3) {
          this.actualImg.push("data:image/jpeg;base64," + this.user.picture_3);
        }
        if (this.user.picture_4) {
          this.actualImg.push("data:image/jpeg;base64," + this.user.picture_4);
        }
        if (this.user.picture_5) {
          this.actualImg.push("data:image/jpeg;base64," + this.user.picture_5);
        }
        this.user.latitude = this.user.latitude;
        this.user.longitude = this.user.longitude;
        this.localStorageService.setItem('location_permission', this.user.location_permission);
      }
    });
  }

  sexualPreferenceChange() {
    this.updateSexualPreferences();
  }

  updateSexualPreferences() {
    const {
      maleSexualPreference,
      femaleSexualPreference,
      nonBinarySexualPreference,
      otherSexualPreference,
    } = this.updateForm.value;

    this.sexualPreferences = [];

    if (maleSexualPreference) {
      this.sexualPreferences.push('Male');
    }
    if (femaleSexualPreference) {
      this.sexualPreferences.push('Female');
    }
    if (nonBinarySexualPreference) {
      this.sexualPreferences.push('Non-binary');
    }
    if (otherSexualPreference) {
      this.sexualPreferences.push('Other');
    }

    if (this.sexualPreferences.length === 0) {
      this.updateForm.get('sexual_preferences')?.setValue(null);
    } else {
      this.updateForm.get('sexual_preferences')?.setValue(this.sexualPreferences);
    }
  }


  tagsChange() {
    this.updateForm.get('tags')?.setValue(this.selectedTags.length > 0);
  }

  addTag(tag: string) {
    this.tagsService.addTag(tag);
    this.tagsChange();
  }
  addCustomTag(event: Event) {
    event.preventDefault();
    const tag = this.updateForm.get('newTag')?.value;
    if (tag === '') {
      this.dialogService.openDialog({
        title: 'Error',
        text: 'Tag cannot be empty',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false,
      });
      return;
    }
    if (!tag.match('^#[A-Z][a-zA-Z]+$')) {
      this.updateForm.get('newTag')?.setValue('');
      this.dialogService.openDialog({
        title: 'Error',
        text: 'Invalid tag, please follow the format: #Tag',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false,
      });
      return;
    }
    if (this.selectedTags.includes(tag)) {
      this.dialogService.openDialog({
        title: 'Error',
        text: 'Tag already exists',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false,
      });
      this.updateForm.get('newTag')?.setValue('');
      return;
    }

    this.tagsService.addTag(tag);
    this.tagsChange();
    this.updateForm.get('newTag')?.setValue('');
  }

  removeTag(tag: string) {
    this.tagsService.removeTag(tag);
    this.tagsChange();
  }

  deleteAccount() {
    this.dialogService.openDialog({
      title: 'Delete account',
      text: 'Are you sure you want to delete your account ?',
      text_yes_button: "Yes",
      text_no_button: "No",
      yes_callback: () => {
        this.settingsService.deleteUser().subscribe({
          next: (response) => {
            if (response.message === "User deleted") {
              this.router.navigate(['auth/login']);
            }
          },
          error: (error) => {
          }
        });
      },
      no_callback: () => { },
      reload: false
    });

  }

  async onChangeFileInput(event: any) {
    const files = event.target.files;
    this.newImg = [];
    this.files = [];
    let validMimeTypes = true;

    if (files.length > 5) {
      const data = {
        title: 'Error',
        text: 'You can only upload a maximum of 5 pictures.',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false,
      };
      this.dialogService.openDialog(data);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mimeType = await this._getMimeTypes(file);
      if (this.allowedTypes.indexOf(mimeType) === -1) {
        validMimeTypes = false;
        break;
      }
    }

    if (!validMimeTypes) {
      const data = {
        title: 'Error',
        text: 'Only PNG and JPEG files are allowed.',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false,
      };
      this.dialogService.openDialog(data);
      if (event.target instanceof HTMLInputElement) {
        const inputElement = event.target;
        inputElement.value = '';
      }
      this.updateForm.get('fileStatus')?.setValue(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = window.URL.createObjectURL(file);
        img.onload = () => {
          const res = (reader.result || '') as string;
          this.files.push(res);
          this.newImg.push(res);

          if (this.files.length === files.length) {
            this.updateForm.get('fileStatus')?.setValue(true);
          }
        }
        img.onerror = () => {
          alert('Invalid image file');
          event.target.value = '';
        };
      };
      reader.readAsDataURL(file);
    }
    this.updateForm.get('fileStatus')?.setValue(true);
  }

  _getMimeTypes(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      let mimeType = '';
      reader.onload = (event) => {
        const result = (event.target?.result as ArrayBuffer) || null;
        if (result) {
          const view = new Uint8Array(result);
          mimeType = this._checkMimeType(view);
          resolve(mimeType);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  _checkMimeType(file: Uint8Array) {
    const bytes = [];
    for (let i = 0; i < file.length; i++) {
      bytes.push(file[i].toString(16));
    }
    const hexString = bytes.join('').toUpperCase().slice(0, 8);
    const mimeTypes: Record<string, string> = {
      '89504E47': 'image/png',
      'FFD8FFDB': 'image/jpeg',
      'FFD8FFE0': 'image/jpeg',
      'FFD8FFE1': 'image/jpeg',
      'FFD8FFE2': 'image/jpeg',
      'FFD8FFE3': 'image/jpeg',
      'FFD8FFE8': 'image/jpeg',
    };
    return mimeTypes[hexString];
  }

  onSubmit(): void {
    const formValues = this.updateForm.value;
    const fieldsToCheck = [
      "username",
      "last_name",
      "first_name",
      "email",
      "password",
      "confirm_password",
      "gender",
      "biography",
      "sexual_preferences",
      "latitude",
      "longitude",
      "location_permission",
      "city"
    ];

    const updatedFields: Partial<UserSettings> = {};

    if (this.sexualPreferences.length === 0) {
      delete formValues.sexual_preferences;
      fieldsToCheck.splice(fieldsToCheck.indexOf("sexual_preferences"), 1);
    }

    fieldsToCheck.forEach((field) => {
      if (formValues[field] !== this.user?.[field as keyof UserSettings] && formValues[field] !== "" && formValues[field] !== null) {
        updatedFields[field as keyof UserSettings] = formValues[field];
      }
    });

    let locationUpdate$: Observable<Partial<UserSettings> | undefined> = of(updatedFields);
    if ((updatedFields.latitude !== undefined && updatedFields.longitude === undefined) || (updatedFields.latitude === undefined && updatedFields.longitude !== undefined)) {
      const dialogData = {
        title: 'Error',
        text: 'Both latitude and longitude must be set in order to update your location.',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false
      };
      this.dialogService.openDialog(dialogData);
      delete updatedFields.latitude;
      delete updatedFields.longitude;
      return;
    } else if (updatedFields.latitude !== undefined && updatedFields.latitude < 0 && updatedFields.latitude > 90) {
      const dialogData = {
        title: 'Error',
        text: 'Latitude must be in range: 0 : 90',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false
      };
      this.dialogService.openDialog(dialogData);
      delete updatedFields.latitude;
      return;
    } else if (updatedFields.longitude !== undefined && updatedFields.longitude < -180 && updatedFields.longitude > 180) {
      const dialogData = {
        title: 'Error',
        text: 'Longitude must be in range: -180 : 180.',
        text_yes_button: 'Ok',
        yes_callback: () => { },
        reload: false
      };
      this.dialogService.openDialog(dialogData);
      delete updatedFields.longitude;
      return;
    }

    if (formValues.latitude && formValues.longitude) {
      locationUpdate$ = this.settingsService.updateUserLocation(formValues.latitude, formValues.longitude).pipe(
        concatMap((response) => {
          if (response) {
            this.updateForm.get('city')?.setValue(response);
            updatedFields.city = response;
            updatedFields.location_permission = true;
            this.localStorageService.setItem('location_permission', true);
            this.updateForm.get('location_permisson')?.setValue(true);
          }
          return of(updatedFields);
        }),
      );
    }

    locationUpdate$.subscribe({
      next: (updatedFieldsAfterLocationUpdate) => {
        if (updatedFieldsAfterLocationUpdate === undefined) {
          return;
        }

        if (this.updateForm.get('tags')?.value) {
          updatedFieldsAfterLocationUpdate.tags = this.selectedTags;
        }

        if (Object.keys(updatedFieldsAfterLocationUpdate).length === 0 && this.files.length === 0) {
          const data = {
            title: 'Error',
            text: 'You must change at least one field.',
            text_yes_button: "Ok",
            yes_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(data);
          return;
        }

        if (updatedFieldsAfterLocationUpdate.password === updatedFieldsAfterLocationUpdate.confirm_password) {
          delete updatedFieldsAfterLocationUpdate.confirm_password;
        } else {
          const data = {
            title: 'Error',
            text: 'Passwords do not match.',
            text_yes_button: "Ok",
            yes_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(data);
          return;
        }
        this.settingsService.updateUser(updatedFieldsAfterLocationUpdate, this.files).subscribe({
          next: (response) => {
            if (response.message === "User updated") {
              const data = {
                title: 'Success',
                text: 'Your profile has been updated successfully.',
                text_yes_button: "Ok",
                yes_callback: () => { },
                reload: true
              };
              this.dialogService.openDialog(data);
            }
          },
          error: (error) => {
          }
        });
      },
      error: (error) => {
        const dialogData = {
          title: 'Error',
          text: error.error || 'An error occured while updating your profile.',
          text_yes_button: "Ok",
          yes_callback: () => { },
          reload: false
        };
        this.dialogService.openDialog(dialogData);
        return;
      }
    });
  }
}