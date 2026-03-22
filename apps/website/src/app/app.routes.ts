import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./page/home/home').then(m => m.Home),
    },
    {
        path: 'authenticate',
        loadComponent: () => import('./page/authenticate/authenticate').then(m => m.Authenticate),
    },
    {
        path: '**',
        loadComponent: () => import('./page/home/home').then(m => m.Home),
    }
];
