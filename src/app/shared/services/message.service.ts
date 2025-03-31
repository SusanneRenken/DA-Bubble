import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { combineLatest, map, Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  getMessageCollection(): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, orderBy('mTime', 'asc'));
    return runInInjectionContext(this.injector, () =>
      collectionData(q, { idField: 'mId' })
    ) as Observable<Message[]>;
  }

  getDirectMessages(userId: string, activeUserId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');

    const query1 = query(
      messagesRef,
      where('mUserId', '==', userId),
      where('mSenderId', '==', activeUserId),
      orderBy('mTime', 'asc')
    );

    const query2 = query(
      messagesRef,
      where('mUserId', '==', activeUserId),
      where('mSenderId', '==', userId),
      orderBy('mTime', 'asc')
    );

    const obs1 = runInInjectionContext(this.injector, () =>
      collectionData(query1, { idField: 'mId' })
    ) as Observable<Message[]>;
    const obs2 = runInInjectionContext(this.injector, () =>
      collectionData(query2, { idField: 'mId' })
    ) as Observable<Message[]>;

    return combineLatest([obs1, obs2]).pipe(
      map(([messages1, messages2]) => {
        const combined = [...messages1, ...messages2];
        combined.sort((a, b) => a.mTime - b.mTime);
        return combined;
      })
    );
  }

  getChannelMessages(channelId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('mChannelId', '==', channelId),
      orderBy('mTime', 'asc')
    );
    return runInInjectionContext(this.injector, () =>
      collectionData(q, { idField: 'mId' })
    ) as Observable<Message[]>;
  }

  getThreadMessages(threadId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('mThreadId', '==', threadId),
      orderBy('mTime', 'asc')
    );
    return runInInjectionContext(this.injector, () =>
      collectionData(q, { idField: 'mId' })
    ) as Observable<Message[]>;
  }

  addMessage(message: Omit<Message, 'mId'>): Promise<void> {
    const messagesRef = collection(this.firestore, 'messages');
    const newDocRef = doc(messagesRef); // generiert automatisch eine eindeutige ID
    return setDoc(newDocRef, message);
  }

  editMessage(message: Message): Promise<void> {
    const { mId, ...updateData } = message;
    if (!mId) {
      return Promise.reject('Fehler: mId fehlt!');
    }
    const messageDocRef = doc(this.firestore, 'messages', mId);
    return updateDoc(messageDocRef, updateData);
  }
}
