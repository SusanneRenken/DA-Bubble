import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MessageService } from '../../../shared/services/message.service';
import { Message } from '../../../shared/interfaces/message.interface';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { User } from '../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-message-area',
  imports: [CommonModule, MessageComponent],
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  @Input() setChatType!: BehaviorSubject<'private' | 'channel' | 'thread' | 'new'>;
  @Input() setChatId!: BehaviorSubject<string | null>;
  @Input() activeUser!: User;

  
  public chatType$!: Observable<'private' | 'channel' | 'thread' | 'new'>;
  private messagesSubscription: Subscription = new Subscription();

  messages: Message[] = [];


  ngOnInit(): void {
    this.chatType$ = this.setChatType.asObservable();
    
    this.messagesSubscription = combineLatest([this.setChatType, this.setChatId])
      .pipe(switchMap(([chatType, chatId]) => this.messageService.getMessages(chatType, chatId, this.activeUser?.uId)))
      .subscribe((messages) => {
        this.messages = messages;
      });

      console.log('Active User in message-area:', this.activeUser);
      
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
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
