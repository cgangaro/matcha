import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { HttpRequestInterceptor } from './services/http.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomeComponent } from './home/home.component';
import { AuthModule } from './auth/auth.module';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatOptionModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { DialogComponent } from './utils/dialog/dialog.component';
import { DialogService } from 'src/app/services/dialog.service';
import { CarouselComponent } from './utils/carousel/carousel.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';
import { ChatService } from 'src/app/services/chat.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { RelationService } from 'src/app/services/relation.service';
import { SettingsComponent } from './settings/settings.component';
import { MatRadioModule } from '@angular/material/radio';
import { HomeService } from 'src/app/services/home.service';
import { WaitComponent } from './wait/wait.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ResetComponent } from './reset/reset.component';
import { SearchComponent } from './search/search.component';
import { SearchService } from 'src/app/services/search.service';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsService } from 'src/app/services/notifications.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    HomeComponent,
    NavBarComponent,
    DialogComponent,
    CarouselComponent,
    ProfileComponent,
    ChatComponent,
    SettingsComponent,
    WaitComponent,
    ResetComponent,
    SearchComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatCardModule,
    MatTabsModule,
    FormsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatMenuModule,
    MatOptionModule,
    MatSelectModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatAutocompleteModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
      deps: [AuthService]
    },
    AuthService,
    DialogService,
    ChatService,
    SocketioService,
    RelationService,
    HomeService,
    SearchService,
    NotificationsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
