import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListCandidateComponent } from './pages/list-candidate/list-candidate.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  {
    path: 'list-candidate',
    component: ListCandidateComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
];
