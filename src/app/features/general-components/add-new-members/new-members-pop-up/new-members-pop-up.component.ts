import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/interfaces/user.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-members-pop-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-members-pop-up.component.html',
  styleUrl: './new-members-pop-up.component.scss',
})

export class NewMembersPopUpComponent implements OnInit{
  @Input() channelMembers: User[] = [];
  @Input() memberAddElement: boolean = false;
  @Input() memberInputId: any;
  @Input() showMember: boolean = false;
  @Input() memberInputAdd: string = '';
  @Input() memberInputImage: string = '';
  @Output() memberNameAddEvent = new EventEmitter<{ name: string, image: string, id: string }>();
  @Output() inputNameCloseEvent = new EventEmitter<void>();

  searchValue: string = '';
  searchText: string = '';
  charCount: number = 0;
  filteredMembers: User[] = [];

  constructor(private userService: UserService) {}



  async ngOnInit() {
    // alle User aus Firestore laden
    this.channelMembers = await this.userService.allUsers();
    // für den ersten Fokus schon mal bereitstellen
    this.filteredMembers = [...this.channelMembers];
  }

  onInputFocus() {
    this.filteredMembers = [...this.channelMembers];
    this.showMember = this.filteredMembers.length > 0;
  }


  
  onKey(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchValue = input;
    this.charCount = input.length;

    if (this.charCount === 0) {
      this.filteredMembers = [...this.channelMembers];
      this.showMember = true;
    } else if (this.charCount >= 3) {
      this.filteredMembers = this.channelMembers.filter(u =>
        u.uName.toLowerCase().includes(this.searchValue)
      );
      this.showMember = this.filteredMembers.length > 0;
    } else {
      this.filteredMembers = [];
      this.showMember = false;
    }
  }

  onInputBlur() {
    setTimeout(() => this.showMember = false, 100);
  }

  memberNameAdd(name: string, image: string, id: string) {
    console.log(name, image, id);
    
    this.showMember = false;
  }
  inputNameClose(): void {
    this.inputNameCloseEvent.emit();
  }

  trackById(_: number, u: User) { return u.uId; }
}

