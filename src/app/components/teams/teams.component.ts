import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-teams',
  imports: [CommonModule],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent implements OnInit {
  members: any[] = [];
  teams: any[] = [];
  filteredMembers: any[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getRosterData().subscribe((data: any) => {
      this.teams = data.teams; 
      this.members = data.members;
      this.filteredMembers = this.members; 
    });
  }

  filterMembers(event: any): void {
    // been using the ;as htmlInput... to let typescript t know but lemme check this one out
    const searchTerm = event.target.value.trim().toLowerCase();
  
    this.filteredMembers = this.members.filter((member) => {
      return (
        member.name.toLowerCase().includes(searchTerm) ||
        member.role.toLowerCase().includes(searchTerm)
      );
    });
  }
}
