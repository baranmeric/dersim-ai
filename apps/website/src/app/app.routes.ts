import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@org/chat').then(m => m.Chat),
  },
  {
    path: 'authenticate',
    loadComponent: () => import('@org/auth').then(m => m.Authenticate),
  },
  {
    path: '**',
    loadComponent: () => import('@org/chat').then(m => m.Chat),
  },
];
