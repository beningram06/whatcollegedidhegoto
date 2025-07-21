window.onload = () => {
  let allPlayers = [];
  let nbaPlayers = [];
  let nflPlayers = [];
  let remainingIndices = [];
  let currentPlayer = null;
  let streak = 0;
  let longestStreak = 0;
  let currentMode = "both";

  const playerNameEl = document.getElementById("player-name");
  const choicesEl = document.getElementById("choices");
  const resultEl = document.getElementById("result");
  const streakEl = document.getElementById("streak");
  const longestStreakEl = document.getElementById("longest-streak");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const giveUpBtn = document.getElementById("give-up-btn");

  function updateStreakDisplay() {
    streakEl.textContent = `Current Streak: ${streak}`;
    longestStreakEl.textContent = `Longest Streak: ${longestStreak}`;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getRandomIndex() {
    const rand = Math.floor(Math.random() * remainingIndices.length);
    const index = remainingIndices[rand];
    remainingIndices.splice(rand, 1); // remove from list
    return index;
  }

  function selectMode(mode) {
    currentMode = mode;
    streak = 0;
    longestStreak = 0;
    updateStreakDisplay();

    let selectedPool = [];

    if (mode === "nba") selectedPool = nbaPlayers;
    else if (mode === "nfl") selectedPool = nflPlayers;
    else selectedPool = [...nbaPlayers, ...nflPlayers];

    allPlayers = selectedPool;
    remainingIndices = selectedPool.map((_, idx) => idx);

    document.querySelectorAll("#mode-buttons button").forEach(btn =>
      btn.classList.remove("selected-mode")
    );
    document.querySelector(`#btn-${mode}`).classList.add("selected-mode");

    loadNextPlayer();
  }

  function loadNextPlayer() {
    resultEl.textContent = "";
    choicesEl.innerHTML = "";
    nextBtn.style.display = "none";
    restartBtn.style.display = "none";
    giveUpBtn.style.display = "inline-block";

    if (remainingIndices.length === 0) {
      resultEl.textContent = `🎉 You completed the game! Final Streak: ${streak}`;
      restartBtn.style.display = "inline-block";
      giveUpBtn.style.display = "none";
      return;
    }

    const nextIndex = getRandomIndex();
    currentPlayer = allPlayers[nextIndex];
    playerNameEl.textContent = currentPlayer.name;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Type the college...";
    input.id = "guess-input";
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") checkAnswer(input.value);
    });

    const guessBtn = document.createElement("button");
    guessBtn.textContent = "Submit Guess";
    guessBtn.onclick = () => checkAnswer(input.value);

    choicesEl.appendChild(input);
    choicesEl.appendChild(guessBtn);
    input.focus();
  }

  function checkAnswer(guess) {
    const input = document.getElementById("guess-input");
    if (!input || !guess.trim()) return;

    if (guess.trim().toLowerCase() === currentPlayer.college.toLowerCase()) {
      resultEl.textContent = "✅ Correct!";
      streak++;
      if (streak > longestStreak) longestStreak = streak;
      updateStreakDisplay();
      nextBtn.style.display = "inline-block";
      giveUpBtn.style.display = "none";
      input.disabled = true;
    } else {
      resultEl.textContent = "❌ Try again!";
    }
  }

  function giveUp() {
    const input = document.getElementById("guess-input");
    if (input) input.disabled = true;

    resultEl.textContent = `❌ The correct answer was ${currentPlayer.college}\nFinal Streak: ${streak}`;
    streak = 0;
    updateStreakDisplay();
    giveUpBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
  }

  nextBtn.onclick = loadNextPlayer;
  giveUpBtn.onclick = giveUp;
  restartBtn.onclick = () => selectMode(currentMode);

  document.getElementById("btn-nba").onclick = () => selectMode("nba");
  document.getElementById("btn-nfl").onclick = () => selectMode("nfl");
  document.getElementById("btn-both").onclick = () => selectMode("both");

  fetch("players.json")
    .then(res => res.json())
    .then(data => {
      data = shuffleArray(data); // 🔥 Shuffle on load
      nbaPlayers = data.filter(p => p.sport === "NBA");
      nflPlayers = data.filter(p => p.sport === "NFL");
      selectMode(currentMode); // Auto-start
    })
    .catch(err => {
      console.error("Failed to load players.json", err);
      resultEl.textContent = "⚠️ Failed to load players.";
    });
};
