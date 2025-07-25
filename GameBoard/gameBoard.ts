const CATEGORIES: string[] = ['History', 'Science', 'Sports', 'Entertainment', 'Geography', 'Art'];
const GRID_SIZE: number = 9;
const SPACING: number = 50;

interface BoardSpace {
  index: number;
  category: string;
  position: {
    x: number;
    y: number;
  };
  isWedge: boolean;
}

let boardSpaces: BoardSpace[] = [];

function createSquareBoard(): void {
  const half: number = Math.floor(GRID_SIZE / 2);
  let index: number = 0;

  for (let x = 0; x < GRID_SIZE; x++) addBoardSpace(x, 0, index++);              
  for (let y = 1; y < GRID_SIZE; y++) addBoardSpace(GRID_SIZE - 1, y, index++);  
  for (let x = GRID_SIZE - 2; x >= 0; x--) addBoardSpace(x, GRID_SIZE - 1, index++);
  for (let y = GRID_SIZE - 2; y > 0; y--) addBoardSpace(0, y, index++);          

  for (let y = 1; y < GRID_SIZE - 1; y++) {
    if (y !== half) addBoardSpace(half, y, index++);
  }

  for (let x = 1; x < GRID_SIZE - 1; x++) {
    if (x !== half) addBoardSpace(x, half, index++);
  }

  addBoardSpace(half, half, index++, true);
}

function addBoardSpace(
  gridX: number,
  gridY: number,
  index: number,
  forceWedge: boolean = false
): void {
  const x: number = gridX * SPACING + SPACING;
  const y: number = gridY * SPACING + SPACING;
  const category: string = CATEGORIES[index % CATEGORIES.length];
  const isWedge: boolean =
    forceWedge || index % Math.floor((CATEGORIES.length * 4) / CATEGORIES.length) === 0;

  boardSpaces.push({
    index,
    category,
    position: { x, y },
    isWedge
  });
}

function drawBoard(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  boardSpaces.forEach((space: BoardSpace) => {
    ctx.beginPath();
    ctx.rect(space.position.x - 20, space.position.y - 20, 40, 40);
    ctx.fillStyle = getCategoryColor(space.category);
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

function getCategoryColor(category: string): string {
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

function initializeBoard(canvasId: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    console.error(`Canvas with ID '${canvasId}' not found.`);
    return;
  }

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    createSquareBoard();
    drawBoard(ctx);
  } else {
    console.error('Failed to get 2D context');
  }
}