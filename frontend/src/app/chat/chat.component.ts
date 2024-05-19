import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';
import { User, Message, StatusData } from 'src/app/models/models';
import { DialogService } from 'src/app/services/dialog.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Subscription } from 'rxjs';
import { Notification } from 'src/app/models/models';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  message!: string;
  users: User[] = [];
  selectedConversation: User | null = null;
  selectedConversationMessages: Message[] = [];
  private notificationSubscription: Subscription | null = null;
  showMatches: boolean = true;

  @ViewChild(MatMenuTrigger) private menuTrigger!: MatMenuTrigger;
  @ViewChild('chatMessagesContainer') private myScrollContainer!: ElementRef;
  @ViewChild('inputContainer') private inputContainer!: ElementRef;
  @ViewChild('input') private input!: ElementRef;

  constructor(
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private router: Router,
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
  }

  ngOnInit() {
    this.chatService.initSocket();
    this.getMatches();
    this.subscribeToStatusUpdates();
    this.subscribeToMessages();
    this.subscribeToBlockEvents();
    this.subscribeToUnblockEvents();
    this.notificationSubscription = this.notificationsService.subscribeToNotifications().subscribe((notifications) => {
      this.handleNotifications(notifications);
    });
    if (window.innerWidth < 786) {
      this.showMatches = false;
    }
  }

  ngOnDestroy() {
    this.selectedConversation = null;
  }

  handleNotifications(notifications: Notification[]) {
    notifications.forEach((notification) => {
      if (this.selectedConversation && this.selectedConversation.id) {
        if (notification.author_id === this.selectedConversation.id && notification.type === 'message') {
          this.notificationsService.removeNotification(notification);
        }
      }
    });
  }

  subscribeToStatusUpdates() {
    this.chatService.getAllUserStatusEvents().subscribe((statusData: StatusData) => {
      this.handleStatusUpdate(statusData);
    });
  }

  handleStatusUpdate(statusData: StatusData) {
    if (this.selectedConversation?.id === statusData.userId) {
      this.selectedConversation.status = statusData.status;
    }
  }

  subscribeToMessages() {
    this.chatService.getMessages().subscribe((message: unknown) => {
      this.handleReceivedMessage(message);
    });
  }

  handleReceivedMessage(message: unknown) {
    this.selectedConversationMessages.push(message as Message);
    this.scrollToBottom();
  }

  subscribeToBlockEvents() {
    this.chatService.handleBlock().subscribe((users) => {
      if (this.selectedConversation && this.selectedConversation.id === users.author_id) {
        this.handleBlock();
      }
    });
  }

  subscribeToUnblockEvents() {
    this.chatService.handleUnblock().subscribe((users) => {
      if (this.selectedConversation && this.selectedConversation.id === users.author_id) {
        this.handleUnblock();
      }
    });
  }

  handleBlock() {
    if (this.selectedConversation)
      this.chatService.getCheckBlock(this.selectedConversation).subscribe({
        next: (response) => {
          if (response.exist)
            this.updateInputState(true);
            this.updateBlockStatus(true);
        }
    })
  }

  handleUnblock() {
    if (this.selectedConversation)
      this.chatService.getCheckBlock(this.selectedConversation).subscribe({
        next: (response) => {
          if (!response.exist)
            this.updateInputState(false);
            this.updateBlockStatus(false);
        }
    })
  }

  updateBlockStatus(isBlocked: boolean) {
    if (this.selectedConversation) {
      this.selectedConversation.block = {
        id: isBlocked ? this.selectedConversation.block.id : -1,
        author_id: isBlocked ? this.selectedConversation.id : -1,
        blocked_user_id: isBlocked ? this.selectedConversation.block.blocked_user_id : -1,
        isBlocked: isBlocked
      };
    }
  }

  updateInputState(isBlocked: boolean) {
    if (this.input) {
      if (this.input.nativeElement.value && isBlocked)
        this.input.nativeElement.value = '';
      this.input.nativeElement.disabled = isBlocked;
      this.input.nativeElement.placeholder = isBlocked
        ? "The relationship is blocked with this user"
        : "Type a message...";
    }
  }

  scrollToBottom(): void {
    this.changeDetectorRef.detectChanges();
    const container = this.myScrollContainer?.nativeElement as HTMLElement;
    const lastMessage = container?.lastElementChild as HTMLElement;
    const inputContainer = this.inputContainer?.nativeElement as HTMLElement;

    if (lastMessage && container && inputContainer) {
      const scrollPosition = lastMessage.offsetTop - container.clientHeight + lastMessage.clientHeight + inputContainer.clientHeight;
      container.scrollTop = scrollPosition;
    }
  }

  getMatches() {
    this.chatService.getMatches().subscribe(users => {
      this.users = users.map(user => ({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        picture_1: user.picture_1,
        status: user.status,
        block: user.block
      }));
      this.users.forEach(user => {
        this.notificationSubscription = this.notificationsService.getNotificationCountByAuthorId(user.id).subscribe({
          next: (count: number) => {
            user.notificationCount = count;
          },
          error: (err: any) => {
          }
        });
      });
    });
  }

  sendMessage(recipient_id: number | null) {
    if (!this.message || !recipient_id || recipient_id == null || !this.selectedConversation || !this.selectedConversation.id) {
      return;
    }
    this.chatService.sendMessage(this.message, recipient_id).subscribe({
      next: (res: any) => {
        this.selectedConversationMessages.push({
          id: res.id,
          author_id: res.author_id,
          recipient_id: res.recipient_id,
          message: res.data.message,
          date: new Date(res.data.date)
        });
        this.scrollToBottom();
      },
      error: (err: any) => {
        if (err.error === "Match doesn't exist") {
          this.users = this.users.filter(user => user.id !== recipient_id);
          const dialogData = {
            title: 'Match deleted',
            text: 'This match has been deleted. The other user might have unliked you.',
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(dialogData);
          this.selectedConversation = null;
        }
      }
    });
    this.message = '';
  }

  selectUser(user: User) {
    this.chatService.getCheckBlock(user).subscribe({
      next: (res: any) => {
        if (res && res.exist) {
          user.block = {
            id: res.data[0].id,
            author_id: res.data[0].author_id,
            blocked_user_id: res.data[0].recipient_id,
            isBlocked: true
          }
          this.updateInputState(true);
          const data = {
            title: 'User blocked',
            text: user.block.author_id === user.id ? 'You have been blocked.' : "You have blocked this user.",
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(data);
        }
      },
      error: (err: any) => {
      }
    });
    this.selectedConversationMessages = [];
    this.selectedConversation = user;
    this.notificationsService.notifications$.subscribe((notifications: Notification[]) => {
      this.handleNotifications(notifications);
    });
    this.chatService.isUserBlocked(user).subscribe({
      next: (res: any) => {
        if (res && res.exist) {
          this.selectedConversation!.block = {
            id: res.data[0].id,
            author_id: res.data[0].author_id,
            blocked_user_id: res.data[0].recipient_id,
            isBlocked: true
          }
          this.updateInputState(true);
        }
      },
      error: (err: any) => {
      }
    });
    this.chatService.getStatus(user).subscribe({
      next: (statusData: StatusData) => {
        user.status = statusData.status;
        this.handleStatusUpdate(statusData);
      },
      error: (err: any) => {
      }
    });
    this.chatService.getMessagesFromUser(user).subscribe({
      next: (messages: Message[]) => {
        if (messages) {
          messages.forEach((message) => {
            message.date = new Date(message.date);
          });
          messages.sort((message1, message2) => {
            const date1 = new Date(message1.date).getTime();
            const date2 = new Date(message2.date).getTime();
            return date1 - date2;
          });
          this.selectedConversationMessages = messages;
          this.scrollToBottom();
        }
      },
      error: (err: any) => {
        if (err.status === 404) {
          this.selectedConversationMessages = [];
          this.message = '';
        } else {
        }
      }
    });
  }

  viewProfile(user: User) {
    this.router.navigate(['/profile/' + user.username]);
  }

  blockUser(user: User) {
    this.chatService.blockUser(user).subscribe({
      next: (res: any) => {
        if (res && res.message == "Block created") {
          if (this.selectedConversation) {
            this.chatService.emitBlock(res.blockId, this.selectedConversation);
          }
          this.selectedConversation!.block = {
            id: res.blockId,
            author_id: res.data.author_id,
            blocked_user_id: res.data.recipient_id,
            isBlocked: true
          }
          this.updateInputState(true);
        }
      },
      error: (err: any) => {
      }
    });
  }

  unblockUser(user: User) {
    this.chatService.unblockUser(user).subscribe({
      next: (res: any) => {
        if (res && res.message == "Block deleted") {
          if (this.selectedConversation) {
            this.chatService.emitUnblock(res.blockId, this.selectedConversation);
          }
          if (this.selectedConversation) {
            this.selectedConversation.block = {
              id: -1,
              author_id: -1,
              blocked_user_id: -1,
              isBlocked: false
            };
          }
          this.updateInputState(false);
        }
      },
      error: (err: any) => {
      }
    });
  }

  reportUser(user: User) {
    this.chatService.reportUser(user).subscribe({
      next: (res: any) => {
        if (res && res.message == "Report created") {
          const dialogData = {
            title: 'User reported',
            text: 'The user has been reported.',
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(dialogData);
          this.menuTrigger.closeMenu();
        }
      },
      error: (err: any) => {
        if (err.error === "Report already exists") {
          const dialogData = {
            title: 'User already reported',
            text: 'You have already reported this user.',
            text_yes_button: "",
            text_no_button: "Close",
            yes_callback: () => { },
            no_callback: () => { },
            reload: false
          };
          this.dialogService.openDialog(dialogData);
          this.menuTrigger.closeMenu();
        }
      }
    });
  }
}
