import { CommonModule} from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
import { User } from '../../../../shared/interfaces/user.interface';
import { ProfilComponent } from '../../../general-components/profil/profil.component';
import { AddNewMembersComponent } from '../../../general-components/add-new-members/add-new-members.component';
import { MemberListComponent } from '../../../general-components/member-list/member-list.component';


@Component({
  selector: 'app-channel-members',
  imports: [CommonModule, ProfilComponent, AddNewMembersComponent, MemberListComponent],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent implements OnChanges {
  @Input() channelMembers:  User[] = [];
  @Input() activeUserId: string | null = null;  
  @Input() channelId: any;
  @Input() channelName: any = '';
  @Input() activChannelMemberProfil: User | null = null;
  @Input() newChannelMembers: boolean = false;
  @Input() isChannelMemberProfilOpen: boolean = false;

  @Output() newChannelMembersChange = new EventEmitter<boolean>();
  @Output() activChannelMemberProfilChange = new EventEmitter<User | null>();
  @Output() isChannelMemberProfilOpenChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('channelWrapper') channelWrapper?: ElementRef;
  @ViewChild('memberAddWrapper') memberAddWrapper?: ElementRef;

  
  ngOnChanges(changes: SimpleChanges) {  
    if (changes['channelMembers']) {
      console.log(
        'Channel Members in ngOnChanges:',
        changes['channelMembers'].currentValue
      );
    }
  }

  closeChannelMembers() {
    this.close.emit();
  }
 
  onMainClick(event: MouseEvent) {
    const insideSection = this.channelWrapper?.nativeElement?.contains(event.target);
    const clickedInsideAddMember = this.memberAddWrapper?.nativeElement?.contains(event.target);
  
    if (!insideSection && !clickedInsideAddMember) {
      this.newChannelMembers = false;
    }
  }


  toggleMemberProfil(member?: User) {
    const isOpen = !this.isChannelMemberProfilOpen;
    this.isChannelMemberProfilOpen = isOpen;
    this.activChannelMemberProfil = member || null;
    this.isChannelMemberProfilOpenChange.emit(isOpen);
    this.activChannelMemberProfilChange.emit(this.activChannelMemberProfil);
  }
    
  addChannelMember() {
    this.newChannelMembers = true;
    this.newChannelMembersChange.emit(true);
  }
}
