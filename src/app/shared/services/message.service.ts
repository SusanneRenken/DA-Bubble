import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);

  getMessageCollection(): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, orderBy('mTime', 'asc'));
    return collectionData(q, { idField: 'mId' }) as Observable<Message[]>;
  }

  getDirectMessages(
    userId: string,
    activeUserId: string
  ): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('mUserId', '==', userId),
      orderBy('mTime', 'asc')
    );
    return collectionData(q, { idField: 'mId' }) as Observable<Message[]>;
  }

  getChannelMessages(channelId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('mChannelId', '==', channelId),
      orderBy('mTime', 'asc')
    );
    return collectionData(q, { idField: 'mId' }) as Observable<Message[]>;
  }

  getThreadMessages(threadId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('mThreadId', '==', threadId),
      orderBy('mTime', 'asc')
    );
    return collectionData(q, { idField: 'mId' }) as Observable<Message[]>;
  }

  addMessage(message: Omit<Message, 'mId'>): Promise<void> {
    const messagesRef = collection(this.firestore, 'messages');
    const newDocRef = doc(messagesRef);
    return setDoc(newDocRef, message);
  }

  editMessage(message: Message): Promise<void> {
    const { mId, ...updateData } = message;
    if (!mId) {
      return Promise.reject('Fehler: mId fehlt!');
    }
    const messageDocRef = doc(this.firestore, 'messages', mId!);
    return updateDoc(messageDocRef, updateData);
  }
}
