import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// all interfaces

interface BoardSpace {
  index: number;
  category: string;
  position: {
    x: number;
    y: number;
  };
  isWedge: boolean;
}

interface Player {
  id: number;
  name: string;
  position: number;
  chips: string[];
  color: string;
}

interface GameState {
  currentPlayer: number;
  rollValue: number;
  gamePhase: 'rolling' | 'moving' | 'answering' | 'gameOver';
  possibleMoves: number[];
  selectedMove: number | null;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected title = 'RiskyQuizness';


  tasks: any = [];
  newCategory = "";
  newQuestion = "";
  newAnswer = "";
  APIURL = "http://3.150.30.122/";
  homepage = true;
  playerselection = false;
  categoryselection = false;
  gameboard = false;
  questionmanagement = false;
  CATEGORIES: string[] = ['Science', 'Math', 'English', 'History'];
  GRID_SIZE = 9;
  SPACING = 50;
  boardSpaces: BoardSpace[] = [];

  // create game state
  players: Player[] = [];
  gameState: GameState = {
    currentPlayer: 0,
    rollValue: 0,
    gamePhase: 'rolling',
    possibleMoves: [],
    selectedMove: null
  };

  playerColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

  selectedCategories: string[] = [];
  currentQuestion: any = null;

  // question management state
  authenticated = false;
  authUsername = '';
  authPassword = '';
  editingQuestion = false;
  creatingQuestion = false;
  showingQuestionList = false;
  allQuestions: any[] = [];
  currentEditingQuestion: any = null;
  newQuestionData = { category: '', question: '', answer: '' };
  editQuestionData = { category: '', question: '', answer: '' };

  constructor(private http: HttpClient) {
  }

  @ViewChild('gameCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.get_tasks();
  }
  get_tasks() {
    this.http.get(this.APIURL + "get_data").subscribe((res) => {
      this.tasks = res;
    })
  }
  add_question() {
    let body = new FormData();
    body.append('category', this.newCategory)
    body.append('question', this.newQuestion)
    body.append('answer', this.newAnswer)
    this.http.post(this.APIURL + "add_question", body).subscribe((res) => {
      alert(res)
    })
    this.get_tasks();
  }

  // crud functions

  getCategories() {
    return this.http.get<{ categories: string[] }>(this.APIURL + "api/questions/categories");
  }

  getQuestionById(questionId: number) {
    return this.http.get(this.APIURL + `api/questions/${questionId}`);
  }

  getQuestionsByCategory(category: string) {
    return this.http.get(this.APIURL + `api/questions/category/${category}`);
  }

  getRandomQuestion(category: string) {
    return this.http.get(this.APIURL + `api/questions/random/${category}`);
  }

  createQuestion(questionData: { category: string, question: string, answer: string }) {
    return this.http.post(this.APIURL + "api/questions", questionData);
  }

  updateQuestion(questionId: number, updateData: any) {
    return this.http.put(this.APIURL + `api/questions/${questionId}`, updateData);
  }

  deleteQuestion(questionId: number) {
    return this.http.delete(this.APIURL + `api/questions/${questionId}`);
  }

  startGame(): void {
    this.homepage = false
    this.playerselection = true
  }

