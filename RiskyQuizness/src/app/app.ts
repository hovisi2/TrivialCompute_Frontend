import { Component,  ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


interface BoardSpace {
  index: number;
  category: string;
  position: {
    x: number;
    y: number;
  };
  isWedge: boolean;
}



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit{
  protected title = 'RiskyQuizness';


  tasks:any=[];
  newCategory="";
  newQuestion="";
  newAnswer="";
  APIURL="http://3.150.30.122/";
  homepage=true;
  playerselection=false;
  categoryselection=false;
  gameboard=false;
  CATEGORIES: string[] = ['History', 'Science', 'Sports', 'Entertainment', 'Geography', 'Art'];
  GRID_SIZE=9;
  SPACING=50;
  boardSpaces: BoardSpace[] = [];
 

  constructor(private http:HttpClient){
  }

  @ViewChild('gameCanvas') canvas!:  ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    // Access the element
  }

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

    startGame(): void {
        this.homepage = false
      	this.playerselection = true	
    }

    startGameClicked(){
	this.playerselection = false
    	this.categoryselection = true	
    }
    nextButtonClicked(){
	this.categoryselection = false
	this.gameboard = true

	setTimeout(() => {
        const canvas = this.canvas.nativeElement;
        this.initializeBoard(canvas);
       });
    }


    createSquareBoard(): void {
  const half: number = Math.floor(this.GRID_SIZE / 2);
  let index: number = 0;

  for (let x = 0; x < this.GRID_SIZE; x++) this.addBoardSpace(x, 0, index++);
  for (let y = 1; y < this.GRID_SIZE; y++) this.addBoardSpace(this.GRID_SIZE - 1, y, index++);
  for (let x = this.GRID_SIZE - 2; x >= 0; x--) this.addBoardSpace(x, this.GRID_SIZE - 1, index++);
  for (let y = this.GRID_SIZE - 2; y > 0; y--) this.addBoardSpace(0, y, index++);

  for (let y = 1; y < this.GRID_SIZE - 1; y++) {
    if (y !== half) this.addBoardSpace(half, y, index++);
  }

  for (let x = 1; x < this.GRID_SIZE - 1; x++) {
    if (x !== half) this.addBoardSpace(x, half, index++);
  }

  this.addBoardSpace(half, half, index++, true);
  }

  addBoardSpace(
  gridX: number,
  gridY: number,
  index: number,
  forceWedge: boolean = false
  ): void {
   const x: number = gridX * this.SPACING + this.SPACING;
   const y: number = gridY * this.SPACING + this.SPACING;
   const category: string = this.CATEGORIES[index % this.CATEGORIES.length];
   const isWedge: boolean =
    forceWedge || index % Math.floor((this.CATEGORIES.length * 4) / this.CATEGORIES.length) === 0;

   this.boardSpaces.push({
    	index,
    	category,
    	position: { x, y },
  	  isWedge
  	});
  }

  drawBoard(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  this.boardSpaces.forEach((space: BoardSpace) => {
    ctx.beginPath();
    ctx.rect(space.position.x - 20, space.position.y - 20, 40, 40);
    ctx.fillStyle = this.getCategoryColor(space.category);
    ctx.fill();

    if (space.isWedge) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(space.category[0], space.position.x, space.position.y);
  });
  }

  getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    History: '#c0392b',
    Science: '#16a085',
    Sports: '#2980b9',
    Entertainment: '#f39c12',
    Geography: '#27ae60',
    Art: '#8e44ad'
  };
  return colors[category] || '#bdc3c7';
 }

 initializeBoard(canvas: HTMLCanvasElement): void {
   canvas.width = canvas.offsetWidth;
   canvas.height = canvas.offsetHeight;

   const ctx = canvas.getContext('2d');
   if (ctx) {
     this.createSquareBoard();
     this.drawBoard(ctx);
   } else {
     console.error('Failed to get 2D context');
   }

  }

}




