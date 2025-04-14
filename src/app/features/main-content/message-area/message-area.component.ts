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
import { User } from '../../../shared/interfaces/user.interface';
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

  chatPartner: User | null = null;
  userProfil: User | null = null;

  channelData: Channel | null = null;
  channelMembers: User[] = [];

  newMessageText: string = '';

  isLoading: boolean = true;
  isEditChannelOpen: boolean = false;
  isProfilOpen: boolean = false;
  isChannelMemberOpen: boolean = false;

  foundUsers: User[] = [];
  foundChannels: Channel[] = [];
  displaySuggestions: boolean = false;
  currentMentionPos: number = -1;

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
    // Auch scrollen, wenn eine neue Message gekommen ist
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
      this.messageInputRef.nativeElement.value = '';
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
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
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
        this.channelMembers = users.sort((a, b) => {
          if (a.uId === this.activeUserId) return -1;
          if (b.uId === this.activeUserId) return 1;
          return 0;
        });
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

    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const checkDate = date.getTime();

    if (checkDate === todayMidnight) {
      return 'Heute';
    } else if (checkDate === todayMidnight - 86400000) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
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

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
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
    }, 100);
  }

  toggleEdit(): void {
    this.isEditChannelOpen = !this.isEditChannelOpen;
  }

  toggleProfile(user: User | null): void {
    this.userProfil = user;
    this.isProfilOpen = !this.isProfilOpen;
  }

  openUserProfil(userId: string): void {
    this.userService
      .getUser(userId)
      .then((userProfilData) => {
        this.userProfil = userProfilData;
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Users:', error);
      });

    this.isProfilOpen = true;
  }

  toggleChannelMembers(): void {
    this.isChannelMemberOpen = !this.isChannelMemberOpen;
  }

  onTextChange(event: Event): void {
    const txtArea = event.target as HTMLTextAreaElement;
    if (!txtArea) return;

    const message = txtArea.value;
    const caretPos = txtArea.selectionStart || 0;

    const atPos = message.lastIndexOf('@');
    const hashPos = message.lastIndexOf('#');
    const mentionPos = Math.max(atPos, hashPos);
    this.currentMentionPos =
      mentionPos !== -1 && mentionPos < caretPos ? mentionPos : -1;

    if (mentionPos !== -1 && mentionPos < caretPos) {
      const mentionText = message.slice(mentionPos + 1, caretPos);

      if (mentionText.includes(' ')) {
        this.displaySuggestions = false;
        this.foundUsers = [];
        this.foundChannels = [];
        return;
      }

      if (message[mentionPos] === '@') {
        this.searchUsers(mentionText);
      } else if (message[mentionPos] === '#') {
        this.searchChannels(mentionText);
      }
    } else {
      this.displaySuggestions = false;
      this.foundUsers = [];
      this.foundChannels = [];
    }
  }

  openUserSuggestions(): void {
    const txtArea = this.messageInputRef?.nativeElement;
    if (!txtArea) return;

    const caretPos = txtArea.selectionStart || 0;
    const prefix = this.newMessageText.slice(0, caretPos);
    const suffix = this.newMessageText.slice(caretPos);
    const newText = prefix + '@' + suffix;
    this.newMessageText = newText;
    txtArea.value = newText;

    const newCaretPos = caretPos + 1;
    txtArea.setSelectionRange(newCaretPos, newCaretPos);

    this.currentMentionPos = prefix.length;
    this.searchUsers('');
    this.displaySuggestions = true;
    txtArea.focus();
  }

  searchUsers(input: string): void {
    this.userService
      .getAllUsers()
      .then((allUsers) => {
        this.foundUsers = allUsers.filter((user) =>
          user.uName.toLowerCase().includes(input.toLowerCase())
        );
        this.displaySuggestions = this.foundUsers.length > 0;
      })
      .catch((error) => {
        console.error('Fehler beim Laden der User:', error);
        this.displaySuggestions = false;
        this.foundUsers = [];
      });
  }

  searchChannels(input: string): void {
    this.channelService
      .getAllChannels()
      .then((allChannels) => {
        this.foundChannels = allChannels.filter((channel) =>
          channel.cName.toLowerCase().includes(input.toLowerCase())
        );
        this.displaySuggestions = this.foundChannels.length > 0;
      })
      .catch((error) => {
        console.error('Fehler beim Laden der Channels:', error);
        this.displaySuggestions = false;
        this.foundChannels = [];
      });
  }

  insertUserSuggestion(user: User): void {
    if (user && user.uName) {
      this.insertSuggestion(user.uName);
    }
  }

  insertChannelSuggestion(channel: any): void {
    if (channel && channel.cName) {
      this.insertSuggestion(channel.cName);
    }
  }

  insertSuggestion(suggestion: string): void {
    const txtArea = this.messageInputRef?.nativeElement;
    if (!txtArea || this.currentMentionPos === -1) return;

    const fullText = this.newMessageText;
    const caretPos = txtArea.selectionStart;
    const prefix = fullText.slice(0, this.currentMentionPos + 1);
    const suffix = fullText.slice(caretPos);
    const newText = prefix + suggestion + ' ' + suffix;

    this.newMessageText = newText;
    txtArea.value = newText;

    const newCaretPos = prefix.length + suggestion.length + 1;
    txtArea.setSelectionRange(newCaretPos, newCaretPos);

    this.displaySuggestions = false;
    this.foundUsers = [];
    this.foundChannels = [];
    this.currentMentionPos = -1;

    txtArea.focus();
  }
}
