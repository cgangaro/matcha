import { Component, OnInit } from '@angular/core';
import { LocalStorageService, localStorageName } from '../services/local-storage.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RelationService } from 'src/app/services/relation.service';
import { ElementListData, StatusData, GetUserResponseData, User } from 'src/app/models/models';
import { DialogService } from 'src/app/services/dialog.service';
import { SocketioService } from 'src/app/services/socketio.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss', '../app.component.scss']
})
export class ProfileComponent implements OnInit {

  username = "";
  userInfos: any;
  loading = true;
  error = false;
  personalProfil = false;
  img: string[] = [];
  likeWaiting = false;
  likeIcon = "favorite_outlined";
  match = false;
  you_blocked_he = false;
  he_blocked_you = false;
  blockButtonMessage = "Block";
  you_reported_he = false;
  reportButtonMessage = "Report";
  displayList = false;
  displayListTitle = "Views";
  list: ElementListData[] = [];
  fameRating = 0;
  private id: number;
  status = "Offline";
  lastConnection = 1700733380902;

  constructor(
    private localStorageService: LocalStorageService,
    private authService: AuthService,
    private relationService: RelationService,
    private dialogService: DialogService,
    private socketService: SocketioService,
    private router: Router,
    private route: ActivatedRoute,
    private chatService: ChatService,
  ) {
    this.id = this.localStorageService.getItem(localStorageName.id);
    if (!this.authService.checkLog()) {
      this.router.navigate(['auth/login']);
      return;
    }
    if (!this.authService.checkCompleteRegister()) {
      this.router.navigate(['auth/completeRegister']);
      return;
    }
    this.loading = true;
    this.error = false;
    this.route.params.subscribe(params => {
      this.username = params['username'];
      if (this.username == "") {
        this.error = true;
      }
      this.authService.getUserInfos(this.username).subscribe(
        (response) => {
          this.userInfos = response;
          if (!this.userInfos.complete_register) {
            this.error = true;
            return;
          }
          if (this.username == this.localStorageService.getItem(localStorageName.username)) {
            this.personalProfil = true;
          }
          const user: User = this.userInfos
          this.subscribeToStatusUpdates();
          this.chatService.getStatus(user).subscribe({
            next: (statusData: StatusData) => {
              if (this.userInfos.id === statusData.userId) {
                this.status = statusData.status;
                this.lastConnection = statusData.lastConnection;
              }
            },
            error: (err: any) => {
            }
          });
          this.you_blocked_he = this.userInfos.you_blocked_he;
          this.he_blocked_you = this.userInfos.he_blocked_you;
          if (this.you_blocked_he) {
            this.blockButtonMessage = "Unblock";
          }
          this.you_reported_he = this.userInfos.you_reported_he;
          if (this.you_reported_he) {
            this.reportButtonMessage = "Unreport";
          }
          this.fameRating = this.userInfos.fame_rating;
          this.relationService.getCheckLike(this.id, this.userInfos.id).subscribe(
            (response) => {
              if (response != null) {
                if (response.exist) {
                  this.likeIcon = "favorite";
                } else {
                  this.likeIcon = "favorite_outlined";
                }
              }
              this.loading = false;
            },
            (error) => {
              this.loading = false;
              this.error = true;
            }
          );
          this.relationService.getCheckMatch(this.id, this.userInfos.id).subscribe(
            (response) => {
              if (response != null) {
                if (response.exist) {
                  this.match = true;
                } else {
                  this.match = false;
                }
              }
            },
            (error) => {
              this.loading = false;
              this.error = true;
            }
          );
          if (!this.personalProfil && !this.he_blocked_you && !this.you_blocked_he) {
            this.relationService.createView(this.id, this.userInfos.id).subscribe(
              (response) => {
                if (response.message == "View created") {
                  this.socketService.emitView(this.id, this.userInfos.id);
                  this.fameRating++;
                }
              },
              (error) => {
              })
          }
          this.img.splice(0, this.img.length)
          if (this.userInfos.picture_1) {
            this.img.push("data:image/jpeg;base64," + this.userInfos.picture_1);
          }
          if (this.userInfos.picture_2) {
            this.img.push("data:image/jpeg;base64," + this.userInfos.picture_2);
          }
          if (this.userInfos.picture_3) {
            this.img.push("data:image/jpeg;base64," + this.userInfos.picture_3);
          }
          if (this.userInfos.picture_4) {
            this.img.push("data:image/jpeg;base64," + this.userInfos.picture_4);
          }
          if (this.userInfos.picture_5) {
            this.img.push("data:image/jpeg;base64," + this.userInfos.picture_5);
          }
        },
        (error) => {
          this.loading = false;
          this.error = true;
        }
      );
    });
  }

  ngOnInit(): void {
    if (this.authService.checkLog() && !this.authService.checkCompleteRegister()) {
      this.router.navigate(['auth/completeRegister']);
    }
    this.chatService.initSocket();
    this.subscribeToBlockEvents();
    this.subscribeToUnblockEvents();
  }

  subscribeToBlockEvents() {
    this.socketService.handleBlock().subscribe({
      next: (response) =>{
      }
    })
  }

  subscribeToUnblockEvents() {
    this.socketService.handleUnblock().subscribe({
      next: (response) => {
      }
    })
  }

