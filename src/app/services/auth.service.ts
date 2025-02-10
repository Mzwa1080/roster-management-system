import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'https://mzwa1080.github.io/roster-data/data/data.json';
  private currentUser: any = null;
  userLoggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router:Router) {
    const storedUser = localStorage.getItem('CurrentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      
      this.userLoggedIn.next(true); 
    }
  }

  login(name: string, role: string): Observable<any> {
    return this.http.get<any>(this.url).pipe(
      map((data: any) => {
        const user = data.members.find((user: any) =>
          user.name === name && user.role === role
        );
        if (user) {
          this.currentUser = user;
          localStorage.setItem('CurrentUser', JSON.stringify(user));
          this.userLoggedIn.next(true); 
          return user;
        } else {
          throw new Error('User not found or invalid role');
        }
      })
    );
  }

  userRole(role: string): boolean {
    return this.currentUser && this.currentUser.role === role;
  }

  getCurrentUser(): any {
    const storedUser = localStorage.getItem('CurrentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  logOut() {
    localStorage.removeItem('CurrentUser');
    this.userLoggedIn.next(false);
    this.router.navigate(['/login']) 
    this.currentUser = null
  }
}
