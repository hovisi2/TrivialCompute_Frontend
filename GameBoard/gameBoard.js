const CATEGORIES = ['History', 'Science', 'Entertainment', 'Geography'];
const GRID_SIZE = 9;
const SPACING = 50;
const players = [
  { id: 0, name: 'Player 1', position: 0, wedges: 0 },
  { id: 1, name: 'Player 2', position: 0, wedges: 0 }
];
let currentPlayerIndex = 0;


let boardSpaces = [];

function createSquareBoard() {
  const half = Math.floor(GRID_SIZE / 2);
  let index = 0;

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

function addBoardSpace(gridX, gridY, index, forceWedge = false) {
  const x = gridX * SPACING + SPACING;
  const y = gridY * SPACING + SPACING;
  const category = CATEGORIES[index % CATEGORIES.length];
  const isWedge = forceWedge || index % 4 === 0;

  // Identify corners
  const isCorner =
    (gridX === 0 && gridY === 0) ||
    (gridX === 0 && gridY === GRID_SIZE - 1) ||
    (gridX === GRID_SIZE - 1 && gridY === 0) ||
    (gridX === GRID_SIZE - 1 && gridY === GRID_SIZE - 1);

  boardSpaces.push({
    index,
    category,
    position: { x, y },
    isWedge,
    isCorner
  });
}


function drawBoard(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  boardSpaces.forEach(space => {
    const { x, y } = space.position;

    ctx.beginPath();
    ctx.rect(x - 20, y - 20, 40, 40);

    // Special styling for the center square
    if (space.isWedge && space.index === boardSpaces.length - 1) {
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Trivial Compute', x, y);
    } else {
      // Regular spaces
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
      ctx.fillText(space.category[0], x, y);
    }
  });

  if (space.isCorner) {
    ctx.fillStyle = '#ffffff'; // white
    ctx.fill();
    ctx.strokeStyle = '#000000'; // black border
    ctx.lineWidth = 2;
    ctx.stroke();
  
    ctx.fillStyle = '#000000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Roll Again', space.position.x, space.position.y);
  }
  
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
  if (!canvas) {
    console.error(`Canvas with ID '${canvasId}' not found.`);
    return;
  }

  // Define a fixed size for clarity and control
  canvas.width = 500;
  canvas.height = 500;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    createSquareBoard();
    drawBoard(ctx);
  } else {
    console.error('Failed to get 2D context');
  }
}


function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1; // 1–6
  highlightPotentialMoves(roll);
}

function highlightPotentialMoves(roll) {
  
}

function movePlayer(steps) {
  const player = players[currentPlayerIndex];
  player.position = (player.position + steps) % boardSpaces.length;

  const space = boardSpaces[player.position];
  if (space.isWedge) {
    player.wedges += 1;
    alert(`${player.name} earned a wedge!`);
  }

  drawBoard(ctx); // Pass player data to highlight position
  nextTurn();
}


function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  alert(`It's now ${players[currentPlayerIndex].name}'s turn.`);
}

function showDiceRoll() {
  const canvas = document.getElementById('diceCanvas');
  const ctx = canvas.getContext('2d');

  // Clear previous dice
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Random dice number
  const diceNumber = Math.floor(Math.random() * 6) + 1;

  // Draw dice face
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.fillRect(10, 10, 80, 80);
  ctx.strokeRect(10, 10, 80, 80);

  ctx.fillStyle = '#000000';

  // Simple dot placement based on dice number
  const dot = (x, y) => ctx.beginPath(), ctx.arc(x, y, 5, 0, 2 * Math.PI), ctx.fill();
  const center = [50, 50];
  const positions = {
    1: [center],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], center, [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], center, [30, 70], [70, 70]],
    6: [[30, 30], [70, 30], [30, 50], [70, 50], [30, 70], [70, 70]]
  };
  positions[diceNumber].forEach(p => dot(...p));

  // Optional: trigger next move after brief delay
  setTimeout(() => {
    alert(`You rolled a ${diceNumber}! 🎲`);
    // continueTurn(diceNumber);
  }, 1000);
}
