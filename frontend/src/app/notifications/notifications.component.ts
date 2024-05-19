import { Component, Input, OnInit } from '@angular/core';
import { Notification } from '../models/models';
import { NotificationsService } from 'src/app/services/notifications.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { AuthService } from 'src/app/services/auth.service';
import { of, switchMap } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss', '../app.component.scss']
})
export class NotificationsComponent implements OnInit {
  @Input()
  public notifications: Array<Notification> = [];
  public displayNotifications: boolean = false;

  constructor(
    private notificationsService: NotificationsService,
    private socketioService: SocketioService,
    private authService: AuthService,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.notificationsService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });

    this.displayNotifications = this.notificationsService.displayNotifications$.getValue();

    this.notificationsService.displayNotifications$.subscribe((display) => {
      this.displayNotifications = display;
    });
    this.subscribeToNotifications();
  }

  public subscribeToNotifications() {
    this.socketioService.getNotifications().subscribe({
      next: (response) => {
        if (response.author_id) {
          this.authService.getUserInfosById(response.author_id).pipe(
            switchMap((userResponse) => {
              const notification: Notification = {
                author_id: response.author_id,
                type: response.type,
                strong: userResponse.user.username,
                message: response.message,
              };
              return of(notification);
            })
          ).subscribe({
            next: (notification) => {
              this.notificationsService.addNotification(notification);
            },
            error: (error) => {
              const dialogData = {
                title: 'Error',
                text: error.error,
                text_yes_button: "",
                text_no_button: "Close",
                yes_callback: () => { },
                no_callback: () => { },
              };
              this.dialogService.openDialog(dialogData);
            }
          });
        }
      }
    });
  }

  public closeNotification(notification: Notification) {
    this.notificationsService.removeNotification(notification);
  }
}
