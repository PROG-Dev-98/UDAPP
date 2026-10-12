import { Routes } from '@angular/router';
import { UserList } from './pages/user-list/user-list';
import { UserForm } from './pages/user-form/user-form';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    component: UserList
  },
  {
    path: 'users/add',
    component: UserForm
  },
  {
    path: 'users/edit/:id',
    component: UserForm
  },
  {
    path: '**',
    redirectTo: 'users'
  }
];