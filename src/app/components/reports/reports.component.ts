import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

declare var google: any;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  pieChartData: any[] = [];
  barChartData: any[] = [];
  totalTasks: number = 0;
  totalDevelopers: number = 0;
  averageTasksPerDeveloper: number = 0;

  pieChartOptions = {
    width: 500,
    height: 400,
    pieHole: 0.4,
    chartArea: { width: '80%', height: '75%' },
    legend: { position: 'bottom' },
  };

  barChartOptions = {
    width: 500,
    height: 400,
    chartArea: { width: '80%', height: '75%' },
    legend: { position: 'none' },
    hAxis: { title: 'Date' },
    vAxis: { title: 'Number of Tasks' },
  };

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getRosterData().subscribe((data: any) => {
      this.calculateStatistics(data);
      this.loadGoogleCharts();
    });
  }

  getDeveloperInfo(members: any[], id: number): any {
    return members.find((member) => member.id === id);
  }

  loadGoogleCharts(): void {
    if (typeof google !== 'undefined') {
      this.initializeGoogleCharts();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => this.initializeGoogleCharts();
    document.body.appendChild(script);
  }

  initializeGoogleCharts(): void {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      this.drawPieChart();
      this.drawBarChart();
    });
  }

  drawPieChart(): void {
    if (!this.pieChartData || this.pieChartData.length === 0) {
      console.log('No data to display in the pie chart.');
      return;
    }

    const dataTable = google.visualization.arrayToDataTable(this.pieChartData);
    const chartElement = document.getElementById('pie-chart');

    if (!chartElement) {
      console.error('Pie chart element not found!');
      return;
    }

    const chart = new google.visualization.PieChart(chartElement);
    chart.draw(dataTable, this.pieChartOptions);
  }

  drawBarChart(): void {
    if (!this.barChartData || this.barChartData.length === 0) {
      console.log('No data to display in the bar chart.');
      return;
    }

    const dataTable = google.visualization.arrayToDataTable(this.barChartData);
    const chartElement = document.getElementById('bar-chart');

    if (!chartElement) {
      console.error('Bar chart element not found!');
      return;
    }

    const chart = new google.visualization.ColumnChart(chartElement);
    chart.draw(dataTable, this.barChartOptions);
  }


  calculateStatistics(data: any): void {
    // I need a variable/object to store  task a developer has
    // and use that task for the chart, to determine devs with many tasks
    const taskDistribution: { [key: string]: number } = {};
    const resourceCoverage: { [key: string]: number } = {};

    for (const date in data.schedule) {
      const shifts = data.schedule[date];
      // counting tasks for the date
      resourceCoverage[date] = shifts.length;

      //looop through each shift for the date
      for (const shift of shifts) {
        const developerName = this.getDeveloperInfo(data.members, shift.developerId)?.name || 'Dev Not Found!';
        taskDistribution[developerName] = (taskDistribution[developerName] || 0) + 1; 
      }
    }

    this.pieChartData = [['Developer', 'Tasks']];
    for (const developer in taskDistribution) {
      this.pieChartData.push([developer, taskDistribution[developer]]);
    }

    this.barChartData = [['Date', 'Tasks']];
    for (const date in resourceCoverage) {
      this.barChartData.push([date, resourceCoverage[date]]);
    }

    let totalTasks = 0;
    let totalDevelopers = new Set();

    for (const date in data.schedule) {
      if (data.schedule.hasOwnProperty(date)) {
        totalTasks += data.schedule[date].length;

        data.schedule[date].forEach((task: any) => {
          totalDevelopers.add(task.developerId);
        });
      }
    }
    console.log('Total Tasks:', this.totalTasks);
    console.log('Total Developers:', this.totalDevelopers);
    
    this.totalTasks = totalTasks;
    this.totalDevelopers = totalDevelopers.size;
    this.averageTasksPerDeveloper = totalTasks / this.totalDevelopers;

  }



}