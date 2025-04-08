import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, Input } from '@angular/core';
import { ProfilComponent } from '../../../general-components/profil/profil.component';
import { ActivatedRoute } from '@angular/router';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { User } from '../../../../shared/interfaces/user.interface';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-user-name',
  standalone: true,
  imports: [CommonModule, ProfilComponent],
  templateUrl: './user-name.component.html',
  styleUrl: './user-name.component.scss'
})
export class UserNameComponent {
  isLogOutVisible: boolean = false;
  showProfil: boolean = false;
  @Input() activeUserId!: string | null;

  userName: string = '';
  userEmail: string = '';
  userImage: string = '';

  @ViewChild('logOutBox') logOutBox?: ElementRef;
  @ViewChild('toggleBtn') toggleBtn?: ElementRef;
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('activeUserId');
    if (!userId) return;

    const usersCollection = collection(this.firestore, 'users');
    collectionData(usersCollection, { idField: 'uId' })
      .pipe(
        map((users: any[]) => users.find(user => user.uId === userId))
      )
      .subscribe(user => {
        if (user) {
          this.userName = user.uName;
          this.userEmail = user.uEmail;
          this.userImage = user.uUserImage;
        }
      });    
  }

  toggleLogOut() {
    this.isLogOutVisible = !this.isLogOutVisible;
    setTimeout(() => {}, 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideLogOut = this.logOutBox?.nativeElement?.contains(event.target);
    const clickedToggleBtn = this.toggleBtn?.nativeElement?.contains(event.target);
    const clickedInsideProfil = this.profilWrapper?.nativeElement?.contains(event.target);

    if (!clickedInsideLogOut && !clickedToggleBtn && !clickedInsideProfil) {
      this.isLogOutVisible = false;
    }
  }

  openProfil() {
    this.showProfil = true;
  }
}

