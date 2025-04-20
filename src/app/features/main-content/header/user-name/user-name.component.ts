import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, Input, inject} from '@angular/core';
import { ProfilComponent } from '../../../general-components/profil/profil.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceVisibleComponent } from '../../../../shared/services/responsive';
import { AuthentificationService } from '../../../../shared/services/authentification.service';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-user-name',
  standalone: true,
  imports: [CommonModule, ProfilComponent, DeviceVisibleComponent],
  templateUrl: './user-name.component.html',
  styleUrl: './user-name.component.scss',
})

export class UserNameComponent {
  private authService = inject(AuthentificationService);
  @Input() activeUserId!: string | null;
  isLogOutVisible: boolean = false;
  showProfil: boolean = false;
  userStatus: boolean | string = false;
  userName: string = '';
  userEmail: string = '';
  userImage: string = '';
  animateOut = false;
  @ViewChild('tabletToggleBtn') tabletToggleBtn?: ElementRef;
  @ViewChild('arrowToggleBtn') arrowToggleBtn?: ElementRef;
  @ViewChild('logOutBox') logOutBox?: ElementRef;
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}


  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('activeUserId');
    if (!userId) return;
    this.userService.getUserById(userId).subscribe((user) => {
      if (user) {
        this.userName = user.uName;
        this.userEmail = user.uEmail;
        this.userImage = user.uUserImage;
        this.userStatus = user.uStatus;
      }
    });
  }
  

  toggleLogOut() {
    if (this.isLogOutVisible) {
      this.animateOut = true;
      setTimeout(() => {
        this.isLogOutVisible = false;
        this.animateOut = false;
      }, 800);
    } else {
      this.isLogOutVisible = true;
    }
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
    const clickedOutside = !clickedInsideLogOut && !clickedToggleTablet && !clickedArrow && !clickedInsideProfil;
    if (this.isLogOutVisible && clickedOutside) {
      this.animateOut = true;
      setTimeout(() => {
        this.isLogOutVisible = false;
        this.animateOut = false;
      }, 800);
    }
  }

  
  openProfil() {
    this.showProfil = true;
  }

  
  logOut(){
    this.authService.logout();
    this.router.navigate(['/access']); 
  }
}
