import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from './services/data.service';
import { HttpClient } from '@angular/common/http';
import { GoogleChartsModule } from 'angular-google-charts';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'dev-box-roster';
  developers: any[] =[]
  schedule  : any = {};
  todaySchedule: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(private dataService:DataService){}
  loadSchedule(){
    this.todaySchedule = this.schedule[this.selectedDate] || [];
  }
  ngOnInit(): void {
      this.dataService.getRosterData().subscribe(data =>{
        this.developers = data.members;
        this.schedule = data.schedule;
        this.loadSchedule()
      })
  }

  getDeveloperName(id: number):string{
    const dev = this.developers.find(dev => dev.developerId ===id)
    if(dev){
      return dev.name;
    }else{
      return "Developer not found!"
    }
  }
}
