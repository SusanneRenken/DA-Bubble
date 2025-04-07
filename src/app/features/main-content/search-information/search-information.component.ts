import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { doc, getDocs } from 'firebase/firestore';
import { Message } from '../../../shared/interfaces/message.interface';
import { Channels } from '../../../shared/interfaces/channels.interface';
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

  showMatchedMessages: boolean = true;
  showContact: boolean = true;
  showChannels: boolean = true;

  channels: any[] = [];
  users: { uName: string; uUserImage: string }[] = [];
  matchedMessages: { mText: string; channelName: string }[] = [];


  constructor(private firestore: Firestore) {}

  @Input() set searchText(value: string) {
    this._searchText = value.trim().toLowerCase();
    this.handleSearch(this._searchText);
  }

  async handleSearch(searchText: string) {
    if (!this.isValidSearch(searchText)) return;
    const [users, messages, channels] = await this.fetchData();
    this.users = this.getMatchedUsers(users, searchText);
    this.showContact = this.users.length === 0;
    this.matchedMessages = this.getMatchedMessages( messages, channels, searchText );
    this.showMatchedMessages= this.matchedMessages.length === 0;
    const matchedUser = this.findUserByName(users, searchText);
    const filteredChannels = this.filterChannelsByUserOrName( channels, matchedUser, searchText );
    const enrichedChannels = this.enrichChannelsWithUserNames( filteredChannels, users );
    this.channels = enrichedChannels;
    this.showChannels = this.channels.length === 0;
  }

  private isValidSearch(searchText: string): boolean {
    return !!searchText && searchText.trim().length >= 3;
  }

  private async fetchData(): Promise<[User[], Message[], Channels[]]> {
    const usersSnap = await getDocs(collection(this.firestore, 'users'));
    const messagesSnap = await getDocs(collection(this.firestore, 'messages'));
    const channelsSnap = await getDocs(collection(this.firestore, 'channels'));

    const users = usersSnap.docs.map((doc) => doc.data() as User);
    const messages = messagesSnap.docs.map((doc) => doc.data() as Message);
    const channels = channelsSnap.docs.map((doc) => doc.data() as Channels);

    return [users, messages, channels];
  }

  private getMatchedUsers(
    users: User[],
    searchText: string
  ): { uName: string; uUserImage: string }[] {
    return users
      .filter((user) => (user.uName || '').toLowerCase().includes(searchText))
      .map((user) => ({
        uName: user.uName,
        uUserImage: user.uUserImage,
      }));
  }

  private getMatchedMessages(
    messages: Message[],
    channels: Channels[],
    searchText: string
  ): { mText: string; channelName: string }[] {
    return messages
      .filter(
        (message) =>
          !!message.mText && message.mText.toLowerCase().includes(searchText)
      )
      .map((message) => {
        const channel = channels.find((c) => c.cId === message.mChannelId);
        return {
          mText: message.mText,
          channelName: channel?.cName || '',
        };
      });
      
  }

  private findUserByName(users: User[], searchText: string): User | undefined {
    return users.find((user) => user.uName.toLowerCase().includes(searchText));
  }

  private filterChannelsByUserOrName(
    channels: Channels[],
    matchedUser: User | undefined,
    searchText: string
  ): Channels[] {
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

  private enrichChannelsWithUserNames(
    channels: Channels[],
    users: User[]
  ): any[] {
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

  private debugLog(users: any[], messages: Message[], channels: any[]) {
    console.log('show Messages', messages);
  }
}
