import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-profile',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss', '../app.component.scss']
})
export class ResetComponent implements OnInit {

  resetForm!: FormGroup;

  sent = false;
  title = "Reset password request";
  textButton = "Send";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    if (this.authService.checkLog()) {
      if (this.authService.checkCompleteRegister()) {
        this.router.navigate(['']);
      } else {
        this.router.navigate(['auth/completeRegister']);
      }
    }
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      const { email } = this.resetForm.value;
      this.authService.sendPasswordResetRequest(email).subscribe({
        next: (response) => {
          this.sent = true;
          this.title = "Reset password request sent";
          this.textButton = "Log in";
        },
        error: (error) => {
          const dialogData = {
            title: 'Error',
            text: error.error,
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
  }
}
