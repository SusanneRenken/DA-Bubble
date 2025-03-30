import { inject, Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../interfaces/message.interface';


@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(AngularFirestore);

  private messagesCollection: AngularFirestoreCollection<Message> = 
    this.firestore.collection<Message>('messages', ref => ref.orderBy('mTime', 'asc'));

  getMessageCollection(): Observable<Message[]> {
    return this.messagesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Message;
        const id = a.payload.doc.id;
        return { mId: id, ...data };
      }))
    );
  }


  



}
