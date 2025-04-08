import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  where,
  orderBy,
  query,
  onSnapshot,
  Query,
  DocumentData,
  QuerySnapshot,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { addDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

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
    chatType: 'private' | 'channel' | 'thread' | 'new',
    chatId: string | null,
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
    chatId: string | null,
    activeUserId: string | null
  ): Observable<Message[]> {
    return new Observable<Message[]>(observer => {
      const [q1, q2] = this.createPrivateMessageQueries(chatId, activeUserId);
      let arr1: Message[] = [];
      let arr2: Message[] = [];
  
      const unsub1 = onSnapshot(q1, snap => {
        arr1 = this.mapDocsToMessages(snap);
        observer.next(this.mergeAndSort(arr1, arr2));
      });
      const unsub2 = onSnapshot(q2, snap => {
        arr2 = this.mapDocsToMessages(snap);
        observer.next(this.mergeAndSort(arr1, arr2));
      });
  
      return () => { unsub1(); unsub2(); };
    });
  }

  private createPrivateMessageQueries(
    chatId: string | null,
    activeUserId: string | null
  ): [Query<DocumentData>, Query<DocumentData>] {
    const col = collection(this.firestore, 'messages');
  
    const q1 = query(
      col,
      where('mUserId', '==', activeUserId),
      where('mSenderId', '==', chatId),
      orderBy('mTime', 'asc')
    );
    const q2 = query(
      col,
      where('mUserId', '==', chatId),
      where('mSenderId', '==', activeUserId),
      orderBy('mTime', 'asc')
    );
    return [q1, q2];
  }
  
  private mapDocsToMessages(snapshot: QuerySnapshot<DocumentData>): Message[] {
    return snapshot.docs.map(doc => this.setNoteObject(doc.data(), doc.id));
  }
  
  private mergeAndSort(arr1: Message[], arr2: Message[]): Message[] {
    const merged = [...arr1];
    arr2.forEach(msg => {
      if (!merged.find(m => m.mId === msg.mId)) {
        merged.push(msg);
      }
    });
    merged.sort((a, b) => this.getTimeValue(a) - this.getTimeValue(b));
    return merged;
  }
  
  private getTimeValue(msg: Message): number {
    if (msg.mTime instanceof Timestamp) {
      return msg.mTime.toDate().getTime();
    } else if (msg.mTime instanceof Date) {
      return msg.mTime.getTime();
    }
    return 0;
  }



  private getChannelMessages(chatId: string | null): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      const messagesCollection = collection(this.firestore, 'messages');
      

      const q = query(
        messagesCollection,
        where('mChannelId', '==', chatId),
        orderBy('mTime', 'asc')
      );

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

  private getThreadMessages(chatId: string | null): Observable<Message[]> {
    return new Observable<Message[]>((observer) => {
      const messagesCollection = collection(this.firestore, 'messages');
      const q = query(
        messagesCollection,
        where('mThreadId', '==', chatId),
        orderBy('mTime', 'asc')
      );
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

  createMessage(message: Partial<Message>): Promise<any> {
    const messagesCollection = collection(this.firestore, 'messages');
    const newMessage = {
      ...message,
      mTime: serverTimestamp(),
    };
    return addDoc(messagesCollection, newMessage);
  }

  editMessage(message: Partial<Message>): Promise<any>{
    if (!message.mId) {
      return Promise.reject(new Error('Message ID fehlt.'));
    }
    const messagesCollection = collection(this.firestore, 'messages');
    const messageRef = doc(messagesCollection, message.mId || '');
    return updateDoc(messageRef, {
      mReactions: message.mReactions,
    });
  }


}
