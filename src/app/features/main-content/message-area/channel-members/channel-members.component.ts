import { CommonModule} from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
import { User } from '../../../../shared/interfaces/user.interface';
import { ProfilComponent } from '../../../general-components/profil/profil.component';
import { AddNewMembersComponent } from '../../../general-components/add-new-members/add-new-members.component';


@Component({
  selector: 'app-channel-members',
  imports: [CommonModule, ProfilComponent, AddNewMembersComponent],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent implements OnChanges {
  @Input() channelMembers:  User[] = [];
  @Input() activeUserId: string | null = null;  
  @Input() channelId: any;
  @Input() channelName: any = '';
  @Output() close = new EventEmitter<void>();
  @ViewChild('channelWrapper') channelWrapper?: ElementRef;
  @ViewChild('memberAddWrapper') memberAddWrapper?: ElementRef;

  

  activChannelMemberProfil: User | null = null;
  newChannelMembers: boolean = false;
  isChannelMemberProfilOpen: boolean = false;

  


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
      this.close.emit();
    }
  }

  toggleMemberProfil(member?: User) {
    console.log('Clicked on member:', member);
    
    this.isChannelMemberProfilOpen = !this.isChannelMemberProfilOpen;
    if (member) {
      this.activChannelMemberProfil = member;
    }
    else {
      this.activChannelMemberProfil = null;
    }
  }
 

  addChannelMember(channelId: any) {
    this.newChannelMembers = true;
  }
  

}
