class MarbleRaceGame {
  constructor() {
    this.gems = this.loadGems();
    this.selectedMarbles = new Set();
    this.bets = {};
    this.gamePhase = 'betting'; // 'betting' or 'racing'
    this.countdownTimer = null;
    this.raceTimer = null;
    this.bettingTimeLeft = 15;
    this.racingTimeLeft = 15;
    this.marbleStyles = [
      'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      'linear-gradient(135deg, #4ecdc4, #00d2d3)',
      'linear-gradient(135deg, #45b7d1, #96ceb4)',
      'linear-gradient(135deg, #f9ca24, #f0932b)',
      'linear-gradient(135deg, #eb4d4b, #6639a6)',
      'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      'linear-gradient(135deg, #00b894, #00cec9)',
      'linear-gradient(135deg, #e17055, #fdcb6e)',
      'linear-gradient(135deg, #fd79a8, #fdcb6e)',
      'linear-gradient(135deg, #636e72, #2d3436)',
    ];

    this.initializeEventListeners();
    this.updateGemDisplay();
    this.startBettingPhase();
  }

  loadGems() {
    const savedGems = localStorage.getItem('marbleRaceGems');
    return savedGems ? parseInt(savedGems) : 1000;
  }

  saveGems() {
    localStorage.setItem('marbleRaceGems', this.gems.toString());
  }

  initializeEventListeners() {
    document.querySelectorAll('.marble').forEach((marble) => {
      marble.addEventListener('click', (e) => this.handleMarbleSelection(e));
    });

    document
      .getElementById('reset-bets')
      .addEventListener('click', () => this.resetBets());
  }

  handleMarbleSelection(event) {
    if (this.gamePhase !== 'betting') return;

    const marbleId = parseInt(event.target.dataset.id);
    const marbleElement = event.target;

    if (this.selectedMarbles.has(marbleId)) {
      this.selectedMarbles.delete(marbleId);
      marbleElement.classList.remove('selected');
      delete this.bets[marbleId];
    } else {
      if (this.selectedMarbles.size >= 9) {
        this.showError('You can select maximum 9 marbles');
        return;
      }
      this.selectedMarbles.add(marbleId);
      marbleElement.classList.add('selected');
      this.bets[marbleId] = 10; // Default bet
    }

    this.updateBettingInterface();
    this.clearError();
  }

  updateBettingInterface() {
    const betInputsContainer = document.getElementById('bet-inputs');
    betInputsContainer.innerHTML = '';

    this.selectedMarbles.forEach((marbleId) => {
      const betGroup = document.createElement('div');
      betGroup.className = 'bet-input-group';

      betGroup.innerHTML = `
                <div class="marble-preview" style="background: ${
                  this.marbleStyles[marbleId - 1]
                };">${marbleId}</div>
                <label>Marble ${marbleId}:</label>
                <input type="number" 
                       id="bet-${marbleId}" 
                       value="${this.bets[marbleId]}" 
                       min="1" 
                       max="${this.gems}">
                <span>gems</span>
            `;

      betInputsContainer.appendChild(betGroup);

      const input = document.getElementById(`bet-${marbleId}`);
      input.addEventListener('input', (e) =>
        this.handleBetChange(marbleId, e.target.value)
      );
    });
  }

  handleBetChange(marbleId, value) {
    if (this.gamePhase !== 'betting') return;
    const betAmount = parseInt(value) || 0;
    this.bets[marbleId] = Math.max(1, Math.min(betAmount, this.gems));
  }

  startBettingPhase() {
    this.gamePhase = 'betting';
    this.bettingTimeLeft = 15;
    
    // Clear any existing timers
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.raceTimer) clearInterval(this.raceTimer);
    
    // Only clear the racing marbles, keep results visible
    this.clearRaceTrack();
    
    // Enable marble selection
    document.querySelectorAll('.marble').forEach(marble => {
      marble.style.pointerEvents = 'auto';
      marble.style.opacity = '1';
    });
    
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
    this.gamePhase = 'racing';
    this.racingTimeLeft = 15;
    
    // Disable marble selection
    document.querySelectorAll('.marble').forEach(marble => {
      marble.style.pointerEvents = 'none';
      marble.style.opacity = '0.7';
    });
    
    // Process bets
    const totalBet = Object.values(this.bets).reduce((sum, bet) => sum + bet, 0);
    if (totalBet > 0 && totalBet <= this.gems) {
      this.gems -= totalBet;
      this.updateGemDisplay();
      this.saveGems();
    }
    
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
    const timeLeft = this.gamePhase === 'betting' ? this.bettingTimeLeft : this.racingTimeLeft;
    const phase = this.gamePhase === 'betting' ? 'Betting' : 'Racing';
    const statusMessage = `${phase} Phase: ${timeLeft}s remaining`;
    this.updateRaceStatusMessage(statusMessage);
    
    // Update CSS class for visual phase indication
    const statusElement = document.getElementById('race-status');
    statusElement.className = `race-status ${this.gamePhase}-phase`;
  }

  resetBets() {
    if (this.gamePhase !== 'betting') return;

    this.selectedMarbles.clear();
    this.bets = {};

    document.querySelectorAll('.marble').forEach((marble) => {
      marble.classList.remove('selected');
    });

    this.updateBettingInterface();
    this.clearError();
  }

  async startRace() {
    await this.simulateRace();
  }

  async simulateRace() {
    const allMarbles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // All 10 marbles race
    const raceTrack = document.getElementById('race-marbles');
    const trackWidth = document.getElementById('race-track').clientWidth - 100;

    raceTrack.innerHTML = '';

    const marbleElements = allMarbles.map((marbleId) => {
      const marble = document.createElement('div');
      marble.className = 'racing-marble';
      marble.style.background = this.marbleStyles[marbleId - 1];
      marble.textContent = marbleId;
      marble.style.left = '0px';
      marble.dataset.id = marbleId;
      marble.dataset.distance = '0';
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
          const newDistance = Math.min(currentDistance + randomSpeed * 15, targetDistance + (Math.random() - 0.5) * 50);

          marble.dataset.distance = newDistance.toString();
          marble.style.left = `${Math.min(Math.max(newDistance, 0), trackWidth)}px`;

          if (
            progress >= 1 &&
            !raceResults.find((r) => r.id === parseInt(marble.dataset.id))
          ) {
            marble.dataset.finished = 'true';
            raceResults.push({
              id: parseInt(marble.dataset.id),
              position: raceResults.length + 1,
              finalDistance: newDistance
            });
          }
        });

        if (progress >= 1 && raceResults.length === 0) {
          // Force finish all marbles
          marbleElements.forEach((marble) => {
            if (!marble.dataset.finished) {
              marble.dataset.finished = 'true';
              raceResults.push({
                id: parseInt(marble.dataset.id),
                position: raceResults.length + 1,
                finalDistance: parseFloat(marble.dataset.distance)
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
    const resultsContainer = document.getElementById('race-results');
    resultsContainer.innerHTML = '<div class="results-header">🏁 Last Race Results</div>';

    results.forEach((result) => {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';

      if (result.position === 1) resultItem.classList.add('first');
      else if (result.position === 2) resultItem.classList.add('second');
      else if (result.position === 3) resultItem.classList.add('third');

      const positionText = this.getPositionText(result.position);

      resultItem.innerHTML = `
                <div class="position">${positionText}</div>
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

  getPositionText(position) {
    const positions = [
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
      '6th',
      '7th',
      '8th',
      '9th',
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

    const payoutContainer = document.getElementById('payout-info');
    const totalBet = Object.values(this.bets).reduce(
      (sum, bet) => sum + bet,
      0
    );
    const netResult = totalWinnings - totalBet;

    let payoutHTML = '<h3>💰 Last Race Payout</h3>';

    if (payoutDetails.length > 0) {
      payoutDetails.forEach((detail) => {
        payoutHTML += `<div>Marble ${detail.marbleId} (${this.getPositionText(
          detail.position
        )}): ${detail.betAmount} × ${detail.multiplier} = ${
          detail.winnings
        } gems</div>`;
      });
    } else {
      payoutHTML += '<div>No winning positions</div>';
    }

    payoutHTML += `<div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">`;
    payoutHTML += `<div>Total Bet: -${totalBet} gems</div>`;
    payoutHTML += `<div>Total Winnings: +${totalWinnings} gems</div>`;

    if (netResult > 0) {
      payoutHTML += `<div class="payout-positive">Net Result: +${netResult} gems 🎉</div>`;
    } else if (netResult < 0) {
      payoutHTML += `<div class="payout-negative">Net Result: ${netResult} gems</div>`;
    } else {
      payoutHTML += `<div>Net Result: Break Even</div>`;
    }

    payoutHTML += '</div>';
    payoutContainer.innerHTML = payoutHTML;
  }

  updateGemDisplay() {
    document.getElementById('gem-count').textContent = this.gems;
  }

  updateRaceStatusMessage(message) {
    document.getElementById('race-status').textContent = message;
  }

  showError(message) {
    document.getElementById('error-message').textContent = message;
  }

  clearError() {
    document.getElementById('error-message').textContent = '';
  }

  clearResults() {
    document.getElementById('race-results').innerHTML = '';
    document.getElementById('payout-info').innerHTML = '';
    document.getElementById('race-marbles').innerHTML = '';
  }
  
  clearRaceTrack() {
    document.getElementById('race-marbles').innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MarbleRaceGame();
});
