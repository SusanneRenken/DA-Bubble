import { Routes } from '@angular/router';
<<<<<<< HEAD
import { MainPageComponent } from './features/access/main-page/main-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent, data: { active: 'Main', scrollTo: '' } },
=======
import { AccessComponent } from './features/access/access.component';
import { MainContentComponent } from './features/main-content/main-content.component';

export const routes: Routes = [
  { path: '', component: AccessComponent },
  { path: 'home', component: MainContentComponent },
  { path: 'home/:userId', component: MainContentComponent },
>>>>>>> main
];
