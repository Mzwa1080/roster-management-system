import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataURL  = 'https://mzwa1080.github.io/roster-data/data/data.json';

  constructor(private http:HttpClient) { }

    getRosterData():Observable<any>{ 
      return this.http.get<any>(this.dataURL)
    }
  
}