  startGameClicked() {
    // init players
    this.initializePlayers();
    this.playerselection = false
    this.categoryselection = true
  }
  nextButtonClicked() {
    // capture selected categories
    this.saveSelectedCategories();
    this.categoryselection = false
    this.gameboard = true

    setTimeout(() => {
      const canvas = this.canvas.nativeElement;
      this.initializeBoard(canvas);
      this.startGameplay();
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
      this.drawPlayers(ctx);

      canvas.addEventListener('click', (event) => this.handleCanvasClick(event));
    } else {
      console.error('Failed to get 2D context');
    }
  }

  // game mechanics helpers

  initializePlayers(): void {
    this.players = [];

    const playerInputs = [
      (document.getElementById('player-one') as HTMLInputElement)?.value || 'Player 1',
      (document.getElementById('player-two') as HTMLInputElement)?.value || 'Player 2',
      (document.getElementById('player-three') as HTMLInputElement)?.value || 'Player 3',
      (document.getElementById('player-four') as HTMLInputElement)?.value || 'Player 4'
    ];

    playerInputs.forEach((name, index) => {
      if (name.trim()) {
        this.players.push({
          id: index,
          name: name.trim(),
          position: 0,
          chips: [],
          color: this.playerColors[index]
        });
      }
    });

    if (this.players.length === 0) {
      this.players = [
        { id: 0, name: 'Player 1', position: 0, chips: [], color: this.playerColors[0] },
        { id: 1, name: 'Player 2', position: 0, chips: [], color: this.playerColors[1] }
      ];
    }
  }

  saveSelectedCategories(): void {
    const categorySelects = [
      document.getElementById('category-one') as HTMLSelectElement,
      document.getElementById('category-two') as HTMLSelectElement,
      document.getElementById('category-three') as HTMLSelectElement,
      document.getElementById('category-four') as HTMLSelectElement
    ];

    this.selectedCategories = categorySelects
      .map(select => select?.value)
      .filter(value => value && value !== '')
      .slice(0, 4);

    if (this.selectedCategories.length === 0) {
      this.selectedCategories = this.CATEGORIES.slice(0, 4);
    }
  }

  startGameplay(): void {
    this.gameState.currentPlayer = 0;
    this.gameState.gamePhase = 'rolling';
    this.updateGameDisplay();
  }

  rollDice(): number {
    const roll = Math.floor(Math.random() * 6) + 1;
    this.gameState.rollValue = roll;
    this.gameState.gamePhase = 'moving';
    this.calculatePossibleMoves();
    this.updateGameDisplay();
    return roll;
  }

  calculatePossibleMoves(): void {
    const currentPlayer = this.players[this.gameState.currentPlayer];
    const currentPosition = currentPlayer.position;
    const rollValue = this.gameState.rollValue;

    const moves: number[] = [];

    const forwardMove = (currentPosition + rollValue) % this.boardSpaces.length;
    moves.push(forwardMove);

    const backwardMove = (currentPosition - rollValue + this.boardSpaces.length) % this.boardSpaces.length;
    if (backwardMove !== forwardMove) {
      moves.push(backwardMove);
    }

    this.gameState.possibleMoves = moves;
  }

  playerMoveSpace(targetPosition: number): void {
    if (!this.gameState.possibleMoves.includes(targetPosition)) {
      return;
    }

    const currentPlayer = this.players[this.gameState.currentPlayer];
    currentPlayer.position = targetPosition;
    this.gameState.selectedMove = targetPosition;
    this.gameState.gamePhase = 'answering';

    const space = this.boardSpaces[targetPosition];
    this.askQuestion(space.category);

    this.updateGameDisplay();
  }

  askQuestion(category: string): void {
    console.log(`Ask question for category: ${category}`);

    // get random question from api
    this.getRandomQuestion(category).subscribe({
      next: (question: any) => {
        this.currentQuestion = question;
        console.log('Question fetched:', question);
        // this is just simulating user answer, change for final
        setTimeout(() => {
          const correct = Math.random() > 0.5;
          this.handleAnswer(correct);
        }, 1500);
      },
      error: (error) => {
        console.error('Error fetching question:', error);
        this.handleAnswer(false);
      }
    });
  }

  handleAnswer(correct: boolean): void {
    const currentPlayer = this.players[this.gameState.currentPlayer];
    const currentSpace = this.boardSpaces[currentPlayer.position];

    if (correct) {
      if (currentSpace.isWedge && !currentPlayer.chips.includes(currentSpace.category)) {
        currentPlayer.chips.push(currentSpace.category);
      }

      if (this.checkWinCondition(currentPlayer)) {
        this.gameState.gamePhase = 'gameOver';
        alert(`${currentPlayer.name} wins!`);
        return;
      }

      this.gameState.gamePhase = 'rolling';
    } else {
      this.nextPlayersTurn();
    }

    this.updateGameDisplay();
  }

  checkWinCondition(player: Player): boolean {
    const hasAllChips = this.selectedCategories.every(category => player.chips.includes(category));
    const inCenter = this.boardSpaces[player.position].index === this.boardSpaces.length - 1;
    return hasAllChips && inCenter;
  }

  nextPlayersTurn(): void {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.players.length;
    this.gameState.gamePhase = 'rolling';
    this.gameState.possibleMoves = [];
    this.gameState.selectedMove = null;
    this.gameState.rollValue = 0;
  }

  drawPlayers(ctx: CanvasRenderingContext2D): void {
    this.players.forEach((player, index) => {
      const space = this.boardSpaces[player.position];
      if (space) {
        const offsetX = (index % 2) * 15 - 7;
        const offsetY = Math.floor(index / 2) * 15 - 7;

        ctx.beginPath();
        ctx.arc(space.position.x + offsetX, space.position.y + offsetY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.name[0], space.position.x + offsetX, space.position.y + offsetY);
      }
    });

    if (this.gameState.gamePhase === 'moving') {
      this.gameState.possibleMoves.forEach(moveIndex => {
        const space = this.boardSpaces[moveIndex];
        if (space) {
          ctx.beginPath();
          ctx.arc(space.position.x, space.position.y, 25, 0, 2 * Math.PI);
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
    }
  }

  handleCanvasClick(event: MouseEvent): void {
    if (this.gameState.gamePhase !== 'moving') {
      return;
    }

    const canvas = this.canvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const moveIndex of this.gameState.possibleMoves) {
      const space = this.boardSpaces[moveIndex];
      const distance = Math.sqrt(
        Math.pow(x - space.position.x, 2) + Math.pow(y - space.position.y, 2)
      );

      if (distance <= 25) {
        this.playerMoveSpace(moveIndex);
        break;
      }
    }
  }

  updateGameDisplay(): void {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.drawBoard(ctx);
      this.drawPlayers(ctx);
    }
  }

  onRollDice(): void {
    if (this.gameState.gamePhase === 'rolling') {
      this.rollDice();
    }
  }

  getCurrentPlayerName(): string {
    return this.players[this.gameState.currentPlayer]?.name || '';
  }

  getGamePhaseText(): string {
    switch (this.gameState.gamePhase) {
      case 'rolling': return 'Roll the dice';
      case 'moving': return `Move ${this.gameState.rollValue} spaces`;
      case 'answering': return 'Answer the question';
      case 'gameOver': return 'Game Over';
      default: return '';
    }
  }

  // question management functions

  editQuestions(): void {
    this.homepage = false;
    this.questionmanagement = true;
    this.authenticated = false;
    this.authUsername = '';
    this.authPassword = '';
  }

  backToHomepage(): void {
    this.questionmanagement = false;
    this.homepage = true;
    this.resetQuestionManagementState();
  }

  authenticate(): void {
    // accept admin/password for now
    if (this.authUsername === 'admin' && this.authPassword === 'password') {
      this.authenticated = true;
      this.authUsername = '';
      this.authPassword = '';
    } else {
      alert('Invalid credentials. Try admin/password');
    }
  }

  startCreateQuestion(): void {
    this.creatingQuestion = true;
    this.editingQuestion = false;
    this.showingQuestionList = false;
    this.newQuestionData = { category: '', question: '', answer: '' };
  }

  showQuestionList(): void {
    this.showingQuestionList = true;
    this.loadAllQuestions();
  }

  loadAllQuestions(): void {
    this.http.get(this.APIURL + "get_data").subscribe({
      next: (questions: any) => {
        this.allQuestions = questions;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        alert('Failed to load questions');
      }
    });
  }

  startEditQuestion(question: any): void {
    this.editingQuestion = true;
    this.creatingQuestion = false;
    this.showingQuestionList = false;
    this.currentEditingQuestion = question;
    this.editQuestionData = {
      category: question.category,
      question: question.question,
      answer: question.answer
    };
  }

  saveNewQuestion(): void {
    if (!this.newQuestionData.category || !this.newQuestionData.question || !this.newQuestionData.answer) {
      alert('Please fill in all fields');
      return;
    }

    this.createQuestion(this.newQuestionData).subscribe({
      next: () => {
        alert('Question created successfully!');
        this.cancelCreate();
        // refresh question list if showing
        if (this.showingQuestionList) {
          this.loadAllQuestions();
        }
      },
      error: (error) => {
        console.error('Error creating question:', error);
        alert('Failed to create question');
      }
    });
  }

  saveEditedQuestion(): void {
    if (!this.editQuestionData.category || !this.editQuestionData.question || !this.editQuestionData.answer) {
      alert('Please fill in all fields');
      return;
    }

    this.updateQuestion(this.currentEditingQuestion.id, this.editQuestionData).subscribe({
      next: () => {
        alert('Question updated successfully!');
        this.cancelEdit();
        if (this.showingQuestionList) {
          this.loadAllQuestions();
        }
      },
      error: (error) => {
        console.error('Error updating question:', error);
        alert('Failed to update question');
      }
    });
  }

  deleteCurrentQuestion(): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.deleteQuestion(this.currentEditingQuestion.id).subscribe({
        next: () => {
          alert('Question deleted successfully!');
          this.cancelEdit();
          if (this.showingQuestionList) {
            this.loadAllQuestions();
          }
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          alert('Failed to delete question');
        }
      });
    }
  }

