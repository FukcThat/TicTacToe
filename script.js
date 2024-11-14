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
const GameController = () => {
  // Make current player "x" & get the board
  let currentPlayer = player1;
  let board = Gameboard.getBoard();

  // Switch Turn Method
  const switchTurn = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
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
      } else {
        // If not, switch turn and display who's turn it is
        switchTurn();
        console.log(`It's ${currentPlayer.playerName}'s turn.`);
      }
    } else {
      // The spot isn't free so log that
      console.log("That spot is taken! Try a different one.");
    }
    return;
  };

  // Check Winner Method
  const checkWinner = () => {
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
      line.every((index) => board[index] === currentPlayer.playerSign)
    );
  };

  return { putSign };
};

// Make Players
const player1 = Player("Gitty", "x");
const player2 = Player("Gat", "o");

// Start Game by calling putSign()
const game = GameController();
