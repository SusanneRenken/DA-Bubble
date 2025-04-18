import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, EventEmitter, HostListener, Output, } from '@angular/core';
import { Firestore, collection } from '@angular/fire/firestore';
import { doc, getDocs } from 'firebase/firestore';
import { Message } from '../../../shared/interfaces/message.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { User } from '../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-search-information',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-information.component.html',
  styleUrl: './search-information.component.scss',
})

export class SearchInformationComponent {
  private _searchText = '';
  showDirectMessages: boolean = true;
  showMatchedMessages: boolean = true;
  showContact: boolean = true;
  showChannels: boolean = true;
  showThreadMessages: boolean = true;
  channel: any[] = [];
  users: { uName: string; uUserImage: string }[] = [];
  matchedMessages: { mText: string; channelName: string }[] = [];
  directMessages: { mText: string; userName: string }[] = [];
  threadMessages: { mText: string; threadId: string }[] = [];
  @Output() close = new EventEmitter<void>();
  @Input() set searchText(value: string) {
    this._searchText = value.trim().toLowerCase();
    this.handleSearch(this._searchText);
  }

  constructor(private firestore: Firestore, private elRef: ElementRef) {}


  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.close.emit();
    }
  }


  async handleSearch(searchText: string) {
    if (!this.isValidSearch(searchText)) return;
    const [users, messages, channels] = await this.fetchData();
    this.users = this.getMatchedUsers(users, searchText);
    this.showContact = this.users.length === 0;
    this.matchedMessages = this.getMatchedMessages( messages, channels, searchText);
    this.showMatchedMessages = this.matchedMessages.length === 0;
    const matchedUser = this.findUserByName(users, searchText);
    const filteredChannels = this.filterChannelsByUserOrName( channels, matchedUser, searchText);
    const enrichedChannels = this.enrichChannelsWithUserNames( filteredChannels, users);
    this.directMessages = this.getMatchedDirectMessages( messages, users, searchText);
    this.showDirectMessages = this.directMessages.length === 0;
    this.threadMessages = this.getMatchedThreadMessages(messages, searchText);
    this.showThreadMessages = this.threadMessages.length === 0;
    this.channel = enrichedChannels;
    this.showChannels = this.channel.length === 0;
  }


  private isValidSearch(searchText: string): boolean {
    return !!searchText && searchText.trim().length >= 3;
  }


  private async fetchData(): Promise<[User[], Message[], Channel[]]> {
    const usersSnap = await getDocs(collection(this.firestore, 'users'));
    const messagesSnap = await getDocs(collection(this.firestore, 'messages'));
    const channelsSnap = await getDocs(collection(this.firestore, 'channels'));
    const users = usersSnap.docs.map((doc) => doc.data() as User);
    const messages = messagesSnap.docs.map((doc) => doc.data() as Message);
    const channels = channelsSnap.docs.map((doc) => doc.data() as Channel);
    return [users, messages, channels];
  }


  private getMatchedUsers( users: User[], searchText: string ): { uName: string; uUserImage: string }[] {
    return users
      .filter((user) => (user.uName || '').toLowerCase().includes(searchText))
      .map((user) => ({
        uName: user.uName,
        uUserImage: user.uUserImage,
      }));
  }


  private getMatchedThreadMessages( messages: Message[], searchText: string ): { mText: string; threadId: string }[] {
    return messages
      .filter(
        (msg) =>
          !!msg.mText &&
          msg.mText.toLowerCase().includes(searchText) &&
          typeof msg.mThreadId === 'string' &&
          msg.mThreadId.trim().length > 0
      )
      .map((msg) => ({
        mText: msg.mText,
        threadId: msg.mThreadId || 'Unbekannt',
      }));
  }


  private filterRelevantMessages( messages: Message[], searchText: string ): Message[] {
    return messages.filter((message) => {
      const hasValidText =
        !!message.mText && message.mText.toLowerCase().includes(searchText);
      const hasValidChannelId =
        typeof message.mChannelId === 'string' &&
        message.mChannelId.trim().length > 0;
      const isNotThread = !message.mThreadId;
      const isNotDirectMessage = !message.mUserId;

      return (
        hasValidText && hasValidChannelId && isNotThread && isNotDirectMessage
      );
    });
  }


  private mapMessagesToChannelNames( messages: Message[], channels: Channel[] ): { mText: string; channelName: string }[] {
    return messages.map((message) => {
      const channel = channels.find((c) => c.cId === message.mChannelId);
      return {
        mText: message.mText,
        channelName: channel?.cName || '',
      };
    });
  }


  private getMatchedMessages( messages: Message[], channels: Channel[], searchText: string ): { mText: string; channelName: string }[] {
    const filteredMessages = this.filterRelevantMessages(messages, searchText);
    return this.mapMessagesToChannelNames(filteredMessages, channels);
  }


  private getMatchedDirectMessages( messages: Message[], users: User[], searchText: string ): { mText: string; userName: string }[] {
    return messages
      .filter(
        (message) =>
          !!message.mText &&
          message.mText.toLowerCase().includes(searchText) &&
          typeof message.mUserId === 'string' &&
          message.mUserId.trim().length > 0
      )
      .map((message) => {
        const user = users.find((u) => u.uId === message.mUserId);
        return {
          mText: message.mText,
          userName: user?.uName || 'Unbekannt',
        };
      });
  }


  private findUserByName(users: User[], searchText: string): User | undefined {
    return users.find((user) => user.uName.toLowerCase().includes(searchText));
  }


  private filterChannelsByUserOrName( channels: Channel[], matchedUser: User | undefined, searchText: string ): Channel[] {
    if (matchedUser?.uId) {
      return channels.filter((channel) => {
        const userIds = Object.values(channel.cUserIds || {});
        return userIds.includes(matchedUser.uId!);
      });
    } else {
      return channels.filter((channel) =>
        (channel.cName || '').toLowerCase().includes(searchText)
      );
    }
  }


  private enrichChannelsWithUserNames( channels: Channel[], users: User[] ): any[] {
    return channels.map((channel) => {
      const userIds = Object.values(channel.cUserIds || {});
      const memberNames = users
        .filter((user) => user.uId && userIds.includes(user.uId))
        .map((user) => user.uName);

      return {
        ...channel,
        memberNames,
      };
    });
  }
}
