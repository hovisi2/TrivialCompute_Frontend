// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES  = ['History', 'Science', 'Entertainment', 'Geography']; //update this to pull from backend
const GRID_SIZE   = 9;
const CANVAS_SIZE = 700;
const SPACING     = CANVAS_SIZE / GRID_SIZE;

let lastRoll = null;
let possibleMoves = [];

// ─── Players ─────────────────────────────────────────────────────────────────
const players = [
    { id: 0, name: 'Player 1', position: 0, wedges: 0, color: '#e74c3c' },
    { id: 1, name: 'Player 2', position: 0, wedges: 0, color: '#3498db' }
  ];
  
let currentPlayerIndex = 0;

// ─── Board Spaces ────────────────────────────────────────────────────────────
let boardSpaces = [];

// ─── Board Creation ──────────────────────────────────────────────────────────
function createSquareBoard() {
  const half = Math.floor(GRID_SIZE / 2);
  let index = 0;

  // Outer border
  for (let x = 0; x < GRID_SIZE; x++)           addBoardSpace(x, 0, index++);
  for (let y = 1; y < GRID_SIZE; y++)           addBoardSpace(GRID_SIZE - 1, y, index++);
  for (let x = GRID_SIZE - 2; x >= 0; x--)      addBoardSpace(x, GRID_SIZE - 1, index++);
  for (let y = GRID_SIZE - 2; y > 0; y--)       addBoardSpace(0, y, index++);

  // Inner cross
  for (let y = 1; y < GRID_SIZE - 1; y++)       if (y !== half) addBoardSpace(half, y, index++);
  for (let x = 1; x < GRID_SIZE - 1; x++)       if (x !== half) addBoardSpace(x, half, index++);

  // Center: Trivial Compute
  addBoardSpace(half, half, index++, true);
}

function addBoardSpace(gridX, gridY, index, forceWedge = false) {
  const x        = gridX * SPACING;
  const y        = gridY * SPACING;
  const category = CATEGORIES[index % CATEGORIES.length];
  const isWedge  = forceWedge || index % 4 === 0;

  const half = Math.floor(GRID_SIZE / 2);
  const isTrivialCompute = gridX === half && gridY === half;
  const isHQ = (
    (gridX === half && gridY === 0) ||
    (gridX === half && gridY === GRID_SIZE - 1) ||
    (gridX === 0    && gridY === half) ||
    (gridX === GRID_SIZE - 1 && gridY === half)
  );
  const isCorner = (
    (gridX === 0 && gridY === 0) ||
    (gridX === 0 && gridY === GRID_SIZE - 1) ||
    (gridX === GRID_SIZE - 1 && gridY === 0) ||
    (gridX === GRID_SIZE - 1 && gridY === GRID_SIZE - 1)
  );

  const hqCategories = {
    [`${half},0`]: 'History',
    [`${half},${GRID_SIZE - 1}`]: 'Science',
    [`0,${half}`]: 'Entertainment',
    [`${GRID_SIZE - 1},${half}`]: 'Geography'
  };
  
  const hqCategory = hqCategories[`${gridX},${gridY}`] || null;

  boardSpaces.push({
    index,
    category,
    position: { x, y },
    isWedge,
    isHQ,
    isCorner,
    isTrivialCompute,
    hqCategory
  });
  
}

