import { Component, inject, Input, OnInit } from '@angular/core';
import { Message } from '../../../../shared/interfaces/message.interface';
import { Timestamp } from 'firebase/firestore';
import { UserService } from '../../../../shared/services/user.service';
import { UserInterface } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent implements OnInit {
  private userService = inject(UserService);

  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' | null = null;
  @Input() message!: Message;
  @Input() activeUserId: string | null = null;

  senderData: UserInterface | null = null;

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData() {
    this.userService
      .getUser(this.message.mSenderId)
      .then((userData) => {
        this.senderData = userData;
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Users:', error);
      });
  }

  getTimeInHours(timestamp: Timestamp): string | undefined {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return undefined;
  }
}
