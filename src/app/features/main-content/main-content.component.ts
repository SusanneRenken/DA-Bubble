import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ContactBarComponent } from './contact-bar/contact-bar.component';
import { MessageAreaComponent } from './message-area/message-area.component';
import { BehaviorSubject } from 'rxjs';

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

  setChatType = new BehaviorSubject<'private' | 'channel' | 'thread' | 'new'>('private');  
  // muss später getauscht werden:
  // setChatId = new BehaviorSubject<string | null>('');
  setChatId = new BehaviorSubject<string | null>('sEg8GcSNNZ6YWhxRs4SE');
  setThreadId = new BehaviorSubject<string | null>('');

  activeUserId: string | null = null;
  isThreadOpen: boolean = false;
  sectionVisible = true;


  ngOnInit(): void {
    this.activeUserId = this.route.snapshot.paramMap.get('activeUserId');
     
    // muss später aktiviert werden:
    // this.setChatId.next(this.activeUserId);
    
  }

  toggleSection() {
    this.sectionVisible = !this.sectionVisible;
  }
  
  changeChat(newType: 'private' | 'channel' | 'thread' | 'new', newId: string): void {
    this.setChatType.next(newType);
    this.setChatId.next(newId);
  }
}