/* Course: SENG 513 */
/* Date: NOV 13, 2023 */
/* Assignment 2 Part Two */
/* Name: Achraf Abdelrhafour */
/* UCID: 30022366 */

// Default values
let timeLeft = 300;
let timerInterval;
let players = [];
let bridge = [];
let currentPlayerIndex = 0;
let isGameOver = false;

// Function to initialize the game's initial state
function startGame() {
  // Read user input to initialize bridge length and number of players
  const playerCount = parseInt(document.getElementById("playerCount").value,10);
  const bridgeLength = parseInt(document.getElementById("bridgeLength").value,10);

  // Reset game state
  timeLeft = 300;
  players = [];
  bridge = [];
  currentPlayerIndex = 0;
  isGameOver = false;

  // Initialize players
  for (let i = 0; i < playerCount; i++) {
    players.push({
      position: -1,
      lane: "start",
      active: true,
      hasFinished: false,
    });
  }

  // Initialize bridge with two parallel rows
  for (let i = 0; i < bridgeLength; i++) {
    // Randomly decide which side will be the safe side
    let safeSide = Math.random() < 0.5 ? "left" : "right";
    if (safeSide === "left") {
      bridge.push({ left: "tempered", right: "normal", discovered: false });
    } else {
      bridge.push({ left: "normal", right: "tempered", discovered: false });
    }
  }

  // Hide the setup view and show the game view
  document.querySelector(".game-setup").style.display = "none";
  document.querySelector(".game-area").style.display = "flex";

  // Update the UI
  updateUI();

  // Start the timer after setting up the game
  startTimer();
}

// Function to refresh the view after it changes (any moves are made)
function updateUI() {
  // Update the alive player's area with all currently active players
  const alivePlayersArea = document.getElementById("alive-players-area");
  alivePlayersArea.innerHTML = ""; // Clear the area before repopulating it
  players.forEach((player, idx) => {
    if (player.active) {
      // Check if the player active, then add them to the alive area
      const playerElem = document.createElement("div");
      playerElem.classList.add("player-alive");
      playerElem.style.background = `hsl(${idx * 36}, 100%, 50%)`; // Use the same color for consistency
      playerElem.textContent = `Player ${idx + 1}`; // Display player number
      alivePlayersArea.appendChild(playerElem);
    }
  });

  // Update the start area, to include all players still at the initial zone
  const startArea = document.querySelector(".start-area");
  startArea.innerHTML = "";
  players.forEach((player, idx) => {
    if (player.position === -1 && player.active && player.lane === "start") {
      const playerElem = document.createElement("div");
      playerElem.classList.add("player-start");
      playerElem.style.background = `hsl(${idx * 36}, 100%, 50%)`;
      startArea.appendChild(playerElem);
    }
  });

  // Update the bridge, populating each row with two panels
  const bridgeDiv = document.querySelector(".bridge");
  bridgeDiv.innerHTML = "";
  bridge.forEach((segment, index) => {
    const row = document.createElement("div");
    row.classList.add("row");

    const leftPanel = createPanel("left", index);
    const rightPanel = createPanel("right", index);

    row.appendChild(leftPanel);
    row.appendChild(rightPanel);
    bridgeDiv.appendChild(row);
  });

  // Update the finish area, to include al players who have reached the safe-zone
  const finishArea = document.querySelector(".finish-area");
  finishArea.innerHTML = "";
  players.forEach((player, idx) => {
    if (player.hasFinished) {
      const playerElem = document.createElement("div");
      playerElem.classList.add("player-finish");
      playerElem.style.background = `hsl(${idx * 36}, 100%, 50%)`;
      finishArea.appendChild(playerElem);
    }
  });

  // Update the current player's turn to be the next player
  const currentPlayerDisplay = document.getElementById("currentPlayer");
  currentPlayerDisplay.innerText = `Player ${currentPlayerIndex + 1}'s turn`;

  // Update the dead player's area, to include all inactive players
  const deadPlayersArea = document.getElementById("dead-players-area");
  deadPlayersArea.innerHTML = ""; // Clear the area before repopulating it
  players.forEach((player, idx) => {
    if (!player.active) {
      // Check if the player is inactive, then add them to the dead player area
      const playerElem = document.createElement("div");
      playerElem.classList.add("player-dead");
      playerElem.style.background = `hsl(${idx * 36}, 100%, 50%)`; // Use the same color for consistency
      playerElem.textContent = `Player ${idx + 1}`; // Display player number
      deadPlayersArea.appendChild(playerElem);
    }
  });
}

