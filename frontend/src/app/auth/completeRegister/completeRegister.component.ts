import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DialogService } from 'src/app/services/dialog.service';
import { TagsService } from 'src/app/services/tags.service';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-completeRegister',
  templateUrl: './completeRegister.component.html',
  styleUrls: ['./completeRegister.component.scss', '../../app.component.scss'],
})
export class CompleteRegisterComponent implements OnInit {
  completeRegisterForm!: FormGroup;
  genders: string[] = ['Male', 'Female', 'Non-binary', 'Other'];
  allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  files: string[] = [];
  tags: FormControl | undefined;
  sexualPreferences: string[] = [];
  availableTags: string[] = [];
  selectedTags: string[] = [];
  filteredTags: Observable<string[]> | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogService: DialogService,
    private tagService: TagsService
  ) {
    this.authService.getLocation();
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableTags.filter(tag => tag.toLowerCase().includes(filterValue));
  }

  async onChangeFileInput(event: any) {
    const files = event.target.files;
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
      this.completeRegisterForm.get('fileStatus')?.setValue(false);
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
        };
        img.onerror = () => {
          alert('Invalid image file');
          event.target.value = '';
        };
      };
      reader.readAsDataURL(file);
    }
    this.completeRegisterForm.get('fileStatus')?.setValue(true);
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

  ngOnInit(): void {
    this.authService.getLocationWithIp();
    this.completeRegisterForm = this.fb.group({
      gender: ['', Validators.required],
      biography: ['', Validators.required],
      maleSexualPreference: false,
      femaleSexualPreference: false,
      nonBinarySexualPreference: false,
      otherSexualPreference: false,
      sexual_preferences: [[], [Validators.required, (control: AbstractControl<Array<string>>) => {
        if (control.value === null) {
          return { empty: true };
        }
        return null;
      }]],
      tags: [false, [Validators.requiredTrue]],
      newTag: ['', [Validators.maxLength(20), Validators.pattern('^#[A-Z][a-zA-Z]+$')]],
      fileStatus: [false, [Validators.requiredTrue]]
    });
    this.tagService.getTags().subscribe((tags) => {
      this.availableTags = tags;
    });
    this.tagService.selectedTags$.subscribe((tags) => {
      this.selectedTags = tags;
    });
    this.filteredTags = this.completeRegisterForm.get('newTag')?.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filterTags(value))
    );
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
    } = this.completeRegisterForm.value;

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
      this.completeRegisterForm.get('sexual_preferences')?.setValue(null);
    } else {
      this.completeRegisterForm.get('sexual_preferences')?.setValue(this.sexualPreferences);
    }
  }

  tagsChange() {
    if (this.selectedTags.length > 0) {
      this.completeRegisterForm.get('tags')?.setValue(true);
    } else {
      this.completeRegisterForm.get('tags')?.setValue(false);
    }
  }

  addCustomTag(event: Event) {
    event.preventDefault();
    const tag = this.completeRegisterForm.get('newTag')?.value;
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
      this.completeRegisterForm.get('newTag')?.setValue('');
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
      this.completeRegisterForm.get('newTag')?.setValue('');
      return;
    }

    this.tagService.addTag(tag);
    this.completeRegisterForm.get('newTag')?.setValue('');
  }
  addTag(tag: string) {
    this.tagService.addTag(tag);
    this.tagsChange();
  }

  removeTag(tag: string) {
    this.tagService.removeTag(tag);
    this.tagsChange();
  }

  onSubmit(): void {
    if (this.completeRegisterForm.valid) {
      const { gender, biography } = this.completeRegisterForm.value;

      this.updateSexualPreferences();
      const genderUp = gender.charAt(0).toUpperCase() + gender.slice(1);
      this.authService.completeRegister(genderUp, this.sexualPreferences, biography, this.files, this.selectedTags);
    }
  }

}