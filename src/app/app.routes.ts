import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportsComponent } from './components/reports/reports.component';
import { TeamsComponent } from './components/teams/teams.component';

export const routes: Routes = [
    {path: '', component: DashboardComponent},
    {path: 'reports', component: ReportsComponent},
    {path: 'teams', component: TeamsComponent}
];
