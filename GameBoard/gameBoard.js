const CATEGORIES = ['History', 'Science', 'Sports', 'Entertainment', 'Geography', 'Art'];
const GRID_SIZE = 9; // 9x9 board
const SPACING = 50;  // space between grid cells

let boardSpaces = [];

function createSquareBoard() {
  const half = Math.floor(GRID_SIZE / 2);
  let index = 0;

  // Outer perimeter
  for (let x = 0; x < GRID_SIZE; x++) addBoardSpace(x, 0, index++);              // Top row
  for (let y = 1; y < GRID_SIZE; y++) addBoardSpace(GRID_SIZE - 1, y, index++);  // Right column
  for (let x = GRID_SIZE - 2; x >= 0; x--) addBoardSpace(x, GRID_SIZE - 1, index++); // Bottom row
  for (let y = GRID_SIZE - 2; y > 0; y--) addBoardSpace(0, y, index++);          // Left column

  // Vertical center line
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    if (y !== half) addBoardSpace(half, y, index++);
  }

  // Horizontal center line
  for (let x = 1; x < GRID_SIZE - 1; x++) {
    if (x !== half) addBoardSpace(x, half, index++);
  }

  // Center tile
  addBoardSpace(half, half, index++, true);
}

function addBoardSpace(gridX, gridY, index, forceWedge = false) {
  const x = gridX * SPACING + SPACING;
  const y = gridY * SPACING + SPACING;
  const category = CATEGORIES[index % CATEGORIES.length];
  const isWedge = forceWedge || index % Math.floor((CATEGORIES.length * 4) / CATEGORIES.length) === 0;

  boardSpaces.push({
    index,
    category,
    position: { x, y },
    isWedge
  });
}

function drawBoard(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  boardSpaces.forEach(space => {
    // Draw square
    ctx.beginPath();
    ctx.rect(space.position.x - 20, space.position.y - 20, 40, 40);
    ctx.fillStyle = getCategoryColor(space.category);
    ctx.fill();

    // Outline wedge
    if (space.isWedge) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }

    // Draw label
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(space.category[0], space.position.x, space.position.y);
  });
}

function getCategoryColor(category) {
  const colors = {
    History: '#c0392b',
    Science: '#16a085',
    Sports: '#2980b9',
    Entertainment: '#f39c12',
    Geography: '#27ae60',
    Art: '#8e44ad'
  };
  return colors[category] || '#bdc3c7';
}

function initializeBoard(canvasId) {
  const canvas = document.getElementById(canvasId);
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const ctx = canvas.getContext('2d');
  createSquareBoard();
  drawBoard(ctx);
}
