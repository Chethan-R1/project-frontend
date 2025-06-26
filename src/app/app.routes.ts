import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard'; // adjust path as needed

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'planning-table',
    loadComponent: () =>
      import('./components/planning-table/planning-table.component').then(
        (m) => m.PlanningTableComponent
      ),
  },
  {
    path: 'room/:roomId',
    canActivate: [authGuard], 
    loadComponent: () =>
      import('./components/voting/voting.component').then(
        (m) => m.VotingComponent
      ),
  },

  {
  path: 'create-account',
  loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
},
{
  path: 'login-user',
  loadComponent: () => import('./components/login-user/login-user.component').then(m => m.LoginUserComponent)
}

];
