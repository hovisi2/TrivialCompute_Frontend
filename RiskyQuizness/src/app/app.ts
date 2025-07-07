import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'RiskyQuizness';


  tasks:any=[];

  APIURL="http://13.58.24.81/";

  constructor(private http:HttpClient){}

  ngOnInit(){
	  this.get_tasks();
  }
  get_tasks(){
	this.http.get(this.APIURL+"get_data").subscribe((res)=> {
		this.tasks=res;
	})		
  }
}
