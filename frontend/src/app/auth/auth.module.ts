import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CompleteRegisterComponent } from './completeRegister/completeRegister.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [RegisterComponent, LoginComponent, CompleteRegisterComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatRadioModule,
    MatCheckboxModule,
    HttpClientModule,
    MatAutocompleteModule,
    RouterModule.forChild([
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'completeRegister', component: CompleteRegisterComponent }
    ])
  ],
  providers: [],
})
export class AuthModule { }
