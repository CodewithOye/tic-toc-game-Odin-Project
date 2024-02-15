const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset-button');
const newGameButton = document.getElementById('new-game-button');
const exitButton = document.getElementById('exit-button');
const scoreboardX = document.getElementById('score-x');
const scoreboardO = document.getElementById('score-o');
const roundLog = document.getElementById('round-log');

let player1Name = 'Player X';
let player2Name = 'Player O';
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scoreX = 0;
let scoreO = 0;
let roundsWonByX = 0; // Initialize rounds won by Player X
let roundsWonByO = 0; // Initialize rounds won by Player O
const ROUND_LIMIT = 5; // Define the round limit
let difficultyLevel = 'hard'; // Default difficulty level is hard



function handleCellClick(e) {
  const cell = e.target;
  const cellIndex = parseInt(cell.getAttribute('data-cell'));
  if (board[cellIndex] !== '' || !gameActive) return;
  cell.textContent = currentPlayer;
  board[cellIndex] = currentPlayer;
  checkWin();
  checkDraw();
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  if (currentPlayer === 'O') {
    setTimeout(computerTurn, 1000);
  }
}



function checkWin() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
      highlightWin(pattern);
      gameActive = false;
      if (board[a] === 'X') {
        scoreX++;
      } else {
        scoreO++;
      }
      updateScoreBoard();
      if (scoreX === ROUND_LIMIT || scoreO === ROUND_LIMIT) {
        if (scoreX === ROUND_LIMIT) {
          roundsWonByX++;
          message.textContent = `${player1Name} wins the round!`;
        } else {
          roundsWonByO++;
          message.textContent = `${player2Name} wins the round!`;
        }
        updateRoundLog();
        resetGame();
      }
      return;
    }
  }
}

function checkDraw() {
  if (board.every(cell => cell !== '') && gameActive) {
    message.textContent = 'Draw!';
    gameActive = false;
    resetGame();
  }
}

function highlightWin(pattern) {
  for (let index of pattern) {
    cells[index].classList.add('blink');
  }
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  cells.forEach(cell => cell.textContent = '');
  cells.forEach(cell => cell.classList.remove('blink'));
  currentPlayer = 'X';
  gameActive = true;
  message.textContent = '';
  scoreX = 0; // Reset game score for Player X
  scoreO = 0; // Reset game score for Player O
  roundsWonByX = 0; // Reset round score for Player X
  roundsWonByO = 0; // Reset round score for Player O
  updateScoreBoard(); // Update score board with reset scores
}



function resetRoundScore() {
  roundsWonByX = 0;
  roundsWonByO = 0;
  updateRoundLog(); // Update round log to clear the displayed round scores
}

const levelSelect = document.getElementById('level');
levelSelect.addEventListener('change', function() {
  difficultyLevel = levelSelect.value;
  newGame(); // Reset the game when the level is changed
});

function newGame() {
  resetGameBoard(); // Reset only the game board
}

function resetGameBoard() {
  board = ['', '', '', '', '', '', '', '', ''];
  cells.forEach(cell => cell.textContent = '');
  cells.forEach(cell => cell.classList.remove('blink'));
  currentPlayer = 'X';
  gameActive = true;
  message.textContent = '';
}
function computerTurn() {
  if (gameActive) {
    const emptyCells = board.reduce((acc, cell, index) => {
      if (cell === '') acc.push(index);
      return acc;
    }, []);

    let randomIndex;

    if (difficultyLevel === 'easy') {
      // Easy difficulty: choose a random empty cell
      randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (difficultyLevel === 'medium') {
      // Medium difficulty: prioritize center cell, then corners, then edges
      if (Math.random() < 0.7) {
        if (emptyCells.includes(4)) {
          randomIndex = 4; // Choose center cell if available
        } else {
          let prioritizedCells = [0, 2, 6, 8]; // Corners
          let availableCorners = prioritizedCells.filter(cell => emptyCells.includes(cell));
          if (availableCorners.length > 0) {
            randomIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
          } else {
            let edges = [1, 3, 5, 7]; // Edges
            randomIndex = edges[Math.floor(Math.random() * edges.length)];
          }
        }
      } else {
        // Choose a random empty cell
        randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    } else if (difficultyLevel === 'hard') {
      // Hard difficulty: make the game unwinnable
      // In this case, we'll make the computer always choose the opposite of the current player's choice,
      // which makes it impossible for the player to win
      const opponent = currentPlayer === 'X' ? 'O' : 'X';
      const opponentsMove = emptyCells.find(index => {
        const newBoard = [...board];
        newBoard[index] = opponent;
        return checkWinningMove(newBoard, opponent);
      });
      if (opponentsMove !== undefined) {
        randomIndex = opponentsMove;
      } else {
        randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }

    cells[randomIndex].click();
  }
}




function getBestMove(board, player) {
  if (difficultyLevel === 'hard') {
    // Check for possible winning moves for the player
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = player;
        if (checkWinningMove(board, player)) {
          board[i] = '';
          return i; // Return the index of the winning move
        }
        board[i] = '';
      }
    }

    // Check for possible winning moves for the opponent
    let opponent = player === 'X' ? 'O' : 'X';
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = opponent;
        if (checkWinningMove(board, opponent)) {
          board[i] = '';
          return i; // Return the index of the blocking move
        }
        board[i] = '';
      }
    }

    // If no winning or blocking moves are possible, choose the center cell if available
    if (board[4] === '') return 4;

    // If the center cell is not available, choose a random empty corner cell
    let emptyCorners = [0, 2, 6, 8].filter(cell => board[cell] === '');
    if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];

    // If no corners are available, choose a random empty edge cell
    let emptyEdges = [1, 3, 5, 7].filter(cell => board[cell] === '');
    return emptyEdges[Math.floor(Math.random() * emptyEdges.length)];
  } else {
    // For easy and medium levels, choose a random empty cell
    let emptyCells = board.reduce((acc, cell, index) => {
      if (cell === '') acc.push(index);
      return acc;
    }, []);

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
}

// Function to check if a player has a winning move
function checkWinningMove(board, player) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

function updateScoreBoard() {
  scoreboardX.textContent = `${player1Name}: ${scoreX}`;
  scoreboardO.textContent = `${player2Name}: ${scoreO}`;
}

function updateRoundLog() {
  roundLog.innerHTML = `<p>Round won by ${player1Name}: ${roundsWonByX} - Round won by ${player2Name}: ${roundsWonByO}</p>`;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', () => {
  scoreX = 0;
  scoreO = 0;
  updateScoreBoard();
  resetGame();
});
newGameButton.addEventListener('click', newGame);
exitButton.addEventListener('click', () => window.close());

function highlightWin(pattern) {
  for (let index of pattern) {
    cells[index].classList.add('blink');
  }
  message.textContent = 'Game Over';
  setTimeout(() => {
    message.textContent = '';
  }, 2000); // Clear the "Game Over" message after 2 seconds
}

