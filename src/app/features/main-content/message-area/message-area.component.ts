import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MessageService } from '../../../shared/services/message.service';
import { Message } from '../../../shared/interfaces/message.interface';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-area',
  imports: [CommonModule],
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  private chatTypeSubject = new BehaviorSubject<'private' | 'channel' | 'thread'>('private');
  public readonly chatType$ = this.chatTypeSubject.asObservable();

  private chatIdSubject = new BehaviorSubject<string>('sEg8GcSNNZ6YWhxRs4SE');

  private messagesSubscription: Subscription = new Subscription();

  messages: Message[] = [];
  activeUserId: string | null = null;


  ngOnInit(): void {
    this.activeUserId = this.route.snapshot.paramMap.get('activeUserId');
    console.log('activeUserId:', this.activeUserId);    
    
    this.messagesSubscription = combineLatest([this.chatTypeSubject, this.chatIdSubject])
      .pipe(switchMap(([chatType, chatId]) => this.messageService.getMessages(chatType, chatId, this.activeUserId)))
      .subscribe((messages) => {
        this.messages = messages;
      });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  changeChat(newType: 'private' | 'channel' | 'thread', newId: string): void {
    this.chatTypeSubject.next(newType);
    this.chatIdSubject.next(newId);
  }

  

  // Beispiel-Daten für eine Nachricht
  testMessage(): void {
    console.log('Testnachricht wird erstellt...');   

    // const dummyMessage: Partial<Message> = {
    //   mText: 'Na dann, beim nächsten Meeting organisiere ich gleich ein kleines Nickerchen – moderne Selbstfürsorge eben!',
    //   mSenderId: 'sEg8GcSNNZ6YWhxRs4SE',
    //   mReactions: ['🌻', '❤️'],
    //   mUserId: 'Eg2jVLodTA9FI99IMJUK',
    //   mThreadId: '',
    //   mChannelId: '',      
    // };

    // this.messageService.createMessage(dummyMessage)
    //   .then(docRef => {
    //     console.log('Nachricht erstellt mit ID:', docRef.id);
    //   })
    //   .catch(error => {
    //     console.error('Fehler beim Erstellen der Nachricht:', error);
    //   });
  }
}
