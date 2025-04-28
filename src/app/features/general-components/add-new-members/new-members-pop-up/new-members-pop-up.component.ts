import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, SimpleChanges, OnChanges } from '@angular/core';
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

export class NewMembersPopUpComponent implements OnInit, OnChanges{
  searchValue: string = '';
  charCount: number = 0;
  filteredMembers: User[] = [];
  selectedMembers: User[] = [];
  availableMembers: User[] = [];
  selectedUser?: User; 
  displayCount = 1;

  @Input() channelMembers: User[] = [];
  @Input() memberAddElement: boolean = false;
  @Input() memberInputId: any;
  @Input() showMember: boolean = false;
  @Input() memberInputAdd: string = '';
  @Input() memberInputImage: string = '';
  @Output() memberNameAddEvent    = new EventEmitter<string>();
  @Output() memberNameRemoveEvent = new EventEmitter<string>();
  @Output() inputNameCloseEvent = new EventEmitter<void>();
  @ViewChild('memberInput', { static: true }) memberInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('containerDelete', { read: ElementRef })
    pills!: QueryList<ElementRef<HTMLDivElement>>;
  private resizeObserver!: ResizeObserver;

  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router, private breakpoint: BreakpointObserver) {}
  
  ngOnInit() {
    this.rebuildAvailableList();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['channelMembers']) {
      this.rebuildAvailableList();
    }
  }

  private async rebuildAvailableList() {
    const allUsers = await this.userService.allUsers();
    const existingIds = new Set(this.channelMembers.map(u => u.uId));
    this.availableMembers = allUsers.filter(u => !existingIds.has(u.uId));
    this.filteredMembers  = [...this.availableMembers];
  }


  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => this.updateDisplayCount());
    this.resizeObserver.observe(this.memberInput.nativeElement);
    this.updateDisplayCount();
    this.pills.changes.subscribe(() => this.updateDisplayCount());
  }


  ngOnDestroy() {
    this.resizeObserver.disconnect();
  }


  private updateDisplayCount() {
    const containerW = this.memberInput.nativeElement.clientWidth;
    const pillsArr = this.pills.toArray();
    if (!pillsArr.length) {
      this.displayCount = 1;
      return;
    }
    const pillEl = pillsArr[0].nativeElement;
    const style   = getComputedStyle(pillEl);
    const totalPillW =
      pillEl.offsetWidth +
      parseFloat(style.marginLeft) +
      parseFloat(style.marginRight);
    const rawCount = Math.floor(containerW / totalPillW);
    this.displayCount = Math.max(1, Math.min(rawCount, 2));
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
    this.filteredMembers = [...this.availableMembers];
    this.showMember = true;
  }

  
  onKey(event: KeyboardEvent): void {
    const input = (event.target as HTMLInputElement)
    .value.trim().toLowerCase();
    this.searchValue = input;
    if (!input) {
      this.filteredMembers = [...this.availableMembers];
    } else {
      this.filteredMembers = this.availableMembers.filter(u =>
        u.uName.toLowerCase().startsWith(input)
      );
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
      this.filteredMembers = [...this.availableMembers];
      this.showMember = true;
      this.memberAddElement = false;
    }
  }


  isSelected(member: User): boolean {
    return this.selectedMembers.some(m => m.uId === member.uId);
  }


  trackById(_: number, u: User) { return u.uId; }
}