// Function to create panels for the bridge
function createPanel(lane, position) {
  const panel = document.createElement("div");
  panel.classList.add("panel");
  // Once a player steps on a tempered panel, paint it red to alert other players
  if (bridge[position].discovered && bridge[position][lane] === "tempered") {
    panel.style.backgroundColor = "red";
  }
  // List of all players on the current panel
  const playersOnPanel = players.filter(
    (player) => player.position === position && player.lane === lane
  );
  
  playersOnPanel.forEach((player, idx) => {
    const playerElem = document.createElement("div");
    playerElem.classList.add("player");
    if (!player.active) {
      playerElem.classList.add("inactive"); // Hide the player if they are inactive
    }

    playerElem.style.background = `hsl(${
      (players.indexOf(player) * 36) % 360
    }, 100%, 50%)`; // Different color for each player, based on their index
    panel.appendChild(playerElem); // Add player to the panel
  });

  return panel;
}

// Function to check logic of a player's move
function move(direction) {
  if (isGameOver) return; // Early return if the game is over
  let currentPlayer = players[currentPlayerIndex];
  if (currentPlayer.active) {
    // Increment the player's position as they decide to step onto the bridge
    currentPlayer.position++;
    // Check if the player has reached the end, if so move them to the end/safe zone
    if (currentPlayer.position >= bridge.length) {
      currentPlayer.lane = "end";
      currentPlayer.hasFinished = true;
    }
    // Otherwise check the panel they are stepping onto
    else {
      // If it is tempered, the player dies
      if (bridge[currentPlayer.position][direction] === "tempered") {
        currentPlayer.active = false;
        bridge[currentPlayer.position].discovered = true; // This now correctly marks the first panel
        alert(`Player ${currentPlayerIndex + 1} has fallen!`);
      } else {
        // If they didn't fall, update the lane they are in
        currentPlayer.lane = direction;
      }
    }
    // Refresh the UI
    updateUI();
    // Check to see if the game is over after every move
    if (checkGameOver()) {
      endGameWithWinners(players.filter((player) => player.hasFinished));
    } else {
      nextPlayer();
    }
  }
}

// Updates the turn for the next player
function nextPlayer() {
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } while (!players[currentPlayerIndex].active);
  updateUI();
}

// Function to skip a turn
function skipTurn() {
  if (isGameOver) return; // Early return if the game is over
  nextPlayer();
  updateUI();
}
// Function to check if the game is over
function checkGameOver() {
  const finishedPlayers = players.filter((player) => player.hasFinished).length;
  const activePlayers = players.filter((player) => player.active).length;

  // Game over condition met: Top 3 finished, or all are dead, or all active players have reached the end zone
  if (
    finishedPlayers >= 3 ||
    activePlayers === 0 ||
    finishedPlayers === activePlayers
  ) {
    if (!isGameOver) {
      isGameOver = true;
      endGameWithWinners(players.filter((player) => player.hasFinished));
    }
    return true;
  }
  return false;
}

// Function to end the game
function endGameWithWinners(winners) {
  if (isGameOver) {
    clearInterval(timerInterval); // Stop the timer
    let message = "Game Over! ";

    // If there are more winners, display them
    if (winners.length > 0) {
      message += `Winners: ${winners
        .map((p) => `Player ${players.indexOf(p) + 1}`)
        .join(", ")}`;
    } else {
      // If there are no winners, it means everyone is dead
      message += "No winners, everyone lost!";
    }

    alert(message);

    // Ask the user if they want to restart the game
    if (confirm("Would you like to play again?")) {
      startGame(); // Reset and start a new game
    } else {
      isGameOver = false; // Allow the user to start a new game manually later
    }
  }
}

// Function to start timer
function startTimer() {
  const timerElement = document.getElementById("timeLeft");
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) { // If time has run out, end the game
      endGameWithWinners();
    }
  }, 1000);
}
