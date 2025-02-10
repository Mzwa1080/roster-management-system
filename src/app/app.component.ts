import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'dev-box-roster';
  developers: any[] =[]
  schedule  : any = {};
  todaySchedule: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  navBar : boolean = false;

  constructor(private dataService:DataService, private authService: AuthService, private router:Router){}
  
  loadSchedule(){
    this.todaySchedule = this.schedule[this.selectedDate] || [];
  }
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Retrieved user from storage:', currentUser); 

    if (currentUser) {
      this.navBar = true; 
    } else {
      this.navBar = false;
    }


    
      this.dataService.getRosterData().subscribe(data =>{
        this.developers = data.members;
        this.schedule = data.schedule;
        this.loadSchedule()
      })

      this.authService.userLoggedIn.subscribe(status => {
        this.navBar = status;
      });
  }

  getDeveloperName(id: number):string{
    const dev = this.developers.find(dev => dev.developerId ===id)
    if(dev){
      return dev.name;
    }else{
      return "Developer not found!"
    }
  }

  getDeveloperRole():boolean{
    return this.authService.userRole('Developer')
  }
  getTeamLeaderRole():boolean{
    return this.authService.userRole('Team Leader')
  }




  logOut() {
    this.authService.logOut(); 
    this.router.navigate(['/login']);
  }
  
}
