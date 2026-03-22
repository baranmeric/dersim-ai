import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@dersim/chat').then(m => m.Chat),
  },
  {
    path: 'authenticate',
    loadComponent: () => import('@dersim/auth').then(m => m.Authenticate),
  },
  {
    path: '**',
    loadComponent: () => import('@dersim/chat').then(m => m.Chat),
  },
];
