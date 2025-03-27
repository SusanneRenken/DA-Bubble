import { Routes } from '@angular/router';
import { AccessComponent } from './features/access/access.component';
import { MainContentComponent } from './features/main-content/main-content.component';

export const routes: Routes = [
  { path: '', component: AccessComponent },
  { path: 'home', component: MainContentComponent },
  { path: 'home/:userId', component: MainContentComponent },
];
