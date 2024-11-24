// VARIABLES
const homeScreen = document.querySelector(".Home-Screen");
const pvpSetupScreen = document.querySelector(".Setup-Screen--PvP");
const pvbotSetupScreen = document.querySelector(".Setup-Screen--PvBot");
const turnIndicator = document.querySelector(".turn-indicator");
const gameplayScreen = document.querySelector(".Gameplay-Screen");
const gameoverScreen = document.querySelector(".Gameover-Screen");
const winnerText = document.querySelector(".winner-text");
const rematchBtn = document.querySelector("#rematch-btn");
const homeBtn = document.querySelector("#home-btn");
const gameboardDiv = document.querySelector(".gameboard");
const pvpBtn = document.querySelector("#pvp-btn");
const pvbotBtn = document.querySelector("#pvbot-btn");
const startPvPGameBtn = document.querySelector("#start-pvp-game-btn");
const startPvBotGameBtn = document.querySelector("#start-pvbot-game-btn");

// GAMEBOARD FACTORY
const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  // Get Board Method - gets the board to avoid global nonesense
  const getBoard = () => {
    return board;
  };

  // Reset Board Method - fills each cell with an empty string
  const resetBoard = () => {
    board.fill("");
  };
  return { getBoard, resetBoard };
})();

// PLAYER FACTORY
const Player = (playerName, playerSign) => {
  return {
    playerName,
    playerSign,
  };
};

// GAME CONTROLLER FACTORY
const GameController = (
  mode,
  difficulty,
  player1,
  player2,
  bot,
  showGameOverScreen
) => {
  // Make current player "x" & get the board
  let gameMode = mode;
  let currentPlayer = player1;
  let board = Gameboard.getBoard();

  // Switch Turn Method
  const switchTurn = () => {
    currentPlayer =
      currentPlayer === player1
        ? gameMode === "PvBot"
          ? bot
          : player2
        : player1;

    if (gameMode === "PvBot" && currentPlayer === player1) {
      turnIndicator.textContent = "It's your turn";
    } else {
      turnIndicator.textContent = `It's ${currentPlayer.playerName}'s turn`;
    }
  };

  // Update cell - changes how cell looks once sign is placed
  const updateCell = (spot, sign, currentPlayer) => {
    const cell = document.querySelector(`.cell[data-index="${spot}"]`);

    if (cell && !cell.classList.contains("taken")) {
      cell.textContent = sign;
      cell.classList.add("taken");

      // Style cells for player & bot || second player differently
      if (gameMode === "PvBot" && currentPlayer.playerName === "Nano") {
        cell.style.borderColor = "rgb(148, 169, 177)";
      } else if (gameMode === "PvBot" && currentPlayer.playerName === "Micro") {
        cell.style.borderColor = "rgb(85, 122, 196)";
      } else if (gameMode === "PvBot" && currentPlayer.playerName === "Macro") {
        cell.style.borderColor = "rgb(119, 109, 194)";
      } else if (gameMode === "PvBot" && currentPlayer === "x") {
        cell.style.borderColor = "yellow";
      } else if (gameMode === "PvP" && currentPlayer.playerSign === "x") {
        cell.style.borderColor = "green";
      } else {
        cell.style.borderColor = "yellow";
      }
    }
  };

  // Put Sign Method - checks if spot is empty, checks if that makes someone the winner, otherwise logs "Spot taken"-Error
  const putSign = (spot) => {
    // If the spot is empty, put the player's sign there & display the updated board
    if (board[spot] === "") {
      board[spot] = currentPlayer.playerSign;
      updateCell(spot, currentPlayer.playerSign, currentPlayer);

      // If there's a winner, display that, clear the board & display it again
      if (checkWinner()) {
        showGameOverScreen(`${currentPlayer.playerName} wins!`);
      } else if (isBoardFull()) {
        // If the board is full but no one won, its a tie
        showGameOverScreen("It's a draw!");
      } else {
        // If nobody won, switch turn and display who's turn it is
        switchTurn();
        if (gameMode === "PvBot" && currentPlayer === bot) {
          setTimeout(() => {
            const botMoveIndex = botMove();
            updateCell(botMoveIndex, bot.playerSign, currentPlayer);
          }, 800);
        }
      }
    } else {
      // The spot isn't free so log that
      window.alert("That spot is taken.");
    }
    return;
  };

  // Check Winner Method
  const checkWin = (board, playerSign) => {
    const winningLines = [
      // Horizontally
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      // Vertically
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      // Diagonally
      [0, 4, 8],
      [2, 4, 6],
    ];

    // Check each line and see if there's at least one where all three spots have one players sign on it
    return winningLines.some((line) =>
      line.every((index) => board[index] === playerSign)
    );
  };

  // Check Winner
  const checkWinner = () => {
    return checkWin(Gameboard.getBoard(), currentPlayer.playerSign);
  };

  // Check if every cell of the board is not empty
  const isBoardFull = () => {
    return board.every((cell) => cell !== "");
  };

  // Check which cells of the board are empty and filter out "null"
  const getEmptySpots = (board) => {
    return board
      .map((cell, i) => (cell === "" ? i : null))
      .filter((spot) => spot !== null);
  };

  // BOT - Make Best Move
  const makeBestMove = () => {
    const bestMove = minimax(board, bot.playerSign).index;
    putSign(bestMove);
    return bestMove;
  };

  // BOT - Make Random Move
  const makeRandomMove = () => {
    const emptySpots = getEmptySpots(board);
    // Make a radom move from the array of empty spots
    const randomMove =
      emptySpots[Math.floor(Math.random() * emptySpots.length)];
    putSign(randomMove);
    return randomMove;
  };

  // Minimax - Logic for Bot knowing hat to do
  const minimax = (newBoard, player) => {
    const emptySpots = getEmptySpots(newBoard);

    // Check for a winner or tie and return a score
    if (checkWin(newBoard, player1.playerSign)) return { score: -1 };
    if (checkWin(newBoard, bot.playerSign)) return { score: 1 };
    if (emptySpots.length === 0) return { score: 0 };

    const moves = [];

    // Check each possible move and save the current Spot's index
    for (let i = 0; i < emptySpots.length; i++) {
      const move = {};
      move.index = emptySpots[i];

      // Make the move[i] on a pretend board
      newBoard[emptySpots[i]] = player;

      // Recursively call minimax between the player and the bot and evaluate the score for each side
      if (player === bot.playerSign) {
        move.score = minimax(newBoard, player1.playerSign).score;
      } else {
        move.score = minimax(newBoard, bot.playerSign).score;
      }

      // Undo the move you just made
      newBoard[emptySpots[i]] = "";

      // Push the move and it's score to the moves array
      moves.push(move);
    }

    // For finding the best move
    let bestMove;

    // If it's the bot's turn, make the move with the maximize score
    if (player === bot.playerSign) {
      // Ensure that any first evaluated move will be considered
      let bestScore = -Infinity;
      // Check if the score of this move is larger than the current bestScore if so replace it & make the best move this one
      moves.forEach((move) => {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      });
      // Else assume player makes best moves which minimize Bot's score
    } else {
      let bestScore = Infinity;
      moves.forEach((move) => {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      });
    }

    return bestMove;
  };

  // Bot Move Method
  const botMove = () => {
    let botMoveIndex;
    // Hard Bot
    if (difficulty === "hard") {
      botMoveIndex = makeBestMove();
    } else if (difficulty === "medium") {
      if (Math.random() < 0.3) {
        botMoveIndex = makeBestMove();
      } else {
        botMoveIndex = makeRandomMove();
      }
    } else if (difficulty === "easy") {
      botMoveIndex = makeRandomMove();
    }
    return botMoveIndex;
  };

  return { putSign, switchTurn, currentPlayer, board, botMove, gameMode };
};

