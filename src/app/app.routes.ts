import { Routes } from '@angular/router';
import { MainPageComponent } from './features/access/main-page/main-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent, data: { active: 'Main', scrollTo: '' } },
];
