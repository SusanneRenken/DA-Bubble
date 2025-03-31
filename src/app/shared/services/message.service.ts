import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Message } from '../interfaces/message.interface';
import { collection, doc, onSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(Firestore);

  messages: Message[] = [];

  unsubMessages;

  constructor() {
    this.unsubMessages = onSnapshot(this.getMessagesRef(), (list) => {
      this.messages = [];
      list.forEach((element) => {
        console.log('Nachricht aus dem Constructor', element.data());
        this.messages.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  ngOnDestroy(): void {
    this.unsubMessages();
  }

  setNoteObject(obj: any, id: string): Message {
    return {
      mId: id || '',
      mText: obj.mText || '',
      mReactions: obj.mReactions || '',
      mTime: obj.mTime || new Date(),
      mSenderId: obj.mSenderId || '',
      mUserId: obj.mUserId || '',
      mThreadId: obj.mThreadId || '',
      mChannelId: obj.mChannelId || '',
    };
  }

  getMessagesRef() {
    return collection(this.firestore, 'messages');
  }

  getMessageRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
