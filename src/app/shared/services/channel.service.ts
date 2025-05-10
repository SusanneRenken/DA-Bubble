import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, deleteDoc  } from '@angular/fire/firestore';
import { collection, doc, getDoc, getDocs, setDoc,updateDoc ,serverTimestamp, onSnapshot, query, where, arrayUnion, writeBatch} from 'firebase/firestore';
import { Channel } from '../interfaces/channel.interface';
import { Observable } from 'rxjs';
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
      const channelData = { ...(docSnap.data() as Channel), cId: docSnap.id };
      allChannels.push(channelData);
    });

    return allChannels;
  }

  getChannelRealtime(channelId: string): Observable<Channel> {
    return new Observable<Channel>((observer) => {
      const ref = doc(this.firestore, 'channels', channelId);
      const unsub = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          observer.next({ ...(snap.data() as Channel), cId: snap.id });
        }
      });
      return () => unsub();
    });
  }

  async getChannel(channelId: string | null): Promise<Channel> {
    if (!channelId) {
      return Promise.reject(new Error('Invalid channelId: null'));
    }
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return getDoc(channelDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        return { ...(docSnap.data() as Channel), cId: docSnap.id };
      } else {
        throw new Error('Channel not found');
      }
    });
  }
  
  addUsersToChannel(channelId: string, ...userIds: string[]): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    return updateDoc(channelRef, {
      cUserIds: arrayUnion(...userIds)
    });
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

  async checkChannelNameExists(name: string): Promise<boolean> {
    const col = collection(this.firestore, 'channels');
    const q = query(col, where('cName', '==', name));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async updateChannelDescription(channelId: string, newDescription: string): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    await updateDoc(channelRef, { cDescription: newDescription });
  }

  getSortedChannels(userId: string | null): Observable<{ id: string; name: string; createdAt: any }[]> {
    const channelsRef  = collection(this.firestore, 'channels');
    const channelQuery = query(channelsRef, where('cUserIds', 'array-contains', userId));
  
    return collectionData(channelQuery, { idField: 'id' }).pipe(
      map((channels: any[]) =>
        channels
          .map(ch => ({
            id:        ch.id,
            name:      ch.cName, 
            createdAt: ch.createdAt || 0,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }))
      )
    );
  }


  allChannels(): Promise<Channel[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    return getDocs(channelsCollection).then(snap => snap.docs.map(doc => doc.data() as Channel));
  }
  

  deleteChannel(channelId: string): Promise<void> {
    const channelRef = doc(this.firestore, 'channels', channelId);
    return deleteDoc(channelRef);
  }

  async deleteChannelsByCreator(userId: string): Promise<void> {
    if (!userId) return;
  
    const colRef = collection(this.firestore, 'channels');
    const q      = query(colRef, where('cCreatedByUser', '==', userId));
  
    const snap = await getDocs(q);
    if (snap.empty) return;
  
    let batch   = writeBatch(this.firestore);
    let counter = 0;
  
    snap.forEach(docSnap => {
      batch.delete(docSnap.ref);
      counter++;
  
      if (counter === 500) {
        batch.commit();
        batch   = writeBatch(this.firestore);
        counter = 0;
      }
    });
  
    if (counter > 0) {
      await batch.commit();
    }
  }
}
