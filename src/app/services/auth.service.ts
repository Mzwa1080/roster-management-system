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
  userName = new BehaviorSubject<string | null>(null);

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
          this.userLoggedIn.next(true); // changing the state of the user logged in
          this.userName.next(name) //name of the user logged in
          
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
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('CurrentUser');
      this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    }
    return this.currentUser;
  }
  

  logOut() {
    localStorage.removeItem('CurrentUser');
    this.userLoggedIn.next(false);
    this.router.navigate(['/login']) 
    this.currentUser = null;
    this.userName.next(null)
  }
}
