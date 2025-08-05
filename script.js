class MarbleRaceGame {
  constructor() {
    this.gems = this.loadGems();
    this.selectedMarbles = new Set();
    this.nextSelectedMarbles = new Set();
    this.bets = {};
    this.nextBets = {};
    this.gamePhase = "betting"; // 'betting' or 'racing'
    this.countdownTimer = null;
    this.raceTimer = null;
    this.bettingTimeLeft = 15;
    this.racingTimeLeft = 15;
    this.marbleStyles = [
      "linear-gradient(135deg, #ff6b6b, #ee5a24)",
      "linear-gradient(135deg, #4ecdc4, #00d2d3)",
      "linear-gradient(135deg, #45b7d1, #96ceb4)",
      "linear-gradient(135deg, #f9ca24, #f0932b)",
      "linear-gradient(135deg, #eb4d4b, #6639a6)",
      "linear-gradient(135deg, #6c5ce7, #a29bfe)",
      "linear-gradient(135deg, #00b894, #00cec9)",
      "linear-gradient(135deg, #e17055, #fdcb6e)",
      "linear-gradient(135deg, #fd79a8, #fdcb6e)",
      "linear-gradient(135deg, #636e72, #2d3436)",
    ];

    this.initializeEventListeners();
    this.updateGemDisplay();
    this.startBettingPhase();
  }

  loadGems() {
    const savedGems = localStorage.getItem("marbleRaceGems");
    return savedGems ? parseInt(savedGems) : 1000;
  }

  saveGems() {
    localStorage.setItem("marbleRaceGems", this.gems.toString());
  }

  initializeEventListeners() {
    // Marble checkbox selection
    document.querySelectorAll(".marble-checkbox input").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => this.handleMarbleSelection(e));
    });

    // Bet control buttons
    document.querySelectorAll(".btn-minus").forEach((btn) => {
      btn.addEventListener("click", (e) => this.adjustBet(e, -1));
    });

    document.querySelectorAll(".btn-plus").forEach((btn) => {
      btn.addEventListener("click", (e) => this.adjustBet(e, 1));
    });

    // Bet input fields
    document.querySelectorAll(".bet-input input").forEach((input) => {
      input.addEventListener("change", (e) => this.updateBetFromInput(e));
    });

    document
      .getElementById("reset-bets")
      .addEventListener("click", () => this.resetBets());

    // Modal controls
    document
      .getElementById("open-betting-modal")
      .addEventListener("click", () => this.openBettingModal());

    document
      .getElementById("confirm-bets")
      .addEventListener("click", () => this.confirmBets());

    // Close modal when clicking outside
    document.getElementById("betting-modal").addEventListener("click", (e) => {
      if (e.target.id === "betting-modal") {
        this.closeBettingModal();
      }
    });
  }

  handleMarbleSelection(event) {
    const checkbox = event.target;
    const marbleId = parseInt(checkbox.id.split("-")[2]); // Extract from marble-check-X
    const isChecked = checkbox.checked;

    if (this.gamePhase === "betting") {
      // Handle current race betting
      if (isChecked) {
        if (this.selectedMarbles.size >= 9) {
          this.showError("You can select maximum 9 marbles");
          checkbox.checked = false;
          return;
        }
        this.selectedMarbles.add(marbleId);
        this.bets[marbleId] = 999; // Default bet from design
      } else {
        this.selectedMarbles.delete(marbleId);
        delete this.bets[marbleId];
      }
    } else {
      // Handle next race betting during racing phase
      if (isChecked) {
        if (this.nextSelectedMarbles.size >= 9) {
          this.showError("You can select maximum 9 marbles for next race");
          checkbox.checked = false;
          return;
        }
        this.nextSelectedMarbles.add(marbleId);
        this.nextBets[marbleId] = 999; // Default bet from design
      } else {
        this.nextSelectedMarbles.delete(marbleId);
        delete this.nextBets[marbleId];
      }
    }

    this.updateBettingTotals();
    this.clearError();
  }

  adjustBet(event, delta) {
    const marbleId = parseInt(event.target.dataset.marble);
    const input = document.querySelector(`input[data-marble="${marbleId}"]`);
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, currentValue + delta);

    input.value = newValue;

    // Update the bet in our data
    if (this.gamePhase === "betting") {
      if (this.selectedMarbles.has(marbleId)) {
        this.bets[marbleId] = newValue;
      }
    } else {
      if (this.nextSelectedMarbles.has(marbleId)) {
        this.nextBets[marbleId] = newValue;
      }
    }

    this.updateBettingTotals();
  }

  updateBetFromInput(event) {
    const input = event.target;
    const marbleId = parseInt(input.dataset.marble);
    const value = Math.max(0, parseInt(input.value) || 0);

    input.value = value;

    // Update the bet in our data
    if (this.gamePhase === "betting") {
      if (this.selectedMarbles.has(marbleId)) {
        this.bets[marbleId] = value;
      }
    } else {
      if (this.nextSelectedMarbles.has(marbleId)) {
        this.nextBets[marbleId] = value;
      }
    }

    this.updateBettingTotals();
  }

  updateBettingTotals() {
    const currentBets =
      this.gamePhase === "betting" ? this.bets : this.nextBets;
    const totalAmount = Object.values(currentBets).reduce(
      (sum, bet) => sum + bet,
      0
    );

    // Update total displays
    const totalDisplays = document.querySelectorAll(".total-display");
    if (totalDisplays.length > 0) {
      totalDisplays[0].textContent = totalAmount;
    }
  }

  updateBettingInterface() {
    // Update checkboxes and input values for all marbles
    for (let marbleId = 1; marbleId <= 10; marbleId++) {
      const checkbox = document.getElementById(`marble-check-${marbleId}`);
      const input = document.querySelector(`input[data-marble="${marbleId}"]`);

      if (this.gamePhase === "betting") {
        // Current race betting
        const isSelected = this.selectedMarbles.has(marbleId);
        const betAmount = this.bets[marbleId] || 999;

        if (checkbox) checkbox.checked = isSelected;
        if (input) input.value = betAmount;
      } else {
        // Next race betting during racing phase
        const isSelected = this.nextSelectedMarbles.has(marbleId);
        const betAmount = this.nextBets[marbleId] || 999;

        if (checkbox) checkbox.checked = isSelected;
        if (input) input.value = betAmount;
      }
    }

    this.updateBettingTotals();
  }

  handleBetChange(marbleId, value, raceType) {
    const betAmount = parseInt(value) || 0;
    const maxBet = this.gems;

    if (raceType === "next") {
      this.nextBets[marbleId] = Math.max(1, Math.min(betAmount, maxBet));
    } else {
      this.bets[marbleId] = Math.max(1, Math.min(betAmount, maxBet));
    }
  }

  startBettingPhase() {
    this.gamePhase = "betting";
    this.bettingTimeLeft = 15;

    // Clear any existing timers
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.raceTimer) clearInterval(this.raceTimer);

    // Move next race bets to current race bets
    this.selectedMarbles = new Set(this.nextSelectedMarbles);
    this.bets = { ...this.nextBets };

    // Clear next race bets
    this.nextSelectedMarbles.clear();
    this.nextBets = {};

    // Update marble selection visuals
    document.querySelectorAll(".marble").forEach((marble) => {
      const marbleId = parseInt(marble.dataset.id);
      marble.classList.remove("next-selected");

      if (this.selectedMarbles.has(marbleId)) {
        marble.classList.add("selected");
      } else {
        marble.classList.remove("selected");
      }

      marble.style.pointerEvents = "auto";
      marble.style.opacity = "1";
    });

    // Restore race status visibility but keep it smaller since results are showing
    const raceStatus = document.getElementById("race-status");
    raceStatus.style.opacity = "0.8";
    raceStatus.style.transform = "translate(-50%, -50%) scale(0.9)";

    // Keep results overlay visible during betting phase
    // Only clear race track, NOT the results
    this.clearRaceTrack();

    // Close betting modal if open
    this.closeBettingModal();

    this.updateBettingInterface();
    this.updateCountdown();

    this.countdownTimer = setInterval(() => {
      this.bettingTimeLeft--;
      this.updateCountdown();

      if (this.bettingTimeLeft <= 0) {
        clearInterval(this.countdownTimer);
        this.startRacingPhase();
      }
    }, 1000);
  }

  startRacingPhase() {
    this.gamePhase = "racing";
    this.racingTimeLeft = 15;

    // Keep marble selection enabled for next race betting
    document.querySelectorAll(".marble").forEach((marble) => {
      marble.style.pointerEvents = "auto";
      marble.style.opacity = "1";
    });

    // Process current race bets
    const totalBet = Object.values(this.bets).reduce(
      (sum, bet) => sum + bet,
      0
    );
    if (totalBet > 0 && totalBet <= this.gems) {
      this.gems -= totalBet;
      this.updateGemDisplay();
      this.saveGems();
    }

    // NOW hide the results overlay since new race is starting
    const resultsOverlay = document.querySelector(".results-overlay");
    if (resultsOverlay.style.display !== "none") {
      resultsOverlay.style.opacity = "0";
      resultsOverlay.style.transform = "translateY(20px)";
      setTimeout(() => {
        resultsOverlay.style.display = "none";
      }, 500);
    }

    // Restore race status to full visibility for new race
    const raceStatus = document.getElementById("race-status");
    raceStatus.style.opacity = "1";
    raceStatus.style.transform = "translate(-50%, -50%) scale(1)";

    this.updateBettingInterface();
    this.updateCountdown();
    this.startRace();

    this.countdownTimer = setInterval(() => {
      this.racingTimeLeft--;
      this.updateCountdown();

      if (this.racingTimeLeft <= 0) {
        clearInterval(this.countdownTimer);
        this.startBettingPhase();
      }
    }, 1000);
  }

  updateCountdown() {
    const timeLeft =
      this.gamePhase === "betting" ? this.bettingTimeLeft : this.racingTimeLeft;
    let statusMessage;

    if (this.gamePhase === "betting") {
      statusMessage = `Betting Phase: ${timeLeft}s remaining`;
    } else {
      statusMessage = `Racing Phase: ${timeLeft}s remaining (Bet for Next Race!)`;
    }

    this.updateRaceStatusMessage(statusMessage);

    // Update modal countdown if modal is open
    const modalCountdown = document.getElementById("betting-countdown");
    if (modalCountdown) {
      modalCountdown.textContent = `${timeLeft}s`;
    }

    // Update CSS class for visual phase indication
    const statusElement = document.getElementById("race-status");
    statusElement.className = `race-status ${this.gamePhase}-phase`;
  }

  openBettingModal() {
    const modal = document.getElementById("betting-modal");
    modal.classList.add("active");

    this.updateBettingInterface();
  }

  closeBettingModal() {
    const modal = document.getElementById("betting-modal");
    modal.classList.remove("active");
  }

  confirmBets() {
    // Validate bets first
    const currentBets =
      this.gamePhase === "betting" ? this.bets : this.nextBets;
    const totalBet = Object.values(currentBets).reduce(
      (sum, bet) => sum + bet,
      0
    );

    if (totalBet > this.gems) {
      this.showError("Not enough gems for these bets");
      return;
    }

    if (Object.keys(currentBets).length === 0) {
      this.showError("Please select at least one marble");
      return;
    }

    this.clearError();
    this.closeBettingModal();
  }

  resetBets() {
    if (this.gamePhase === "betting") {
      this.selectedMarbles.clear();
      this.bets = {};
    } else {
      // During racing phase, reset next race bets
      this.nextSelectedMarbles.clear();
      this.nextBets = {};
    }

    // Reset all checkboxes and input values
    for (let marbleId = 1; marbleId <= 10; marbleId++) {
      const checkbox = document.getElementById(`marble-check-${marbleId}`);
      const input = document.querySelector(`input[data-marble="${marbleId}"]`);

      if (checkbox) checkbox.checked = false;
      if (input) input.value = 999;
    }

    this.updateBettingTotals();
    this.clearError();
  }

  async startRace() {
    await this.simulateRace();
  }

  async simulateRace() {
    const allMarbles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // All 10 marbles race
    const raceTrack = document.getElementById("race-marbles");
    const trackWidth = document.getElementById("race-track").clientWidth - 100;

    raceTrack.innerHTML = "";

    const marbleElements = allMarbles.map((marbleId) => {
      const marble = document.createElement("div");
      marble.className = "racing-marble";
      marble.style.background = this.marbleStyles[marbleId - 1];
      marble.textContent = marbleId;
      marble.style.left = "0px";
      marble.dataset.id = marbleId;
      marble.dataset.distance = "0";
      raceTrack.appendChild(marble);
      return marble;
    });

    const raceResults = [];
    const raceDuration = 15000; // Exactly 15 seconds
    const startTime = Date.now();

    return new Promise((resolve) => {
      this.raceTimer = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / raceDuration, 1);

        marbleElements.forEach((marble) => {
          if (marble.dataset.finished) return;

          const randomSpeed = 0.5 + Math.random() * 0.5;
          const currentDistance = parseFloat(marble.dataset.distance);
          const targetDistance = progress * trackWidth;
          const newDistance = Math.min(
            currentDistance + randomSpeed * 15,
            targetDistance + (Math.random() - 0.5) * 50
          );

          marble.dataset.distance = newDistance.toString();
          marble.style.left = `${Math.min(
            Math.max(newDistance, 0),
            trackWidth
          )}px`;

          if (
            progress >= 1 &&
            !raceResults.find((r) => r.id === parseInt(marble.dataset.id))
          ) {
            marble.dataset.finished = "true";
            raceResults.push({
              id: parseInt(marble.dataset.id),
              position: raceResults.length + 1,
              finalDistance: newDistance,
            });
          }
        });

        if (progress >= 1 && raceResults.length === 0) {
          // Force finish all marbles
          marbleElements.forEach((marble) => {
            if (!marble.dataset.finished) {
              marble.dataset.finished = "true";
              raceResults.push({
                id: parseInt(marble.dataset.id),
                position: raceResults.length + 1,
                finalDistance: parseFloat(marble.dataset.distance),
              });
            }
          });
        }

        if (progress >= 1 && raceResults.length === marbleElements.length) {
          clearInterval(this.raceTimer);

          // Sort by final distance (furthest first)
          raceResults.sort((a, b) => b.finalDistance - a.finalDistance);
          raceResults.forEach((result, index) => {
            result.position = index + 1;
          });

          this.finishRace(raceResults);
          resolve();
        }
      }, 50);
    });
  }

  finishRace(results) {
    this.displayResults(results);
    this.calculateAndDisplayPayouts(results);
  }

  displayResults(results) {
    const resultsContainer = document.getElementById("race-results");
    resultsContainer.innerHTML =
      '<div class="results-header">🏁 Race Results</div>';

    // Show top 3 only to save space in overlay
    const topResults = results.slice(0, 3);

    topResults.forEach((result) => {
      const resultItem = document.createElement("div");
      resultItem.className = "result-item";

      if (result.position === 1) resultItem.classList.add("first");
      else if (result.position === 2) resultItem.classList.add("second");
      else if (result.position === 3) resultItem.classList.add("third");

      const positionText = this.getPositionText(result.position);
      const medals = ["🥇", "🥈", "🥉"];
      const medal = medals[result.position - 1] || "";

      resultItem.innerHTML = `
                <div class="position">${medal} ${positionText}</div>
                <div class="marble-info">
                    <div class="marble-preview" style="background: ${
                      this.marbleStyles[result.id - 1]
                    };">${result.id}</div>
                    <span>Marble ${result.id}</span>
                </div>
            `;

      resultsContainer.appendChild(resultItem);
    });
  }

  showResultsOverlay() {
    // Dim race status when showing results
    const raceStatus = document.getElementById("race-status");
    raceStatus.style.opacity = "0.6";
    raceStatus.style.transform = "translate(-50%, -50%) scale(0.8)";

    // Show results overlay with animation
    const resultsOverlay = document.querySelector(".results-overlay");
    resultsOverlay.style.display = "block";
    resultsOverlay.style.opacity = "0";
    resultsOverlay.style.transform = "translateY(20px)";

    // Animate in
    setTimeout(() => {
      resultsOverlay.style.transition = "all 0.5s ease-out";
      resultsOverlay.style.opacity = "1";
      resultsOverlay.style.transform = "translateY(0)";
    }, 100);

    // Debug log to make sure this is being called
    console.log("Results overlay should be visible now");
  }

  getPositionText(position) {
    const positions = [
      "1st",
      "2nd",
      "3rd",
      "4th",
      "5th",
      "6th",
      "7th",
      "8th",
      "9th",
    ];
    return positions[position - 1] || `${position}th`;
  }

  calculateAndDisplayPayouts(results) {
    let totalWinnings = 0;
    const payoutDetails = [];

    results.forEach((result) => {
      const marbleId = result.id;
      const betAmount = this.bets[marbleId] || 0;
      let multiplier = 0;
      let winnings = 0;

      // Only calculate payouts for marbles that were bet on
      if (betAmount > 0) {
        if (result.position === 1) {
          multiplier = 3;
          winnings = betAmount * 3;
        } else if (result.position === 2) {
          multiplier = 2;
          winnings = betAmount * 2;
        } else if (result.position === 3) {
          multiplier = 1;
          winnings = betAmount;
        }

        if (winnings > 0) {
          totalWinnings += winnings;
          payoutDetails.push({
            marbleId,
            position: result.position,
            betAmount,
            multiplier,
            winnings,
          });
        }
      }
    });

    this.gems += totalWinnings;
    this.updateGemDisplay();
    this.saveGems();

    const payoutContainer = document.getElementById("payout-info");
    const totalBet = Object.values(this.bets).reduce(
      (sum, bet) => sum + bet,
      0
    );
    const netResult = totalWinnings - totalBet;

    let payoutHTML = "<h3>💰 Payout</h3>";

    if (payoutDetails.length > 0) {
      payoutDetails.forEach((detail) => {
        payoutHTML += `<div><strong>Marble ${
          detail.marbleId
        }</strong> (${this.getPositionText(detail.position)}): ${
          detail.betAmount
        } × ${detail.multiplier} = <strong>${
          detail.winnings
        } gems</strong></div>`;
      });
    } else {
      payoutHTML += "<div>No winning positions</div>";
    }

    payoutHTML += `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">`;
    payoutHTML += `<div>Bet: -${totalBet} | Won: +${totalWinnings}</div>`;

    if (netResult > 0) {
      payoutHTML += `<div class="payout-positive">Net: +${netResult} gems 🎉</div>`;
    } else if (netResult < 0) {
      payoutHTML += `<div class="payout-negative">Net: ${netResult} gems</div>`;
    } else {
      payoutHTML += `<div>Net: Break Even</div>`;
    }

    payoutHTML += "</div>";
    payoutContainer.innerHTML = payoutHTML;

    // Show the results overlay after calculating payouts
    this.showResultsOverlay();
  }

  updateGemDisplay() {
    // Update navigation gem balance (Nova gems balance)
    const navGemCount = document.getElementById("nav-gem-count");
    if (navGemCount) {
      navGemCount.textContent = this.gems.toLocaleString();
    }
  }

  updateRaceStatusMessage(message) {
    document.getElementById("race-status").textContent = message;
  }

  showError(message) {
    document.getElementById("error-message").textContent = message;
  }

  clearError() {
    document.getElementById("error-message").textContent = "";
  }

  clearResults() {
    document.getElementById("race-results").innerHTML = "";
    document.getElementById("payout-info").innerHTML = "";
    document.getElementById("race-marbles").innerHTML = "";
  }

  clearRaceTrack() {
    document.getElementById("race-marbles").innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MarbleRaceGame();
});
