import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
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
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-message-area',
  imports: [
    CommonModule,
    MessageComponent,
    FormsModule,
    ChannelLeaveComponent,
    ProfilComponent,
    ChannelMembersComponent,
    PickerComponent,
  ],
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnChanges, OnDestroy {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);

  private messagesSubscription: Subscription | null = null;
  private channelSubscription: Subscription | null = null;
  private lastListLength = 0;

  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'private';
  @Input() chatId: string | null = null;
  @Input() activeUserId: string | null = null;

  @Output() openThread = new EventEmitter<string>();
  @Output() closeThread = new EventEmitter<string>();
  @Output() openChat = new EventEmitter<{
    chatType: 'private' | 'channel';
    chatId: string;
  }>();

  @ViewChild('scrollContainer')
  private scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput')
  private messageInputRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('emojiPicker', { read: ElementRef }) emojiPickerRef?: ElementRef;
  @ViewChild('emojiButton', { read: ElementRef }) emojiButtonRef?: ElementRef;

  messages: Message[] = [];

  chatPartner: User | null = null;
  userProfil: User | null = null;

  channelData: Channel | null = null;
  channelMembers: User[] = [];

  foundChannelsNew: Channel[] = [];
  foundUsersNew: User[] = [];
  newChatInput: string = '';

  newMessageText: string = '';

  isLoading: boolean = true;
  isEditChannelOpen: boolean = false;
  isProfilOpen: boolean = false;
  isChannelMemberOpen: boolean = false;
  isEmojiPickerOpen: boolean = false;
  showNewSuggestions: boolean = false;

  foundUsers: User[] = [];
  foundChannels: Channel[] = [];
  displaySuggestions: boolean = false;
  currentMentionPos: number = -1;
  threadContextName: string = '';
  threadReplyCount = 0;

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
      this.lastListLength = 0;
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
    this.messagesSubscription?.unsubscribe();
    this.channelSubscription?.unsubscribe();
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
    this.messagesSubscription?.unsubscribe();

    if (!this.chatType || !this.chatId || !this.activeUserId) {
      this.messages = [];
      this.lastListLength = 0;
      return;
    }

    this.messages = [];

    this.messagesSubscription = this.messageService
      .getMessages(this.chatType, this.chatId, this.activeUserId)
      .subscribe((messages) => {
        const hasNewMessage = messages.length > this.lastListLength;

        this.messages = messages;
        this.lastListLength = messages.length;

        if (this.chatType === 'thread') {
          this.threadReplyCount = messages.length > 0 ? messages.length - 1 : 0;
        }

        if (hasNewMessage) {
          setTimeout(() => this.scrollToBottom(), 100);
        }

        if (this.chatType === 'thread' && messages.length > 0) {
          const parent = messages[0];
          if (parent.mChannelId) {
            this.channelService.getChannel(parent.mChannelId).then((ch) => {
              this.threadContextName = `#${ch.cName}`;
            });
          } else if (parent.mUserId) {
            this.userService.getUser(parent.mUserId).then((u) => {
              this.threadContextName = `@${u.uName}`;
            });
          }
        }
      });
  }

  loadChatData(): void {
    this.channelSubscription?.unsubscribe();

    this.chatPartner = null;
    this.channelData = null;
    this.channelMembers = [];

    if (this.chatType === 'private' && this.chatId) {
      this.loadChatPartnerData();
      return;
    }

    if (this.chatType === 'channel' && this.chatId) {
      this.channelSubscription = this.channelService
        .getChannelRealtime(this.chatId)
        .subscribe({
          next: (channel) => {
            this.channelData = channel;
            this.loadChannelMembers();
          },
          error: (err) => console.error('Channel‑Realtime‑Fehler', err),
        });
      return;
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
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      this.newMessageText.trim()
    ) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage(): Promise<void> {
    const text = this.newMessageText.trim();
    if (!text) return;

    if (this.chatType === 'thread' && this.chatId) {
      await this.messageService.replyInThread(
        this.chatId,
        text,
        this.activeUserId!
      );
    } else {
      const newMessage: Partial<Message> = {
        mText: text,
        mReactions: [],
        mSenderId: this.activeUserId!,
        mUserId: this.chatType === 'private' ? this.chatId! : '',
        mChannelId: this.chatType === 'channel' ? this.chatId! : '',
        mThreadId: '',
      };
      await this.messageService.createMessage(newMessage);
    }

    this.newMessageText = '';
    setTimeout(() => this.scrollToBottom(), 100);
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

  handleThreadClick(threadId: string) {
    this.openThread.emit(threadId);
  }

  handleCloseThread() {
    this.closeThread.emit();
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

  toggleEmojiPicker(event: MouseEvent): void {
    event.stopPropagation();
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;

    if (this.isEmojiPickerOpen) {
      setTimeout(() => {
        this.emojiPickerRef?.nativeElement.focus?.();
      });
    }
  }

  addEmoji(emoji: any): void {
    console.log('Emoji:', emoji.emoji.native);
    const txtArea = this.messageInputRef.nativeElement;
    const caretPos = txtArea.selectionStart;
    const textBefore = this.newMessageText.slice(0, caretPos);
    const textAfter = this.newMessageText.slice(caretPos);
    this.newMessageText = textBefore + emoji.emoji.native + textAfter;
    txtArea.value = this.newMessageText;
    const newCaretPos = caretPos + emoji.emoji.native.length;
    txtArea.setSelectionRange(newCaretPos, newCaretPos);
    txtArea.focus();
    this.isEmojiPickerOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isEmojiPickerOpen) return;

    const target = event.target as HTMLElement;
    const insidePicker = this.emojiPickerRef?.nativeElement.contains(target);
    const onIcon = this.emojiButtonRef?.nativeElement.contains(target);

    if (!insidePicker && !onIcon) {
      this.isEmojiPickerOpen = false;
    }
  }

  async removeMember() {
    if (!this.activeUserId || !this.chatId) return;
    await this.channelService.removeUserFromChannel(
      this.chatId,
      this.activeUserId
    );
  }

  activChannelMemberProfil: User | null = null;
  newChannelMembers: boolean = false;
  isChannelMemberProfilOpen: boolean = false;

  toggleMemberProfil(member?: User) {
    console.log('Clicked on member:', member);

    this.isChannelMemberProfilOpen = !this.isChannelMemberProfilOpen;
    if (member) {
      this.activChannelMemberProfil = member;
    } else {
      this.activChannelMemberProfil = null;
    }
  }

  addChannelMember() {
    console.log(this.newChannelMembers);

    this.newChannelMembers = true;
  }

  onNewInputChange(): void {
    const val = this.newChatInput.trim();
    this.showNewSuggestions = !!val;
  
    if (!val) {
      this.foundUsersNew = [];
      this.foundChannelsNew = [];
      return;
    }
  
    const first = val.charAt(0);
    const query = val.slice(1).toLowerCase();
  
    if (first === '@') {
      this.userService.getAllUsers().then(all => {
        this.foundUsersNew = all.filter(u =>
          u.uName.toLowerCase().includes(query)
        );
        this.foundChannelsNew = [];
      });
    } else if (first === '#') {
      this.channelService.getAllChannels().then(all => {
        this.foundChannelsNew = all.filter(c =>
          c.cName.toLowerCase().includes(query)
        );
        this.foundUsersNew = [];
      });
    } else {
      this.userService.getAllUsers().then(all => {
        this.foundUsersNew = all.filter(u =>
          u.uEmail.toLowerCase().includes(val.toLowerCase())
        );
        this.foundChannelsNew = [];
      });
    }
  }

  selectUserNew(u: User) {
    this.newChatInput = '';
    this.showNewSuggestions = false;
    this.openChat.emit({ 
      chatType: 'private',
      chatId: u.uId!
    });
  }
  
  selectChannelNew(c: Channel) {
    this.newChatInput = '';
    this.showNewSuggestions = false;
    this.openChat.emit({
      chatType: 'channel',
      chatId: c.cId!
    });
  }
}