  cancelCreate(): void {
    this.creatingQuestion = false;
    this.newQuestionData = { category: '', question: '', answer: '' };
  }

  cancelEdit(): void {
    this.editingQuestion = false;
    this.currentEditingQuestion = null;
    this.editQuestionData = { category: '', question: '', answer: '' };
  }

  addSampleQuestions(): void {
    const sampleQuestions = [
      { category: 'Science', question: 'What is the chemical symbol for gold?', answer: 'Au' },
      { category: 'Science', question: 'What planet is known as the Red Planet?', answer: 'Mars' },
      { category: 'Math', question: 'What is 12 x 8?', answer: '96' },
      { category: 'Math', question: 'What is the square root of 144?', answer: '12' },
      { category: 'English', question: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare' },
      { category: 'English', question: 'What is the past tense of "run"?', answer: 'ran' },
      { category: 'History', question: 'In what year did World War II end?', answer: '1945' },
      { category: 'History', question: 'Who was the first President of the United States?', answer: 'George Washington' }
    ];

    let completed = 0;
    const total = sampleQuestions.length;

    sampleQuestions.forEach(question => {
      this.createQuestion(question).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            alert(`Successfully added ${total} sample questions!`);
            this.loadAllQuestions();
          }
        },
        error: (error) => {
          console.error('Error adding sample question:', error);
          completed++;
          if (completed === total) {
            alert('Sample questions added with some errors. Check console for details.');
            this.loadAllQuestions();
          }
        }
      });
    });
  }

  resetQuestionManagementState(): void {
    this.authenticated = false;
    this.editingQuestion = false;
    this.creatingQuestion = false;
    this.showingQuestionList = false;
    this.allQuestions = [];
    this.currentEditingQuestion = null;
    this.newQuestionData = { category: '', question: '', answer: '' };
    this.editQuestionData = { category: '', question: '', answer: '' };
    this.authUsername = '';
    this.authPassword = '';
  }

}




