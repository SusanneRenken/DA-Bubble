import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../shared/services/message.service';
import { Message } from '../../../shared/interfaces/message.interface';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { User } from '../../../shared/interfaces/user.interface';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-message-area',
  imports: [CommonModule, MessageComponent],
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnChanges, OnDestroy {
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'private';
  @Input() chatId: string | null = null;
  @Input() activeUserId: string | null = null;

  chatPartner: User | null = null;
  // ChannelData: Channel | null = null;
  messages: Message[] = [];

  private messagesSubscription: Subscription | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatType'] || changes['chatId'] || changes['activeUserId']) {
      this.loadMessages();
      this.loadChatData();
    }
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  loadMessages(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    if (!this.chatType || !this.chatId || !this.activeUserId) {
      this.messages = [];
      return;
    }

    this.messagesSubscription = this.messageService
      .getMessages(this.chatType, this.chatId, this.activeUserId)
      .subscribe((messages) => {
        this.messages = messages;
      });
  }

  loadChatData(): void {
    if (this.chatType === 'private') {
      this.loadChatPartnerData();
    } else {
      this.chatPartner = null;
    }

    // if (this.chatType === 'channel') {
    //   this.loadChannelData();
    // } else {
    //   this.ChannelData = null;
    // }
  }

  loadChatPartnerData(): void {
    this.userService
      .getUser(this.chatId)
      .then((chatPartnerData) => {
        this.chatPartner = chatPartnerData;
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Users:', error);
      });
  }

  // loadChannelData() {
  //   console.log('Channeldaten werden geladen...');
  // }

  testMessage(): void {
    console.log('Testnachricht wird erstellt...');
  }
}
