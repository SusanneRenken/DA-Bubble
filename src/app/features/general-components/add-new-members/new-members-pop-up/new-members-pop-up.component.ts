import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
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

export class NewMembersPopUpComponent {
  @Input() channelMembers: User[] = [];
  @Input() memberAddElement: boolean = false;
  @Input() memberInputId: string = '';
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

  
  onKey(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchValue = input;
    this.charCount = input.length;
    if (this.charCount >= 3) {
      this.userService.getEveryUsers().subscribe((users: User[]) => {
        const memberIds = new Set( this.channelMembers.map((member) => member.uId) );
        this.filteredMembers = users.filter(
          (user) =>
            !memberIds.has(user.uId) &&
            user.uName.toLowerCase().includes(this.searchValue)
        );
        this.showMember = this.filteredMembers.length > 0;
      });
    } else {
      this.filteredMembers = [];
      this.showMember = false;
    }
  }


  memberNameAdd(memberName: string, memberImage: string, memberId: any): void {
    this.memberNameAddEvent.emit({ name: memberName, image: memberImage, id: memberId });
    this.showMember = false;
  }
  

  inputNameClose(): void {
    this.inputNameCloseEvent.emit();
  }
}
