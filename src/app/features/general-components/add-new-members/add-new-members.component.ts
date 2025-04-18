import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class AddNewMembersComponent {
  selectedOption: string = '';
  @Input() channelMembers: User[] = [];
  @Input() activeUserId!: string | null;
  @Input() channelId: any = '';
  @Input() channelName: string = '';
  @Input() showInput: boolean = true;
  @Input() channelDescription: string = '';
  @Output() close = new EventEmitter<void>();
  

  searchValue: string = '';
  searchText: string = '';
  memberInputAdd: string = '';
  memberInputImage: string = '';
  memberInputId: string = '';
  charCount:number = 0;
  showMember: boolean = false;
  memberAddElement: boolean = false;
  filteredMembers: User[] = [];

  constructor(private userService: UserService, private channelService: ChannelService) {}

  emitClose() {
    this.close.emit();
  }

  onKey(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchValue = input;
    this.charCount = input.length;
    if (this.charCount >= 3) {
      this.userService.getEveryUsers().subscribe((users: User[]) => {
        const memberIds = new Set(this.channelMembers.map(member => member.uId));
        this.filteredMembers = users.filter(user =>
          !memberIds.has(user.uId) && user.uName.toLowerCase().includes(this.searchValue)
        );
        this.showMember = this.filteredMembers.length > 0;
      });
    } else {
      this.filteredMembers = [];
      this.showMember = false;
    }
  }

  memberNameAdd(memberName: any, memberImage: any, memberId: any){
    this.memberInputAdd = memberName;
    this.memberInputImage = memberImage;
    this.memberInputId = memberId;
    this.memberAddElement = true;
    this.showMember = false;

  }
  
  inputNameClose(){
    this.memberAddElement = false;
    this.memberInputAdd = '';
    this.memberInputImage = '';
  }
  
  addNewChannelMember() {
    if (this.memberAddElement === true && this.channelId && this.memberInputId) {
      this.channelService.addUserToChannel(this.channelId, this.memberInputId)
      this.inputNameClose()
      this. emitClose()
        
    }
  }

  async createNewChannel(name: string, description: string) {
    if (!name || !this.activeUserId) return;

    try {
      const newChannelId = await this.channelService.createChannel(name, description, this.activeUserId);
      this.channelId = newChannelId;

    } catch (error) {
      console.error('Fehler beim Erstellen des Channels:', error);
    }
  }
 
}