  like() {
    this.likeWaiting = true;
    if (this.likeIcon == "favorite") {
      this.relationService.deleteLike(this.id, this.userInfos.id).subscribe(
        (response) => {
          if (response.message == "Like deleted") {
            this.socketService.emitUnlike(this.id, this.userInfos.id);
          }
          this.likeIcon = "favorite_outlined";
          this.match = false;
          this.likeWaiting = false;
          this.fameRating = this.fameRating - 10;
        },
        (error) => {
          this.likeWaiting = false;
        }
      )
    }
    else {
      this.relationService.createLike(this.id, this.userInfos.id).subscribe(
        (response) => {
          if (response.message == "Like created") {
            this.socketService.emitLike(this.id, this.userInfos.id);
          }
          this.likeIcon = "favorite";
          this.likeWaiting = false;
          this.fameRating = this.fameRating + 10;
          this.relationService.getCheckMatch(this.id, this.userInfos.id).subscribe(
            (response) => {
              if (response != null) {
                if (response.exist) {
                  this.socketService.emitMatch(this.id, this.userInfos.id);
                  this.socketService.emitMatch(this.userInfos.id, this.id);
                  this.match = true;
                } else {
                  this.match = false;
                }
              }
            },
            (error) => {
              this.loading = false;
              this.error = true;
            }
          )
        },
        (error) => {
          this.likeWaiting = false;
        }
      )
    };
  }

  blockCallback() {
    this.relationService.createBlock(
      this.localStorageService.getItem(localStorageName.id),
      this.userInfos.id
    ).subscribe({
      next: (response) => {
        (response);

        const blockId = response.blockId;

        this.authService.getUserInfosById(response.data.recipient_id).subscribe({
          next: (userResponse) => {
            let user = userResponse.user;

            this.socketService.blockUser(blockId, user.id);
            this.you_blocked_he = true;
            this.blockButtonMessage = 'Unblock';
          },
          error: (userError) => {
          }
        });
      },
      error: (blockError) => {
      }
    });
  }

  unblockCallback(): void {
    this.relationService.deleteBlock(
      this.localStorageService.getItem(localStorageName.id),
      this.userInfos.id
    ).subscribe({
      next: (response) => {
        const blockId = response.blockId;

        this.authService.getUserInfosById(response.data.recipient_id).subscribe({
          next: (userResponse) => {
            let user = userResponse.user;

            this.socketService.unblockUser(blockId, user.id);
            this.you_blocked_he = false;
            this.blockButtonMessage = 'Block';

          },
          error: (userError) => {
          }
        });
      },
      error: (blockError) => {
      }
    });
  }

  block() {
    if (this.you_blocked_he) {
      const dialogData = {
        title: 'Unblock',
        text: "Are you sure to unblock this user ?",
        text_yes_button: "Yes",
        text_no_button: "No",
        yes_callback: () => this.unblockCallback(),
        no_callback: function () { },
        reload: false
      };
      this.dialogService.openDialog(dialogData);
    }
    else {
      const dialogData = {
        title: 'Block',
        text: "Are you sure to block this user ?",
        text_yes_button: "Yes",
        text_no_button: "No",
        yes_callback: () => this.blockCallback(),
        no_callback: function () { },
        reload: false
      };
      this.dialogService.openDialog(dialogData);
    }

  }

  reportCallback() {
    this.relationService.createReport(this.localStorageService.getItem(localStorageName.id), this.userInfos.id).subscribe(
      (response) => {
      },
      (error) => {
      }
    )
  }

  unreportCallback(): void {
    this.relationService.deleteReport(this.localStorageService.getItem(localStorageName.id), this.userInfos.id).subscribe(
      (response) => {
      },
      (error) => {
      }
    )
  }

  report() {
    if (this.you_reported_he) {
      const dialogData = {
        title: 'Unreport',
        text: "Are you sure to unreport this user ?",
        text_yes_button: "Yes",
        text_no_button: "No",
        yes_callback: () => this.unreportCallback(),
        no_callback: function () { },
        reload: true
      };
      this.dialogService.openDialog(dialogData);
    }
    else {
      const dialogData = {
        title: 'Report',
        text: "Are you sure to report this user ?",
        text_yes_button: "Yes",
        text_no_button: "No",
        yes_callback: () => this.reportCallback(),
        no_callback: function () { },
        reload: true
      };
      this.dialogService.openDialog(dialogData);
    }

  }

  openList(list: number) {
    this.displayList = true;
    this.list = [];
    if (list == 1) {
      this.displayListTitle = "Views";
      this.relationService.getAllProfileViews(this.localStorageService.getItem(localStorageName.id)).subscribe(
        (response) => {
          this.list = response.data;
        },
        (error) => {
        }
      )
    } else if (list == 2) {
      this.displayListTitle = "Likes";
      this.relationService.getAllProfileLikes(this.localStorageService.getItem(localStorageName.id)).subscribe(
        (response) => {
          this.list = response.data;
        },
        (error) => {
        }
      )
    }
  }

  backArrow() {
    this.displayList = false;
  }

  subscribeToStatusUpdates() {
    this.chatService.getAllUserStatusEvents().subscribe((statusData: StatusData) => {
      if (this.userInfos.id === statusData.userId) {
        this.status = statusData.status;
        this.lastConnection = statusData.lastConnection;
      }
    });
  }

}
