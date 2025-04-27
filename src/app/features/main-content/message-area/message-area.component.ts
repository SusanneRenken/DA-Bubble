import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../shared/services/user.service';
import { ChannelService } from '../../../shared/services/channel.service';

import { Message } from '../../../shared/interfaces/message.interface';
import { User } from '../../../shared/interfaces/user.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';

import { MessageComponent } from './message/message.component';
import { ChannelLeaveComponent } from '../../general-components/channel-leave/channel-leave.component';
import { ProfilComponent } from '../../general-components/profil/profil.component';
import { ChannelMembersComponent } from './channel-members/channel-members.component';
import { AddNewMembersComponent } from '../../general-components/add-new-members/add-new-members.component';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-message-area',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessageComponent,
    ChannelLeaveComponent,
    ProfilComponent,
    ChannelMembersComponent,
    AddNewMembersComponent,
    PickerComponent,
  ],
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnChanges, OnDestroy {
  private userService = inject(UserService);
  private channelService = inject(ChannelService);
  private messageService = inject(MessageService);
  private messagesSub?: Subscription;
  private channelSub?: Subscription;
  private chatPartnerSub?: Subscription;
  private channelMemberSubs: Subscription[] = [];

  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'private';
  @Input() chatId: string | null = null;
  @Input() activeUserId: string | null = null;

  @Output() openThread = new EventEmitter<string>();
  @Output() closeThread = new EventEmitter<string>();
  @Output() openChat = new EventEmitter<{
    chatType: 'private' | 'channel';
    chatId: string;
  }>();

  @ViewChild('scrollContainer') private scrollCont!: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput')
  private msgInputRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('emojiPicker', { read: ElementRef })
  private emojiPickerRef?: ElementRef;
  @ViewChild('emojiButton', { read: ElementRef })
  private emojiBtnRef?: ElementRef;

  messages: Message[] = [];
  chatPartner: User | null = null;
  channelData: Channel | null = null;
  channelMembers: User[] = [];
  userProfil: User | null = null;
  newMessageText = '';
  isLoading = true;
  isEditChannelOpen = false;
  isProfilOpen = false;
  isChannelMemberOpen = false;
  isEmojiPickerOpen = false;

  threadContextName = '';
  threadReplyCount = 0;

  displaySuggestions = false;
  currentMentionPos = -1;
  foundUsers: User[] = [];
  foundChannels: Channel[] = [];

  showNewSuggestions = false;
  foundUsersNew: User[] = [];
  foundChannelsNew: Channel[] = [];
  newChatInput = '';

  activChannelMemberProfil: User | null = null;
  isChannelMemberProfilOpen = false;
  newChannelMembers = false;
  addMemberPopUp = false;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      setTimeout(() => {
        this.scrollToBottom();
        this.focusMessageInput();
      }, 500);
    }, 500);
  }

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['chatType'] || ch['chatId'] || ch['activeUserId']) {
      this.prepareForReload();
      this.loadMessages();
      this.loadChatData();
    }
  }

  ngOnDestroy(): void {
    this.messagesSub?.unsubscribe();
    this.channelSub?.unsubscribe();
    this.chatPartnerSub?.unsubscribe();
    this.channelMemberSubs.forEach((s) => s.unsubscribe());
  }

  private prepareForReload() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  private loadMessages() {
    this.messagesSub?.unsubscribe();

    if (!this.chatType || !this.chatId || !this.activeUserId) {
      this.resetMessages();
      return;
    }

    this.messagesSub = this.messageService
      .getMessages(this.chatType, this.chatId, this.activeUserId)
      .subscribe((msgs) => this.handleIncomingMessages(msgs));
  }

  private resetMessages() {
    this.messages = [];
    this.threadReplyCount = 0;
  }

  private handleIncomingMessages(msgs: Message[]) {
    const hasNew = msgs.length > this.messages.length;
    this.messages = msgs;

    if (this.chatType === 'thread') {
      this.threadReplyCount = Math.max(0, msgs.length - 1);
      this.setThreadContextName(msgs[0]);
    }

    if (hasNew) setTimeout(() => this.scrollToBottom(), 100);
  }

  private setThreadContextName(parent: Message) {
    if (parent.mChannelId) {
      this.channelService
        .getChannel(parent.mChannelId)
        .then((ch) => (this.threadContextName = `#${ch.cName}`));
    } else if (parent.mUserId) {
      this.userService
        .getUser(parent.mUserId)
        .then((u) => (this.threadContextName = `@${u.uName}`));
    }
  }

  private loadChatData() {
    this.channelSub?.unsubscribe();
    this.chatPartnerSub?.unsubscribe();
    this.channelMemberSubs.forEach((s) => s.unsubscribe());

    this.chatPartner = null;
    this.channelData = null;
    this.channelMembers = [];

    if (this.chatType === 'private' && this.chatId)
      return this.loadChatPartnerData();
    if (this.chatType === 'channel' && this.chatId)
      return this.subscribeChannelRealtime();
  }

  private loadChatPartnerData() {
    if (!this.chatId) return;
    this.chatPartnerSub = this.userService
      .getUserRealtime(this.chatId)
      .subscribe({
        next: (u) => (this.chatPartner = u),
        error: (err) => console.error('User-Live', err),
      });
  }

  private subscribeChannelRealtime() {
    this.channelSub = this.channelService
      .getChannelRealtime(this.chatId!)
      .subscribe({
        next: (ch) => {
          this.channelData = ch;
          this.loadChannelMembers();
        },
        error: (err) => console.error('Channel-Realtime', err),
      });
  }

  private loadChannelMembers() {
    this.channelMemberSubs.forEach((s) => s.unsubscribe());
    this.channelMemberSubs = [];
    this.channelMembers = [];

    if (!this.channelData?.cUserIds?.length) return;

    for (const uid of this.channelData.cUserIds) {
      const sub = this.userService.getUserRealtime(uid).subscribe({
        next: (u) => this.mergeMember(u),
        error: (err) => console.error('User-Realtime', err),
      });
      this.channelMemberSubs.push(sub);
    }
  }

  private mergeMember(user: User | null) {
    if (!user) return;
    const idx = this.channelMembers.findIndex((u) => u.uId === user.uId);
    idx > -1
      ? (this.channelMembers[idx] = user)
      : this.channelMembers.push(user);
    this.sortMembers();
  }
  private sortMembers() {
    this.channelMembers.sort((a, b) => {
      if (a.uId === this.activeUserId) return -1;
      if (b.uId === this.activeUserId) return 1;
      return 0;
    });
  }

  private scrollToBottom() {
    if (this.scrollCont)
      this.scrollCont.nativeElement.scrollTop =
        this.scrollCont.nativeElement.scrollHeight;
  }

  private focusMessageInput() {
    const ta = this.msgInputRef?.nativeElement;
    if (ta) {
      ta.focus();
      ta.value = '';
    }
  }

  shouldShowDateSeparator(i: number): boolean {
    if (i === 0) return true;
    return (
      this.getDay(this.messages[i].mTime) !==
      this.getDay(this.messages[i - 1].mTime)
    );
  }
  private getDay(t: any): number {
    const d = t?.toDate?.() ?? t ?? new Date(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  getDateString(t: any): string {
    const d = t?.toDate?.() ?? t ?? new Date(t);
    const diff = this.getDay(d) - this.getDay(new Date());
    if (diff === 0) return 'Heute';
    if (diff === -86400000) return 'Gestern';
    return d.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  getPlaceholder(): string {
    switch (this.chatType) {
      case 'private':
        return `Nachricht an ${this.chatPartner?.uName || 'unbekannter User'}`;
      case 'channel':
        return `Nachricht an #${
          this.channelData?.cName || 'unbekannter Kanal'
        }`;
      case 'thread':
        return 'Antworten...';
      default:
        return 'Starte eine neue Nachricht';
    }
  }

  handleKeyDown(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey && this.newMessageText.trim()) {
      ev.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    const text = this.newMessageText.trim();
    if (!text) return;

    if (this.chatType === 'thread' && this.chatId) {
      await this.messageService.replyInThread(
        this.chatId,
        text,
        this.activeUserId!
      );
    } else {
      const newMsg: Partial<Message> = {
        mText: text,
        mReactions: [],
        mSenderId: this.activeUserId!,
        mUserId: this.chatType === 'private' ? this.chatId! : '',
        mChannelId: this.chatType === 'channel' ? this.chatId! : '',
        mThreadId: '',
      };
      await this.messageService.createMessage(newMsg);
    }
    this.newMessageText = '';
    setTimeout(() => this.scrollToBottom(), 100);
  }

  handleThreadClick(id: string) {
    this.openThread.emit(id);
  }
  handleCloseThread() {
    this.closeThread.emit();
  }

  toggleEdit() {
    this.isEditChannelOpen = !this.isEditChannelOpen;
  }

  toggleProfile(u: User | null) {
    this.userProfil = u;
    this.isProfilOpen = !this.isProfilOpen;
  }

  openUserProfil(id: string) {
    this.userService
      .getUser(id)
      .then((u) => (this.userProfil = u))
      .catch(console.error);
    this.isProfilOpen = true;
  }

  toggleChannelMembers() {
    this.isChannelMemberOpen = !this.isChannelMemberOpen;
  }

  onTextChange(ev: Event) {
    const ta = ev.target as HTMLTextAreaElement;
    if (!ta) return;

    const caret = ta.selectionStart || 0;
    const val = ta.value;
    const aPos = val.lastIndexOf('@');
    const hPos = val.lastIndexOf('#');
    const pos = Math.max(aPos, hPos);

    this.currentMentionPos = pos !== -1 && pos < caret ? pos : -1;
    if (this.currentMentionPos === -1) {
      this.hideSuggestions();
      return;
    }

    const word = val.slice(pos + 1, caret);
    if (word.includes(' ')) {
      this.hideSuggestions();
      return;
    }

    val[pos] === '@' ? this.searchUsers(word) : this.searchChannels(word);
  }

  openUserSuggestions() {
    const ta = this.msgInputRef?.nativeElement;
    if (!ta) return;
    const caret = ta.selectionStart || 0;
    this.newMessageText =
      this.newMessageText.slice(0, caret) +
      '@' +
      this.newMessageText.slice(caret);
    ta.value = this.newMessageText;
    ta.setSelectionRange(caret + 1, caret + 1);
    this.currentMentionPos = caret;
    this.searchUsers('');
    this.displaySuggestions = true;
  }

  private searchUsers(q: string) {
    this.userService.getAllUsers().then((list) => {
      this.foundUsers = list.filter((u) =>
        u.uName.toLowerCase().includes(q.toLowerCase())
      );
      this.displaySuggestions = !!this.foundUsers.length;
    });
  }
  private searchChannels(q: string) {
    this.channelService.getAllChannels().then((list) => {
      this.foundChannels = list.filter((c) =>
        c.cName.toLowerCase().includes(q.toLowerCase())
      );
      this.displaySuggestions = !!this.foundChannels.length;
    });
  }

  insertUserSuggestion(u: User) {
    if (u?.uName) this.insertSuggestion(u.uName);
  }
  insertChannelSuggestion(c: Channel) {
    if (c?.cName) this.insertSuggestion(c.cName);
  }

  private insertSuggestion(text: string) {
    const ta = this.msgInputRef?.nativeElement;
    if (!ta || this.currentMentionPos === -1) return;
    const full = this.newMessageText;
    const caret = ta.selectionStart;
    const newT =
      full.slice(0, this.currentMentionPos + 1) +
      text +
      ' ' +
      full.slice(caret);
    this.newMessageText = newT;
    ta.value = newT;
    const newPos = this.currentMentionPos + 1 + text.length + 1;
    ta.setSelectionRange(newPos, newPos);
    ta.focus();
    this.hideSuggestions();
  }

  private hideSuggestions() {
    this.displaySuggestions = false;
    this.foundUsers = [];
    this.foundChannels = [];
  }

  toggleEmojiPicker(ev: MouseEvent) {
    ev.stopPropagation();
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
    if (this.isEmojiPickerOpen)
      setTimeout(() => this.emojiPickerRef?.nativeElement.focus?.());
  }

  addEmoji(e: any) {
    const char = e.emoji.native;
    const ta = this.msgInputRef.nativeElement;
    const pos = ta.selectionStart;
    this.newMessageText =
      this.newMessageText.slice(0, pos) + char + this.newMessageText.slice(pos);
    ta.value = this.newMessageText;
    ta.setSelectionRange(pos + char.length, pos + char.length);
    ta.focus();
    this.isEmojiPickerOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.isEmojiPickerOpen) return;
    const t = ev.target as HTMLElement;
    const inside = this.emojiPickerRef?.nativeElement.contains(t);
    const onBtn = this.emojiBtnRef?.nativeElement.contains(t);
    if (!inside && !onBtn) this.isEmojiPickerOpen = false;
  }

  toggleMemberProfil(u?: User) {
    this.isChannelMemberProfilOpen = !this.isChannelMemberProfilOpen;
    this.activChannelMemberProfil = u ?? null;
  }

  addChannelMember() {
    this.newChannelMembers = true;
  }

  openAddMemberPopUp() {
    this.addMemberPopUp = true;
  }
  closeAddMember() {
    this.addMemberPopUp = false;
  }

  onNewInputChange() {
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
      this.userService.getAllUsers().then((all) => {
        this.foundUsersNew = all.filter((u) =>
          u.uName.toLowerCase().includes(query)
        );
        this.foundChannelsNew = [];
      });
    } else if (first === '#') {
      this.channelService.getAllChannels().then((all) => {
        this.foundChannelsNew = all.filter((c) =>
          c.cName.toLowerCase().includes(query)
        );
        this.foundUsersNew = [];
      });
    } else {
      this.userService.getAllUsers().then((all) => {
        this.foundUsersNew = all.filter((u) =>
          u.uEmail.toLowerCase().includes(val.toLowerCase())
        );
        this.foundChannelsNew = [];
      });
    }
  }

  selectUserNew(u: User) {
    this.finishNewTarget('private', u.uId!);
  }
  selectChannelNew(c: Channel) {
    this.finishNewTarget('channel', c.cId!);
  }

  private finishNewTarget(type: 'private' | 'channel', id: string) {
    this.newChatInput = '';
    this.showNewSuggestions = false;
    this.openChat.emit({ chatType: type, chatId: id });
  }
}
