import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Tasks } from './pages/tasks/tasks';
import { Expenses } from './pages/expenses/expenses';

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
    path: 'expenses',
    component: Expenses
  },
  {
    path:'**',
    redirectTo:''
  }
];
