import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    pathMatch: 'full',
  },
  {
    path:'tasks',
    component: Tasks
  },
  {
    path:'**',
    redirectTo:''
  }
];
