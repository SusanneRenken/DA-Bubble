import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection, doc, getDoc, getDocs, setDoc,updateDoc ,serverTimestamp} from 'firebase/firestore';
import { Channel } from '../interfaces/channel.interface';
import { retry, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  
  async addUserToChannel(channelId: string, userId: string): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    const channelSnap = await getDoc(channelRef);
  
    if (channelSnap.exists()) {
      const channelData = channelSnap.data();
      const currentUserIds = channelData['cUserIds'] || [];
  
      if (!currentUserIds.includes(userId)) {
        const updatedUserIds = [...currentUserIds, userId];
  
        await updateDoc(channelRef, {
          cUserIds: updatedUserIds,
        });
  
        console.log('✅ User-ID wurde am Ende des Arrays hinzugefügt.');
      } else {
        console.log('ℹ️ User-ID ist bereits vorhanden.');
      }
    } else {
      console.error('❌ Channel nicht gefunden.');
    }
  }

  async createChannel(name: string, description: string, userId: string): Promise<string | void> {
    if (!name || !userId) return;
    const channelsCollectionRef = collection(this.firestore, 'channels');
    const newDocRef = doc(channelsCollectionRef);
    const newId = newDocRef.id;
    const newChannel: Channel = {
      cId: newId,
      cName: name,
      cDescription: description,
      cCreatedByUser: userId,
      cUserIds: [userId],
      cTime: serverTimestamp() as any,
    };
    await setDoc(newDocRef, newChannel);
    return newId;
  }

 
  async removeUserFromChannel(channelId: string, userId: string): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    const channelSnap = await getDoc(channelRef);
    if (!channelSnap.exists()) return;
    const channelData = channelSnap.data();
    const currentUserIds: string[] = channelData['cUserIds'] || [];
    if (!currentUserIds.includes(userId)) return;
    const updatedUserIds = currentUserIds.filter(id => id !== userId);
    await updateDoc(channelRef, { cUserIds: updatedUserIds });
  }

  async updateChannelName(channelId: string, newName: string): Promise<void> {
    if (!channelId || !newName.trim()) return;

    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, { cName: newName.trim() });
  }


  async updateChannelDescription(channelId: string, newDescription: string): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, { cDescription: newDescription });
  }

  getSortedChannels(): Observable<{ id: string; name: string; createdAt: any }[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return collectionData(channelsCollection, { idField: 'id' }).pipe(
      map((channels: any[]) =>
        channels
          .map(channel => ({
            id: channel.id,
            name: channel.cName,
            createdAt: channel.createdAt || 0,
          }))
          .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      )
    );
  }


  allChannels(): Promise<Channel[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return getDocs(channelsCollection).then(snap => snap.docs.map(doc => doc.data() as Channel));
  }
  
}
