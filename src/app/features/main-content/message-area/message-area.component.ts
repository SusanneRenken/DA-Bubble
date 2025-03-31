import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MessageService } from '../../../shared/services/message.service';
import { Message } from '../../../shared/interfaces/message.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-message-area',
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  private chatTypeSubject = new BehaviorSubject<'private' | 'channel' | 'thread'>('private');
  private chatIdSubject = new BehaviorSubject<string>('sEg8GcSNNZ6YWhxRs4SE');

  messages: Message[] = [];
  private messagesSubscription: Subscription = new Subscription();

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

  testMessage(): void {
    console.log('Nachrichten:', this.messages);
  }
}
