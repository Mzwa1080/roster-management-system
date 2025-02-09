import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import moment from 'moment-timezone';

declare var google: any; 

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  schedule: any = {};
  developers: any[] = [];
  selectedDate: string = '';
  filteredSchedule: any[] = [];
  chartData: any[] = [];

  chartOptions = {
    title: 'Task Distribution',
    width: 600,
    height: 400,
    pieHole: 0.4, // Makes the chart look like a donut
    chartArea: { width: '80%', height: '75%' },
    legend: { position: 'bottom' },
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getRosterData().subscribe((data: any) => {
      this.developers = data.members;
      this.schedule = this.updateScheduleTimes(data.schedule);
      this.selectedDate = moment.tz(Object.keys(this.schedule)[0], 'Africa/Johannesburg').format('YYYY-MM-DD');
      // console.log(moment(Object.keys(this.schedule)[0]).format('YYYY-MM-DD'));
      this.filteredSchedule = this.scheduleShifts(this.selectedDate);
      this.preparingChartData(); 
      this.loadGoogleCharts(); 
    });
  }
  convertToSA(time: string): string {
    return moment.tz(time, 'HH:mm', 'Africa/Johannesburg').format('HH:mm');
  }

  updateScheduleTimes(schedule: any) {
    Object.keys(schedule).forEach((date) => {
      schedule[date].forEach((shift:any) => {
        shift.shiftStart = this.convertToSA(shift.shiftStart);
        shift.shiftEnd = this.convertToSA(shift.shiftEnd);
      });
    });
  
    return schedule;
  }

// to-do : get shift for the selected date || Then count tasks based on those shifts || 
  preparingChartData(): void {
    if (!this.schedule) {
      console.log(' Error: Schedule data is undefined!');
      return;
    }
    const selectedShifts = this.schedule[this.selectedDate]; 
    if (!selectedShifts || selectedShifts.length === 0) {
 // If shifts are not found, then I must make sure I add data that will be stored there as default
      this.chartData = [['Task', 'Count'], ['Theres No Data!!!', 1]]; 
      return;
    }
 //now how about couting the tasks?, each and every one of them? meaning must loop through for each-shift
    const taskDistribution: { [key: string]: number } = {}; 
    selectedShifts.forEach((shift: any) => {
      if (!shift.task) {
        return;
      }
      taskDistribution[shift.task] = (taskDistribution[shift.task] || 0) + 1; 
    });

// I must convert task counts to the data of the chart.
    const chartArray: any[] = [['Task', 'Count']];
    Object.entries(taskDistribution).forEach(([task, count]) => {
      chartArray.push([task, count]);
    });

    if (chartArray.length === 1) {
      console.log(` No valid data for ${this.selectedDate}`);
// I need to add data if theres nothing, meaning must add my default data
      chartArray.push(['Theres No Data!!!', 1]); 
    }
// after that update the chart
    this.chartData = chartArray; 
    // console.log('chart updated!!!:', this.chartData);
 // Redrawing the charts if ggooogle chart is loading
    if (typeof google !== 'undefined' && typeof google.visualization !== 'undefined') {
      this.drawChart();
    } else {
      console.log('Google Charts is not loaded');
    }
  }

// Im getting the list of the dates from schedule
  get scheduleDates(): string[] {
    return Object.keys(this.schedule || {});
  }

// Now get developer info by ID
  getDeveloperInfo(id: number): any {
    return this.developers.find((dev) => dev.id === id);
  }

//Now for the button, get the shift for a specific date
  scheduleShifts(date: string): any[] {
    const adjustTheDate = moment.tz(date, 'Africa/Johannesburg').format('YYYY-MM-DD');
    console.log(adjustTheDate);
    
    return this.schedule[adjustTheDate] || [];
  }

//when the date is selected, I want chart to change and the data in the tables to change 
  changeDate(date: string): void {
    this.selectedDate = moment.tz(date, 'Africa/Johannesburg').format('YYYY-MM-DD');
// So developers must also change, then I have to filter through them and update the table
    this.filteredSchedule = this.scheduleShifts(date);
    this.preparingChartData();
  }

// for filter, input field - must filter developers by name, using dom,
// So , I must consider, selected date, developer name, if no one is there then
// then i must return nothing , so it can be clear and real filtered table
  filterByDeveloper(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const developer = inputElement?.value.trim() || '';

    if (!developer) {
      // console.log(this.scheduleShifts(this.selectedDate));
      this.filteredSchedule = this.scheduleShifts(this.selectedDate);
      return;
    }
// I have to check, filter and update making sure that lowercases to match the dev names
const adjustedTime = moment.tz(this.selectedDate, 'Africa/Johannesburg').format('YYYY-MM-DD');
    this.filteredSchedule = this.scheduleShifts(adjustedTime).filter((shift) => {
      const developerInfo = this.getDeveloperInfo(shift.developerId);
      return developerInfo?.name?.toLowerCase().includes(developer.toLowerCase());
    });
  }

// f or task inputField, checck on the shifts/selectedDate and filter by task
  filterByTask(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const task = inputElement?.value.trim() || '';

    if (!task) {
      this.filteredSchedule = this.scheduleShifts(this.selectedDate);
      return;
    }
    this.filteredSchedule = this.scheduleShifts(this.selectedDate).filter((shift) =>
      shift.task?.toLowerCase().includes(task.toLowerCase())
    );
  }
  resetFilters(): void {
    this.filteredSchedule = this.scheduleShifts(this.selectedDate);
  }


  loadGoogleCharts(): void {
    // checking if google charts is already loaded
        if (typeof google !== 'undefined') {
          this.initializeGoogleCharts();
          return;
        }
    
    // dynamically loading the google ccharts library
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => this.initializeGoogleCharts(); 
        document.body.appendChild(script);
      }
    
      initializeGoogleCharts(): void {
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(() => this.drawChart()); 
      }
    
      drawChart(): void {
        if (!this.chartData || this.chartData.length === 0) {
          console.warn('No data to display in the chart.');
          return;
        }
    // Making sure that the google chart is right and initialized loaded fully
        if (typeof google === 'undefined' || typeof google.visualization === 'undefined') {
          console.error('Google Charts library is not loaded yet.');
          return;
        }
     // converting the data to google charts formatt
        const dataTable = google.visualization.arrayToDataTable(this.chartData);
        const chartElement = document.getElementById('pie-chart'); 
    
        if (!chartElement) {
          console.error('Chart element not found!');
          return;
        }
    
        const chart = new google.visualization.PieChart(chartElement); 
        chart.draw(dataTable, this.chartOptions); 
      }
}