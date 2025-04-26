import { Component } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { AuthentificationService } from '../../../shared/services/authentification.service';
import { SuccessIndicatorComponent } from '../../general-components/success-indicator/success-indicator.component';

@Component({
  selector: 'app-select-avatar',
  imports: [ButtonComponent, SuccessIndicatorComponent],
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss',
})
export class SelectAvatarComponent {
  avatars = [
    'avatar-1.png',
    'avatar-2.png',
    'avatar-3.png',
    'avatar-4.png',
    'avatar-5.png',
    'avatar-6.png',
  ];
  selectedAvatar: string | null = null;
  username: string | undefined | null = null;
  isConfirmationVisible: boolean = false;

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private authService: AuthentificationService
  ) {
    this.username = this.authService.registrationData?.username;
  }

  goBack() {
    this.authService.registrationData = null;
    this.changeComponent('signin');
  }

  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  onNext(): void {
    if (!this.selectedAvatar) {
      console.error('No avatar selected!');
      return;
    }
    this.authService.completeRegistration(this.selectedAvatar)
      .then(() => {
        this.isConfirmationVisible = true;
        setTimeout(() => this.isConfirmationVisible = false, 2000);
        setTimeout(() => this.changeComponent('login'), 3000);
      })
      .catch((error) => {
        console.error('Error when adding the profile picture: ', error);
      }
    );
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
