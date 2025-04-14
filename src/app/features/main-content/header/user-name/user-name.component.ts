import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, Input} from '@angular/core';
import { ProfilComponent } from '../../../general-components/profil/profil.component';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { DeviceVisibleComponent } from '../../../../shared/services/responsive';

@Component({
  selector: 'app-user-name',
  standalone: true,
  imports: [CommonModule, ProfilComponent, DeviceVisibleComponent],
  templateUrl: './user-name.component.html',
  styleUrl: './user-name.component.scss',
})

export class UserNameComponent {
  isLogOutVisible: boolean = false;
  showProfil: boolean = false;
  userStatus: boolean | string = false;
  @Input() activeUserId!: string | null;
  userName: string = '';
  userEmail: string = '';
  userImage: string = '';
  @ViewChild('tabletToggleBtn') tabletToggleBtn?: ElementRef;
  @ViewChild('arrowToggleBtn') arrowToggleBtn?: ElementRef;
  @ViewChild('logOutBox') logOutBox?: ElementRef;
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}


  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('activeUserId');
    if (!userId) return;
    const usersCollection = collection(this.firestore, 'users');
    collectionData(usersCollection, { idField: 'uId' })
      .pipe(map((users: any[]) => users.find((user) => user.uId === userId)))
      .subscribe((user) => {
        if (user) {
          this.userName = user.uName;
          this.userEmail = user.uEmail;
          this.userImage = user.uUserImage;
          this.userStatus = user.uStatus;
        }
      });
  }


  toggleLogOut() {    
    this.isLogOutVisible = !this.isLogOutVisible;
    setTimeout(() => {}, 0);
    console.log(this.isLogOutVisible);
    
  }

  toggleImage(){
    this.toggleLogOut()
  }


  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const clickedInsideLogOut = this.logOutBox?.nativeElement?.contains(event.target);
  const clickedToggleTablet = this.tabletToggleBtn?.nativeElement?.contains(event.target);
  const clickedArrow = this.arrowToggleBtn?.nativeElement?.contains(event.target);
  const clickedInsideProfil = this.profilWrapper?.nativeElement?.contains(event.target);
  if (
    !clickedInsideLogOut &&
    !clickedToggleTablet &&
    !clickedArrow &&
    !clickedInsideProfil
  ) {
    this.isLogOutVisible = false;
  }
}

  
  openProfil() {
    this.showProfil = true;
  }
}
