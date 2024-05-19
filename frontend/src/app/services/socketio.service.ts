import { Socket, io } from 'socket.io-client';
import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusData, User } from 'src/app/models/models';
import { Notification } from 'src/app/models/models';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocketioService {
    url: string;
    private socket: Socket;
    private id: number;

    constructor(
        private localStorageService: LocalStorageService,
    ) {
        this.url = environment.backendUrl || 'http://localhost:3000';
        this.id = this.localStorageService.getItem('id');
        this.socket = io(this.url, {
            query: { userId: this.id },
            reconnection: true,
            reconnectionAttempts: 3,
            timeout: 10000
        });
    }

    public socketExists(): boolean {
        return this.socket !== null;
    }

    public initSocket(): void {
        if (this.id !== null && this.socketExists()) {
            this.socket.emit('init', this.id);
            this.sendUserStatus('Online');
        }
    }

    public disconnect(): void {
        this.sendUserStatus('Offline'); //voir si utile
        this.socket.disconnect();
    }

    public userConnect(userId: number): void {
        this.socket.emit('userConnected', userId);
    }

    public sendMessage(message: string, recipient_id: number): void {
        this.socket.emit('new-message', { message: message, author_id: this.id, recipient_id: recipient_id, date: new Date() });
    }

    public getMessages(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('refresh', (message) => {
                observer.next(message);
            });
        });
    }

    public getAllUserStatusEvents(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('all-users-status-events', (status: StatusData) => {
                observer.next(status);
            });
        });
    }

    private sendUserStatus(status: string): void {
        this.socket.emit('user-status', { userId: this.id, status });
    }

    public getStatus(recipient: User): Observable<any> {
        return new Observable((observer) => {
            this.socket.emit('check-status', { senderId: this.id, recipientId: recipient.id })
            this.socket.on('status', (statusData: StatusData) => {
                observer.next(statusData);
            });
        });
    }

    public handleDisconnect(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('user-disconnected', (userId) => {
                observer.next(userId);
            });
        });
    }

    public blockUser(blockId: number, user: number) {
        this.socket.emit('block-user', { blockId: blockId, author_id: this.id, recipient_id: user});
    }

    public unblockUser(blockId: number, user: number) {
        this.socket.emit('unblock-user', { blockId: blockId, author_id: this.id, recipient_id: user });
    }

    public handleBlock(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('user-blocked', (userIds) => {
                observer.next(userIds);
            })
        })
    }

    public handleUnblock(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('user-unblocked', (userIds) => {
                observer.next(userIds);
            })
        })
    }

    public getNotifications(): Observable<Notification> {
        return new Observable((observer) => {
            this.socket.on('new-notification', (notification: Notification) => {
                observer.next(notification);
            });
        });
    }

    public emitLike(author_id: number, recipient_id: number) {
        this.socket.emit('new-like', { author_id: author_id, recipient_id: recipient_id });
    }

    public emitUnlike(author_id: number, recipient_id: number) {
        this.socket.emit('delete-like', { author_id: author_id, recipient_id: recipient_id });
    }

    public emitMatch(author_id: number, recipient_id: number) {
        this.socket.emit('new-match', { author_id: author_id, recipient_id: recipient_id });
    }

    public emitView(author_id: number, recipient_id: number) {
        this.socket.emit('new-view', { author_id: author_id, recipient_id: recipient_id });
    }
}