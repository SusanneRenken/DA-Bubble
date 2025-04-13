import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { Channel } from '../interfaces/channel.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private firestore = inject(Firestore);

  async getAllChannels(): Promise<Channel[]> {
    const channelsCollectionRef = collection(this.firestore, 'channels');
    const querySnapshot = await getDocs(channelsCollectionRef);
    const allChannels: Channel[] = [];

    querySnapshot.forEach((docSnap) => {
      const channelData = { ...(docSnap.data() as Channel), id: docSnap.id };
      allChannels.push(channelData);
    });

    return allChannels;
  }

  async getChannel(channelId: string | null): Promise<Channel> {
    if (!channelId) {
      return Promise.reject(new Error('Invalid channelId: null'));
    }
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return getDoc(channelDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as Channel;
      } else {
        throw new Error('Channel not found');
      }
    });
  }
}