// ─── Board Drawing ───────────────────────────────────────────────────────────
function drawBoard(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  boardSpaces.forEach(space => {
    const { x, y } = space.position;
    ctx.beginPath();
    ctx.rect(x, y, SPACING, SPACING);

    if (space.isTrivialCompute) {
      ctx.fillStyle   = '#e0e0e0';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth   = 2;
      ctx.stroke();
      drawText(ctx, '🏁 Trivial Compute', x + SPACING / 2, y + SPACING / 2);
      return;
    }

    
    if (space.isHQ) {
        const color = getCategoryColor(space.hqCategory || space.category);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
      
        drawText(ctx, '🏛 HQ', x + SPACING / 2, y + SPACING / 2);
        return;
    }
      
    if (space.isCorner) {
      drawDieFace(ctx, x + SPACING / 2, y + SPACING / 2, 30, lastRoll || 6);
      return;
    }

    ctx.fillStyle = getCategoryColor(space.category);
    ctx.fill();
    if (space.isWedge) {
      ctx.lineWidth   = 3;
      ctx.strokeStyle = 'black';
      ctx.stroke();
    }
    
    drawText(ctx, space.category[0], x + SPACING / 2, y + SPACING / 2);

    
  });

  // ─── Draw Player Tokens ──────────────────
  players.forEach(player => {
    const space = boardSpaces[player.position];
    const { x, y } = space.position;
    const cx = x + SPACING / 2;
    const cy = y + SPACING / 2;

    // offset so tokens don’t exactly overlap if on same space
    const offsets = [
      { x: -SPACING * 0.15, y: -SPACING * 0.15 },
      { x:  SPACING * 0.15, y:  SPACING * 0.15 }
    ];
    const off = offsets[player.id % offsets.length];

    ctx.beginPath();
    ctx.arc(cx + off.x, cy + off.y, SPACING * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawText(ctx, text, x, y) {
  ctx.fillStyle    = '#000';
  ctx.font         = '10px Arial';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawDieFace(ctx, cx, cy, size, value) {
  const half = size / 2;
  const pad  = size * 0.2;
  const r    = size * 0.08;

  const coords = {
    tl: [cx - half + pad, cy - half + pad],
    tr: [cx + half - pad, cy - half + pad],
    ml: [cx - half + pad, cy],
    mr: [cx + half - pad, cy],
    bl: [cx - half + pad, cy + half - pad],
    br: [cx + half - pad, cy + half - pad],
     c: [cx, cy]
  };

  ctx.fillStyle   = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth   = 2;
  ctx.fillRect(cx - half, cy - half, size, size);
  ctx.strokeRect(cx - half, cy - half, size, size);

  let pips = [];
  switch (value) {
    case 1: pips = [coords.c]; break;
    case 2: pips = [coords.tl, coords.br]; break;
    case 3: pips = [coords.tl, coords.c, coords.br]; break;
    case 4: pips = [coords.tl, coords.tr, coords.bl, coords.br]; break;
    case 5: pips = [coords.tl, coords.tr, coords.c, coords.bl, coords.br]; break;
    case 6: pips = [coords.tl, coords.tr, coords.ml, coords.mr, coords.bl, coords.br]; break;
  }

  ctx.fillStyle = '#000';
  pips.forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function getCategoryColor(cat) {
  return ({
    History:       '#c0392b',
    Science:       '#16a085',
    Entertainment: '#f39c12',
    Geography:     '#27ae60'
  })[cat] || '#bdc3c7';
}

// ─── Game Logic ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const gameCtx   = document.getElementById('gameCanvas').getContext('2d');
  const diceCtx   = document.getElementById('diceCanvas').getContext('2d');
  const resultDiv = document.getElementById('diceResult');
  const rollBtn   = document.getElementById('rollBtn');

  createSquareBoard();
  drawBoard(gameCtx);

  rollBtn.addEventListener('click', () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    lastRoll = roll;

    drawDieFace(diceCtx, 50, 50, 80, roll);
    resultDiv.textContent = `You rolled: ${roll}`;
    setTimeout(() => movePlayer(roll, gameCtx), 500);
  });
});

function movePlayer(steps, gameCtx) {
  const player = players[currentPlayerIndex];
  player.position = (player.position + steps) % boardSpaces.length;
  const space = boardSpaces[player.position];

  if (space.isWedge) {
    player.wedges++;
    alert(`${player.name} earned a wedge!`);
  }
  if (space.isCorner) {
    alert('🎲 Roll Again!');
    drawBoard(gameCtx);
    return;
  }
  if (space.isHQ) {
    alert(`${player.name} reached HQ! 🏛`);
  }
  if (space.isTrivialCompute) {
    alert(`${player.name} hit Trivial Compute! 🏁`);
  }

  drawBoard(gameCtx);
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  alert(`It's ${players[currentPlayerIndex].name}'s turn.`);
}

function rollDice() {
    // Prevent rolling again if moves are pending
    if (possibleMoves.length) return;
  
    const roll = Math.floor(Math.random() * 6) + 1;
    diceResultEl.textContent = roll;
  
    const player = players[currentPlayerIndex];
    const start = player.position;
  
    // Build list of reachable spaces
    possibleMoves = [];
    for (let i = 1; i <= roll; i++) {
      const next = Math.min(start + i, boardSpaces.length - 1);
      possibleMoves.push(next);
    }
  
    drawBoard(gameCtx);
}
  
