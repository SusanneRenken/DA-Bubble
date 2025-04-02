import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ContactBarComponent } from './contact-bar/contact-bar.component';
import { MessageAreaComponent } from './message-area/message-area.component';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/interfaces/user.interface';

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
  private userService = inject(UserService);

  setChatType = new BehaviorSubject<'private' | 'channel' | 'thread' | 'new'>(
    'private'
  );  
  // muss später getauscht werden:
  // setChatId = new BehaviorSubject<string | null>('');
  setChatId = new BehaviorSubject<string | null>('sEg8GcSNNZ6YWhxRs4SE');

  setThreadId = new BehaviorSubject<string | null>('');

  activeUserId: string | null = null;
  activeUser: User = {
    uId: '',
    uName: 'Unbekannter Nutzer',
    uEmail: '',
    uPassword: '',
    uStatus: '', 
    uUserImage: '',
  };
  isThreadOpen: boolean = false;
  sectionVisible = true;


  ngOnInit(): void {
    this.activeUserId = this.route.snapshot.paramMap.get('activeUserId');
    this.getUserData(this.activeUserId);
    
    // muss später aktiviert werden:
    // this.setChatId.next(this.activeUserId);
    
  }

  getUserData(activeUserId: any) {
    this.userService.getUser(activeUserId)
      .then((userData) => {
        this.activeUser = userData;
        console.log('activeUser (nach Laden):', this.activeUser);
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Users:', error);
      });
  }

  toggleSection() {
    this.sectionVisible = !this.sectionVisible;
  }
  
  changeChat(newType: 'private' | 'channel' | 'thread' | 'new', newId: string): void {
    this.setChatType.next(newType);
    this.setChatId.next(newId);
  }
}