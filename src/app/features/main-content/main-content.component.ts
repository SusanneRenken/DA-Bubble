import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ContactBarComponent } from './contact-bar/contact-bar.component';
import { MessageAreaComponent } from './message-area/message-area.component';
import { BehaviorSubject } from 'rxjs';
import { FlatESLint } from 'eslint/use-at-your-own-risk';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ContactBarComponent,
    MessageAreaComponent,
  ],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
})
export class MainContentComponent {
  private route = inject(ActivatedRoute);

  activeUserId: string | null = null;

  chatType: 'private' | 'channel' | 'thread' | 'new' = 'channel';
  // muss später getauscht werden:
  chatId: string | null = 'KV14uSorBJhrWW92IeDS';
  // chatId: string | null = 'sEg8GcSNNZ6YWhxRs4SE';

  // chatId: string | null = null;
  threadId: string | null = null;
  isThreadOpen: boolean = false;

  sectionVisible = true;

  ngOnInit(): void {
    this.activeUserId = this.route.snapshot.paramMap.get('activeUserId');

    // muss später aktiviert werden:
    // this.chatId = this.activeUserId;
  }

  toggleSection() {
    this.sectionVisible = !this.sectionVisible;
  }

  handleOpenChat(eventData: { chatType: 'private' | 'channel'; chatId: string }) {
    this.chatType = eventData.chatType;
    this.chatId = eventData.chatId;
    this.isThreadOpen = false;
    this.threadId = '';
  }

  openThread(threadId: string) {
    this.isThreadOpen = true;
    this.threadId = threadId;
  }
}