const GameManager = {
  game: null,
  setGame(newGame) {
    this.game = newGame;
  },
  getGame() {
    return this.game;
  },
};

// Prepare Game
const prepareGame = () => {
  let selectedDifficulty = "medium";

  // Screen Transition Helper
  const showScreen = (screenToShow) => {
    document.querySelectorAll("section").forEach((section) => {
      section.classList.add("hidden");
      section.classList.remove("flex");
    });
    screenToShow.classList.remove("hidden");
    screenToShow.classList.add("flex");
  };

  // P.v.P || P. v. Bot Selection
  pvpBtn.addEventListener("click", () => {
    showScreen(pvpSetupScreen);
  });

  pvbotBtn.addEventListener("click", () => {
    showScreen(pvbotSetupScreen);
  });

  // Player v. Player Setup Screen
  startPvPGameBtn.addEventListener("click", () => {
    const player1Name =
      document.querySelector("#p1-name-input").value || "Player 1";
    const player2Name =
      document.querySelector("#p2-name-input").value || "Player 2";

    const player1 = Player(player1Name, "x");
    const player2 = Player(player2Name, "o");

    GameManager.setGame(null);

    GameManager.setGame(
      GameController("PvP", null, player1, player2, null, showGameOverScreen)
    );

    showScreen(gameplayScreen);
    setUpGameBoard();
  });

  // Player v. Bot Setup Screen
  const difficultyButtons = document.querySelectorAll(
    ".bot-difficulty-btns button[value]"
  );
  difficultyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      difficultyButtons.forEach((btn) => btn.classList.remove("active"));
      e.currentTarget.classList.add("active");
      selectedDifficulty = e.currentTarget.value;
    });
  });

  // Start Bot Game
  startPvBotGameBtn.addEventListener("click", () => {
    const botName =
      selectedDifficulty === "easy"
        ? "Nano"
        : selectedDifficulty === "medium"
        ? "Micro"
        : "Macro";

    const player = Player("You", "x");
    const bot = Player(botName, "o");

    GameManager.setGame(null);

    GameManager.setGame(
      GameController(
        "PvBot",
        selectedDifficulty,
        player,
        null,
        bot,
        showGameOverScreen
      )
    );

    showScreen(gameplayScreen);
    setUpGameBoard();
  });

  // Game-Over Screen
  const showGameOverScreen = (winner) => {
    winnerText.textContent = winner;
    showScreen(gameoverScreen);
  };

  rematchBtn.addEventListener("click", () => {
    const game = GameManager.getGame();
    if (game) {
      Gameboard.resetBoard();
      setUpGameBoard();
      showScreen(gameplayScreen);
    }
  });

  homeBtn.addEventListener("click", () => {
    Gameboard.resetBoard();
    showScreen(homeScreen);
  });

  // Set Up Game Board
  const setUpGameBoard = () => {
    const game = GameManager.getGame();
    const cells = document.querySelectorAll(".cell");
    const { currentPlayer, gameMode } = game;

    if (gameMode === "PvBot") {
      turnIndicator.textContent = "It's your turn";
    } else if (gameMode === "PvP") {
      turnIndicator.textContent = `It's ${currentPlayer.playerName}'s turn`;
    }

    cells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("taken");
      cell.style.borderColor = "";

      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell);

      newCell.addEventListener("click", () => {
        const index = parseInt(cell.dataset.index, 10);
        if (cell.classList.contains("taken")) return;

        game.putSign(index);
      });
    });
  };
};

// On page load, prepare game
document.addEventListener("DOMContentLoaded", () => {
  prepareGame();
});
