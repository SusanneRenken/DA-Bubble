import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/interfaces/user.interface';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-new-members-pop-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-members-pop-up.component.html',
  styleUrl: './new-members-pop-up.component.scss',
})

export class NewMembersPopUpComponent implements OnInit{
  searchValue: string = '';
  charCount: number = 0;
  filteredMembers: User[] = [];
  selectedMembers: User[] = [];
  selectedUser?: User; 
  displayCount = 2;

  @Input() channelMembers: User[] = [];
  @Input() memberAddElement: boolean = false;
  @Input() memberInputId: any;
  @Input() showMember: boolean = false;
  @Input() memberInputAdd: string = '';
  @Input() memberInputImage: string = '';
  @Output() memberNameAddEvent    = new EventEmitter<string>();
  @Output() memberNameRemoveEvent = new EventEmitter<string>();
  @Output() inputNameCloseEvent = new EventEmitter<void>();

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router, private breakpoint: BreakpointObserver) {}

  async ngOnInit() {
    this.breakpoint
      .observe(['(max-width: 600px)'])
      .subscribe(state => {
        this.displayCount = state.matches ? 1 : 2;
      });
      const currentUserId = this.getUserIdFromUrl();
      const allUsers = await this.userService.allUsers();
      if (currentUserId) {
        this.selectedUser = allUsers.find(u => u.uId === currentUserId) ?? undefined;
        this.channelMembers = allUsers.filter(u => u.uId !== currentUserId);
      } else {
        this.channelMembers = allUsers;
      }
      this.filteredMembers = [...this.channelMembers];
  }


  private getUserIdFromUrl(): string | null {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      return paramId;
    }
    const path = this.router.url.split('?')[0];
    const segments = path.split('/');
    return segments.length ? segments.pop()! : null;
  }


  onFocusOut(event: FocusEvent): void {
    const toElement = event.relatedTarget as HTMLElement | null;
    const container = event.currentTarget as HTMLElement;
    if (toElement && container.contains(toElement)) {
      return;
    }
    this.showMember = false;
  }


  onInputFocus(): void {    
    this.filteredMembers = [...this.channelMembers];
    this.showMember = true;
  }

  
  onKey(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchValue = input;
    if (input.length === 0) {
      this.filteredMembers = [...this.channelMembers];
    } else {    
      this.filteredMembers = this.channelMembers
        .filter(u => u.uName.toLowerCase().includes(input));
    }
  }
  

  toggleMember(member: User): void {
    if (this.isSelected(member)) {
      this.removeMember(member);
      this.selectedMembers = this.selectedMembers.filter(m => m.uId !== member.uId);
      this.memberNameRemoveEvent.emit(member.uId!);
    } else {
      this.selectedMembers.push(member);
      this.memberNameAddEvent.emit(member.uId!);
    }
    if (this.searchValue.length > 0) {    
      this.memberAddElement = true;
      this.showMember = false;
    }
    if (this.selectedMembers.length > 0 && this.searchValue.length === 0) {
      this.showMember = true;
      this.memberAddElement = true;
    }
  }
  

  removeMember(member: User): void {  
    this.selectedMembers = this.selectedMembers.filter(m => m.uId !== member.uId);
    this.memberNameRemoveEvent.emit(member.uId!);
    if (this.selectedMembers.length === 0) {     
      this.searchValue = '';
      this.filteredMembers = [...this.channelMembers];
      this.showMember = true;
      this.memberAddElement = false;
    }
  }


  isSelected(member: User): boolean {
    return this.selectedMembers.some(m => m.uId === member.uId);
  }


  trackById(_: number, u: User) { return u.uId; }
}

