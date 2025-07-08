import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'RiskyQuizness';


  tasks:any=[];
  newCategory="";
  newQuestion="";
  newAnswer="";
  APIURL="http://13.59.151.18/";

  constructor(private http:HttpClient){}

  ngOnInit(){
	  this.get_tasks();
  }
  get_tasks(){
	this.http.get(this.APIURL+"get_data").subscribe((res)=> {
		this.tasks=res;
	})		
  }
    add_question(){
    let body=new FormData();
    body.append('category',this.newCategory)
    body.append('question',this.newQuestion)
    body.append('answer',this.newAnswer)
    this.http.post(this.APIURL+"add_question",body).subscribe(( res) => {
      alert(res)
    })
    this.get_tasks();
    }
}
