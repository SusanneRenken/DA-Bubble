import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, ViewChild, ViewChildren, ElementRef, QueryList, OnChanges, OnInit } from '@angular/core';
import { User } from '../../../shared/interfaces/user.interface';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-new-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-new-members.component.html',
  styleUrl: './add-new-members.component.scss'
})

export class AddNewMembersComponent implements OnInit, OnChanges{
  searchValue: string = '';
  charCount: number = 0;
  filteredMembers: User[] = [];
  selectedMembers: User[] = [];
  availableMembers: User[] = [];

  displayCount = 1;
  selectedOption: string = '';


  @Input() channelMembers: User[] = [];
  @Input() activeUserId!: string | null;
  @Input() channelId: any = '';
  @Input() channelName: any = '';
  @Input() showInput: boolean = true;
  @Input() channelDescription: string = '';
  @Input() showXLine: boolean = false; 
  @Output() close = new EventEmitter<void>();
 



  @Output() memberNameAddEvent    = new EventEmitter<string>();
  @Output() memberNameRemoveEvent = new EventEmitter<string>();
 

  
  @ViewChild('memberInput', { static: false })memberInput?: ElementRef<HTMLElement>;
  @ViewChildren('containerDelete', { read: ElementRef })pills!: QueryList<ElementRef<HTMLDivElement>>;
  
  
  memberAddElement: boolean = false;
  memberInputId: string = '';
  memberInputAdd: string = '';
  memberInputImage: string = '';
  showMember: boolean = false;
  selectedUserIds: string[] = [];
  private resizeObserver?: ResizeObserver;




  constructor(private channelService: ChannelService, private userService: UserService) {}




  onFocusOut() {
    this.showMember = false;
    
  }

  onInputFocus(): void {
    this.filteredMembers = [...this.availableMembers];
    this.showMember = true;
  }

  


















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
    if (this.memberInput) {
      this.resizeObserver = new ResizeObserver(() => this.updateDisplayCount());
      this.resizeObserver.observe(this.memberInput.nativeElement);
      this.updateDisplayCount();
  
      this.pills.changes.subscribe(() => this.updateDisplayCount());
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }


  private updateDisplayCount() {
    if (!this.memberInput) return;
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

  emitClose() {
    this.close.emit();
  }

    memberNameAdd(memberName: string, memberImage: string, memberId: string) {
    this.memberInputAdd   = memberName;
    this.memberInputImage = memberImage;
    this.memberInputId    = memberId;
    console.log(this.memberInputId);
    
    if (!this.selectedUserIds.includes(memberId)) {
      this.selectedUserIds.push(memberId);
    }
  
    this.memberAddElement = true;
    this.showMember       = false;
  }
  

  inputNameClose(): void {
    this.memberAddElement = false;
    this.memberInputAdd = '';
    this.memberInputImage = '';
    this.memberInputId = '';
  }


  async addNewChannelMembers() {
    if (!this.channelId || this.selectedUserIds.length === 0) return;
    try {
      await this.channelService.addUsersToChannel(
        this.channelId,
        ...this.selectedUserIds
      );
      this.selectedUserIds = [];
      this.close.emit();
    } catch (err) {}
  }  

  async createNewChannel(name: string, description: string) {
    if (!name || !this.activeUserId) return;
    const ids = [...this.selectedUserIds];
    if (!ids.includes(this.activeUserId)) {
      ids.unshift(this.activeUserId);
    }
    const newChannelId = await this.userService.createChannelWithUsers(
      name,
      description,
      this.activeUserId,
      ids
    );
    this.emitClose()
  }
  

  onMemberAdded(userId: string) {
    if (!this.selectedUserIds.includes(userId)) {
      this.selectedUserIds.push(userId);
    }
  }
  

  onMemberRemoved(userId: string) {
    this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
  }
}
