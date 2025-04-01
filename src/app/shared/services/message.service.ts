import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);

  setNoteObject(obj: any, id: string): Message {
    return {
      mId: id || '',
      mText: obj.mText || '',
      mReactions: obj.mReactions || [],
      mTime: obj.mTime || new Date(),
      mSenderId: obj.mSenderId || '',
      mUserId: obj.mUserId || '',
      mThreadId: obj.mThreadId || '',
      mChannelId: obj.mChannelId || '',
    };
  }

  getMessages(
    chatType: 'private' | 'channel' | 'thread',
    chatId: string,
    activeUserId: string | null
  ): Observable<Message[]> {
    switch (chatType) {
      case 'private':
        return this.getPrivateMessages(chatId, activeUserId);
      case 'channel':
        return this.getChannelMessages(chatId);
      case 'thread':
        return this.getThreadMessages(chatId);
      default:
        return new Observable<Message[]>((observer) => {
          observer.next([]);
        });
    }
  }

  private getPrivateMessages(
    chatId: string,
    activeUserId: string | null
  ): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      const messagesCollection = collection(this.firestore, 'messages');

      const q1 = query(
        messagesCollection,
        where('mUserId', '==', activeUserId),
        where('mSenderId', '==', chatId)
      );
      const q2 = query(
        messagesCollection,
        where('mUserId', '==', chatId),
        where('mSenderId', '==', activeUserId)
      );

      let messages1: Message[] = [];
      let messages2: Message[] = [];

      const mergeMessages = (arr1: Message[], arr2: Message[]): Message[] => {
        const merged = [...arr1];
        arr2.forEach((msg) => {
          if (!merged.find((m) => m.mId === msg.mId)) {
            merged.push(msg);
          }
        });
        return merged;
      };

      const unsubscribe1 = onSnapshot(q1, (snapshot) => {
        messages1 = [];
        snapshot.forEach((doc) => {
          messages1.push(this.setNoteObject(doc.data(), doc.id));
        });
        observer.next(mergeMessages(messages1, messages2));
      });

      const unsubscribe2 = onSnapshot(q2, (snapshot) => {
        messages2 = [];
        snapshot.forEach((doc) => {
          messages2.push(this.setNoteObject(doc.data(), doc.id));
        });
        observer.next(mergeMessages(messages1, messages2));
      });

      return () => {
        unsubscribe1();
        unsubscribe2();
      };
    });
  }

  private getChannelMessages(chatId: string): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      const messagesCollection = collection(this.firestore, 'messages');
      const q = query(messagesCollection, where('mChannelId', '==', chatId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          messages.push(this.setNoteObject(doc.data(), doc.id));
        });
        observer.next(messages);
      });
      return () => unsubscribe && unsubscribe();
    });
  }

  private getThreadMessages(chatId: string): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      const messagesCollection = collection(this.firestore, 'messages');
      const q = query(messagesCollection, where('mThreadId', '==', chatId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          messages.push(this.setNoteObject(doc.data(), doc.id));
        });
        observer.next(messages);
      });
      return () => unsubscribe && unsubscribe();
    });
  }

  // Beispiel-Daten für eine Nachricht
  // createMessage(message: Partial<Message>): Promise<any> {
  //   const messagesCollection = collection(this.firestore, 'messages');
  //   const newMessage = {
  //     ...message,
  //     mTime: serverTimestamp(),
  //   };
  //   return addDoc(messagesCollection, newMessage);
  // }
}
