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

  // Display Board Method - Each iteration, draws 3 "cells" incrementing the index
  const displayBoard = () => {
    for (let i = 0; i < board.length; i += 3) {
      console.log(`${board[i]} | ${board[i + 1]} | ${board[i + 2]}`);
    }
  };
  return { getBoard, resetBoard, displayBoard };
})();

// PLAYER FACTORY
const Player = (playerName, playerSign) => {
  return {
    playerName,
    playerSign,
  };
};

// GAME CONTROLLER FACTORY
const GameController = (mode, difficulty, player1, player2, bot) => {
  // Make current player "x" & get the board
  let gameMode = mode;
  let currentPlayer = player1;
  let currentDifficulty = difficulty;
  let board = Gameboard.getBoard();

  // Switch Turn Method
  const switchTurn = () => {
    if (gameMode === "PvP") {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
    } else if (gameMode === "PvBot") {
      currentPlayer = currentPlayer === player1 ? bot : player1;
    }
  };

  // Put Sign Method - checks if spot is empty, checks if that makes someone the winner, otherwise logs "Spot taken"-Error
  const putSign = (spot) => {
    // If the spot is empty, put the player's sign there & display the updated board
    if (board[spot] === "") {
      board[spot] = currentPlayer.playerSign;
      Gameboard.displayBoard();

      // If there's a winner, display that, clear the board & display it again
      if (checkWinner()) {
        console.log(`${currentPlayer.playerName} wins!`);
        Gameboard.resetBoard();
        Gameboard.displayBoard();
      } else if (isBoardFull()) {
        // If the board is full but no one won, its a tie
        console.log("It's a draw!");
        Gameboard.resetBoard();
        Gameboard.displayBoard();
      } else {
        // If not, switch turn and display who's turn it is
        switchTurn();
        if (gameMode === "PvBot" && currentPlayer === bot) {
          botMove();
        } else {
          console.log(`It's ${currentPlayer.playerName}'s Turn`);
        }
      }
    } else {
      // The spot isn't free so log that
      console.log("That spot is taken! Try a different one.");
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
  };

  // BOT - Make Random Move
  const makeRandomMove = () => {
    const emptySpots = getEmptySpots(board);
    // Make a radom move from the array of empty spots
    const randomMove =
      emptySpots[Math.floor(Math.random() * emptySpots.length)];
    putSign(randomMove);
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
    // Hard Bot
    if (difficulty === "hard") {
      makeBestMove();
    } else if (difficulty === "medium") {
      if (Math.random() < 0.3) {
        makeBestMove();
      } else {
        makeRandomMove();
      }
    } else if (difficulty === "easy") {
      makeRandomMove();
    }
  };

  return { putSign };
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

const prepareGame = () => {
  // VARIABLES
  const homeScreen = document.querySelector(".Home-Screen");
  const pvpSetupScreen = document.querySelector(".Setup-Screen--PvP");
  const pvbotSetupScreen = document.querySelector(".Setup-Screen--PvBot");
  const gameplayScreen = document.querySelector(".Gameplay-Screen");
  const gameoverScreen = document.querySelector(".Gameover-Screen");
  const pvpBtn = document.querySelector("#pvp-btn");
  const pvbotBtn = document.querySelector("#pvbot-btn");
  const startPvPGameBtn = document.querySelector("#start-pvp-game-btn");
  const startPvBotGameBtn = document.querySelector("#start-pvbot-game-btn");

  let selectedDifficulty = "medium";

  // P.v.P || P. v. Bot Selection
  pvpBtn.addEventListener("click", () => {
    homeScreen.classList.toggle("hidden");
    pvpSetupScreen.classList.toggle("hidden");
    console.log("Gamemode: Player v. Player");
  });

  pvbotBtn.addEventListener("click", () => {
    homeScreen.classList.toggle("hidden");
    pvbotSetupScreen.classList.toggle("hidden");
    console.log("Gamemode: Player v. Bot");
  });

  // Player v. Player Setup Screen
  startPvPGameBtn.addEventListener("click", () => {
    const player1Name =
      document.querySelector("#p1-name-input").value || "Player 1";
    const player2Name =
      document.querySelector("#p2-name-input").value || "Player 2";

    const player1 = Player(player1Name, "x");
    const player2 = Player(player2Name, "o");

    window.game = GameController("PvP", null, player1, player2, null);
    console.log("Player vs Player game started!");

    pvpSetupScreen.classList.toggle("hidden");
    gameplayScreen.classList.toggle("hidden");
  });

  // Player v. Bot Setup Screen
  const difficultyButtons = document.querySelectorAll(
    ".Setup-Screen--PvBot button[value]"
  );
  difficultyButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      selectedDifficulty = e.target.value;
    });
  });

  startPvBotGameBtn.addEventListener("click", () => {
    console.log(
      `Player v. Bot game started. Difficulty: ${selectedDifficulty}`
    );

    const player = Player("You", "x");
    const bot = Player("Bot", "o");

    window.game = GameController(
      "PvBot",
      selectedDifficulty,
      player,
      null,
      bot
    );

    pvbotSetupScreen.classList.toggle("hidden");
    gameplayScreen.classList.toggle("hidden");
  });
};

// EVENT LISTENERS
// On page load, prepare game
document.addEventListener("DOMContentLoaded", () => {
  prepareGame();
});
