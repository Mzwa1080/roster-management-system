import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  name: string = '';
  role: string = '';
  password: string = '';
  logInStatus = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.name, this.role).subscribe(
      (user: any) => {
        this.logInStatus = true;
        // Navigate based on user role
        if (this.authService.userRole('Developer')) {
          this.router.navigate(['/dashboard']);
        } else if (this.authService.userRole('Team Leader')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Access Denied: Invalid Role';
        }
      },
      (error) => {
        // Handle errors like incorrect credentials
        this.logInStatus = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    );
  }

  getDevRole(): boolean {
    return this.authService.userRole('developer');
  }

  getTeamLeader(): boolean {
    return this.authService.userRole('team leader');
  }

  logOut() {
    this.authService.logOut();
    this.logInStatus = false;
    this.router.navigate(['/login']); // Redirect to login after logout
  }
}
