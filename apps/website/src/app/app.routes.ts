import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@dersim/website/chat').then(m => m.Chat),
  },
  {
    path: 'authenticate',
    loadComponent: () => import('@dersim/website/auth').then(m => m.Authenticate),
  },
  {
    path: '**',
    loadComponent: () => import('@dersim/website/chat').then(m => m.Chat),
  },
];
