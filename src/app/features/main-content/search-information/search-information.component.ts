import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../shared/interfaces/user.interface';
import { ChannelService } from '../../../shared/services/channel.service';
import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../shared/services/user.service';

interface ChannelMessage {
  mText: string;
  channelName: string;
  channelId: string;
}

interface DirectMessage {
  mText: string;
  otherUserId: string;
  otherUserName: string;
}

@Component({
  selector: 'app-search-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-information.component.html',
  styleUrl: './search-information.component.scss',
})
export class SearchInformationComponent implements OnInit {
  private _searchText = '';
  private route = inject(ActivatedRoute);

  @Input() set searchText(value: string) {
    this._searchText = value.trim().toLowerCase();
    this.handleSearch(this._searchText);
  }

  @Output() close = new EventEmitter<void>();
  @Output() openChat = new EventEmitter<{ chatType: 'private' | 'channel'; chatId: string }>();

  activeUserId: string | null = null;
  users: User[] = [];
  channelsWithNames: any[] = [];

  matchedMessages: ChannelMessage[] = [];
  directMessages: DirectMessage[] = [];
  threadMessages: { mText: string; threadId: string }[] = [];

  showContact = true;
  showChannels = true;
  showMatchedMessages = true;
  showDirectMessages = true;
  showThreadMessages = true;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private channelService: ChannelService
  ) {}

  ngOnInit(): void {
    // activeUserId wird aus der URL gelesen; alternativ könnt ihr es auch als @Input übergeben
    this.activeUserId = this.route.snapshot.paramMap.get('activeUserId');
  }

  private async handleSearch(searchText: string) {
    if (!searchText || searchText.length < 3) return;

    const [users, messages, channels] = await Promise.all([
      this.userService.getAllUsers(),
      this.messageService.getAllMessages(),
      this.channelService.getAllChannels(),
    ]);

    // 1) Nutzer finden
    this.users = users.filter(u =>
      (u.uName || '').toLowerCase().includes(searchText)
    );

    // 2) Channels finden (entweder nach Name oder nach Mitgliedschaft)
    const matchedUser = users.find(u =>
      (u.uName || '').toLowerCase().includes(searchText)
    );
    const filteredChannels = matchedUser
      ? channels.filter(ch =>
          Object.values(ch.cUserIds || {}).includes(matchedUser.uId!)
        )
      : channels.filter(ch =>
          (ch.cName || '').toLowerCase().includes(searchText)
        );
    this.channelsWithNames = filteredChannels.map(ch => ({
      ...ch,
      memberNames: users
        .filter(u => u.uId && Object.values(ch.cUserIds || {}).includes(u.uId))
        .map(u => u.uName)
    }));


// 3) Gefundene Nachrichten in Channels
this.matchedMessages = messages
  .filter(msg =>
    // hat eine Channel-ID
    typeof msg.mChannelId === 'string' &&
    msg.mChannelId.trim().length > 0 &&
    // Suchbegriff im Text
    msg.mText.toLowerCase().includes(searchText)
  )
  .map(msg => {
    const ch = channels.find(c => c.cId === msg.mChannelId);
    return {
      mText: msg.mText,
      channelName: ch?.cName || '',
      channelId: ch?.cId || ''
    };
  });

// 4) Gefundene private Nachrichten
this.directMessages = messages
  .filter(msg =>
    // Suchbegriff im Text
    msg.mText.toLowerCase().includes(searchText) &&
    // activeUserId ist entweder Empfänger (mUserId) oder Sender (mSenderId)
    ((msg.mUserId === this.activeUserId) || (msg.mSenderId === this.activeUserId)) &&
    // und mUserId ist nicht leer (damit es wirklich ein DM ist)
    typeof msg.mUserId === 'string' &&
    msg.mUserId.trim().length > 0
  )
  .map(msg => {
    const otherUserId = msg.mUserId === this.activeUserId
      ? msg.mSenderId!
      : msg.mUserId!;
    const otherUser = users.find(u => u.uId === otherUserId);
    return {
      mText: msg.mText,
      otherUserId,
      otherUserName: otherUser?.uName || ''
    };
  });

// 5) Gefundene Nachrichten in Threads
this.threadMessages = messages
  .filter(msg =>
    // hat eine Thread-ID
    typeof msg.mThreadId === 'string' &&
    msg.mThreadId.trim().length > 0 &&
    // und Suchbegriff im Text
    msg.mText.toLowerCase().includes(searchText)
  )
  .map(msg => ({
    mText: msg.mText,
    threadId: msg.mThreadId!
  }));

    // 6) Sichtbarkeits-Flags setzen
    this.showContact = this.users.length === 0;
    this.showChannels = this.channelsWithNames.length === 0;
    this.showMatchedMessages = this.matchedMessages.length === 0;
    this.showDirectMessages = this.directMessages.length === 0;
    this.showThreadMessages = this.threadMessages.length === 0;
  }

  /** Wiederverwendete Funktion zum Chat-Wechsel ohne Neuladen */
  selectChat(chatId: string, chatType: 'private' | 'channel') {
    this.openChat.emit({ chatType, chatId });
  }
}

