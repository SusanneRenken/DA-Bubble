import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../shared/services/message.service';
import { Message } from '../../../shared/interfaces/message.interface';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { UserInterface } from '../../../shared/interfaces/user.interface';
import { UserService } from '../../../shared/services/user.service';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { ChannelService } from '../../../shared/services/channel.service';
import { FormsModule } from '@angular/forms';
import { ChannelLeaveComponent } from '../../general-components/channel-leave/channel-leave.component';
import { ProfilComponent } from '../../general-components/profil/profil.component';
import { ChannelMembersComponent } from './channel-members/channel-members.component';

@Component({
  selector: 'app-message-area',
  imports: [
    CommonModule,
    MessageComponent,
    FormsModule,
    ChannelLeaveComponent,
    ProfilComponent,
    ChannelMembersComponent,
  ],
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnChanges, OnDestroy {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);

  private messagesSubscription: Subscription | null = null;

  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'private';
  @Input() chatId: string | null = null;
  @Input() activeUserId: string | null = null;

  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput')
  private messageInputRef!: ElementRef<HTMLTextAreaElement>;

  messages: Message[] = [];

  chatPartner: UserInterface | null = null;

  channelData: Channel | null = null;
  channelMembers: UserInterface[] = [];

  newMessageText: string = '';

  isLoading: boolean = true;
  isEditChannelOpen: boolean = false;
  isProfilOpen: boolean = false;
  isChannelMemberOpen: boolean = false;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      setTimeout(() => {
        this.scrollToBottom();
        this.focusMessageInput();
      }, 500);
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatType'] || changes['chatId'] || changes['activeUserId']) {
      this.isLoading = true;
      this.loadMessages();
      this.loadChatData();
      setTimeout(() => {
        this.isLoading = false;
        setTimeout(() => {
          this.scrollToBottom();
          this.focusMessageInput();
        }, 500);
      }, 500);
    }
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  scrollToBottom() {
    if (!this.scrollContainer) return;
    this.scrollContainer.nativeElement.scrollTop =
      this.scrollContainer.nativeElement.scrollHeight;
  }

  private focusMessageInput(): void {
    if (this.messageInputRef && this.messageInputRef.nativeElement) {
      this.messageInputRef.nativeElement.focus();
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

    if (this.chatType === 'channel') {
      this.loadChannelData();
    } else {
      this.channelData = null;
      this.channelMembers = [];
    }
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

  //Es kann sein dass ich channelData mit subscribe() laden muss
  loadChannelData() {
    this.channelService
      .getChannel(this.chatId)
      .then((channelData) => {
        this.channelData = channelData;
        this.loadChannelMembers();
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Channels:', error);
      });
  }

  loadChannelMembers() {
    if (!this.channelData || !this.channelData.cUserIds) {
      this.channelMembers = [];
      return;
    }

    const userIds = this.channelData.cUserIds;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      this.channelMembers = [];
      return;
    }

    this.userService
      .getFilteredUsers(userIds)
      .then((users) => {
        this.channelMembers = users;
        console.log('Channel-Mitglieder:', this.channelMembers);
      })
      .catch((error) => {
        console.error('Fehler beim Laden der Channel-Mitglieder:', error);
      });
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) {
      return true;
    }

    const current = this.messages[index];
    const prev = this.messages[index - 1];

    if (!current || !prev) {
      return false;
    }

    const currentDate = this.extractDateOnly(current.mTime);
    const prevDate = this.extractDateOnly(prev.mTime);

    return currentDate.getTime() !== prevDate.getTime();
  }

  extractDateOnly(mTime: any): Date {
    let dateObj: Date;

    if (mTime && typeof mTime.toDate === 'function') {
      dateObj = mTime.toDate();
    } else if (mTime instanceof Date) {
      dateObj = mTime;
    } else {
      dateObj = new Date(mTime);
    }

    const d = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate()
    );
    return d;
  }

  getDateString(mTime: any): string {
    const date = this.extractDateOnly(mTime);

    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  getPlaceholder(): string {
    const chatType = this.chatType;
    switch (chatType) {
      case 'private':
        return `Nachricht an ${this.chatPartner?.uName || 'unbekannter User'}`;
      case 'channel':
        return `Nachricht an #${
          this.channelData?.cName || 'unbekannter Kanal'
        }`;
      case 'thread':
        return 'Antworten...';
      case 'new':
      default:
        return 'Starte eine neue Nachricht';
    }
  }

  sendMessage(): void {
    console.log('Nachricht gesendet...');
    const newMessage: Message = {
      mText: this.newMessageText,
      mReactions: [],
      mTime: '',
      mSenderId: this.activeUserId,
      mUserId: this.chatType === 'private' ? this.chatId : '',
      mChannelId: this.chatType === 'channel' ? this.chatId : '',
      mThreadId: this.chatType === 'thread' ? this.chatId : '',
    };
    this.messageService.createMessage(newMessage);
    this.newMessageText = '';
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  // testMessage(): void {
  //   console.log('Testnachricht wird erstellt...');
  //   const testMessage: Message = {
  //     mId: '3rxhuNGtA0tluXvBJZ3J',
  //     mText: "",
  //     mReactions: [
  //       { reaction: "🥳", userId: "Eg2jVLodTA9FI99IMJUK", userName: "Sofia Müller" },
  //       { reaction: "💚", userId: "Eg2jVLodTA9FI99IMJUK", userName: "Sofia Müller" },
  //       { reaction: "🎉", userId: "8nmFp28ZO3TOeDohgGQSqR0niUj1", userName: "Bisasam" },
  //       { reaction: "🎉", userId: "Eg2jVLodTA9FI99IMJUK", userName: "Sofia Müller" },
  //       { reaction: "🍿", userId: "Eg2jVLodTA9FI99IMJUK", userName: "Sofia Müller" },
  //       { reaction: "🎞️", userId: "Eg2jVLodTA9FI99IMJUK", userName: "Sofia Müller" },
  //       { reaction: "☀️", userId: "8nmFp28ZO3TOeDohgGQSqR0niUj1", userName: "Bisasam" },
  //     ],
  //     mTime: "",
  //     mSenderId: "",
  //     mUserId: "",
  //     mChannelId: "",
  //     mThreadId: ""
  //   };
  //   this.messageService.editMessage(testMessage);
  // }

  // sofia:string = "Eg2jVLodTA9FI99IMJUK Sofia Müller";
  // noah:string = "sEg8GcSNNZ6YWhxRs4SE Noah Braun";
  // bisasam:string = "8nmFp28ZO3TOeDohgGQSqR0niUj1 Bisasam";

  toggleEdit(): void {
    this.isEditChannelOpen = !this.isEditChannelOpen;
  }

  toggleProfile(): void {
    this.isProfilOpen = !this.isProfilOpen;
  }

  toggleChannelMembers(): void {
    this.isChannelMemberOpen = !this.isChannelMemberOpen;
  }
}
