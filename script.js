class MarbleRaceGame {
    constructor() {
        this.gems = this.loadGems();
        this.selectedMarbles = new Set();
        this.bets = {};
        this.isRacing = false;
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
            "linear-gradient(135deg, #636e72, #2d3436)"
        ];
        
        this.initializeEventListeners();
        this.updateGemDisplay();
        this.updateRaceStatusMessage();
    }

    loadGems() {
        const savedGems = localStorage.getItem('marbleRaceGems');
        return savedGems ? parseInt(savedGems) : 1000;
    }

    saveGems() {
        localStorage.setItem('marbleRaceGems', this.gems.toString());
    }

    initializeEventListeners() {
        document.querySelectorAll('.marble').forEach(marble => {
            marble.addEventListener('click', (e) => this.handleMarbleSelection(e));
        });

        document.getElementById('reset-bets').addEventListener('click', () => this.resetBets());
        document.getElementById('start-race').addEventListener('click', () => this.startRace());
    }

    handleMarbleSelection(event) {
        if (this.isRacing) return;

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
        this.validateAndUpdateStartButton();
        this.clearError();
    }

    updateBettingInterface() {
        const betInputsContainer = document.getElementById('bet-inputs');
        betInputsContainer.innerHTML = '';

        this.selectedMarbles.forEach(marbleId => {
            const betGroup = document.createElement('div');
            betGroup.className = 'bet-input-group';
            
            betGroup.innerHTML = `
                <div class="marble-preview" style="background: ${this.marbleStyles[marbleId - 1]};">${marbleId}</div>
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
            input.addEventListener('input', (e) => this.handleBetChange(marbleId, e.target.value));
        });
    }

    handleBetChange(marbleId, value) {
        const betAmount = parseInt(value) || 0;
        this.bets[marbleId] = Math.max(1, Math.min(betAmount, this.gems));
        this.validateAndUpdateStartButton();
    }

    validateAndUpdateStartButton() {
        const startButton = document.getElementById('start-race');
        const totalBet = Object.values(this.bets).reduce((sum, bet) => sum + bet, 0);
        
        if (this.selectedMarbles.size === 0) {
            startButton.disabled = true;
            this.updateRaceStatusMessage('Select marbles and place bets to start racing!');
        } else if (totalBet > this.gems) {
            startButton.disabled = true;
            this.showError(`Total bet (${totalBet}) exceeds available gems (${this.gems})`);
        } else if (totalBet === 0) {
            startButton.disabled = true;
            this.showError('Place at least 1 gem bet to start racing');
        } else {
            startButton.disabled = false;
            this.clearError();
            this.updateRaceStatusMessage(`Ready to race! Total bet: ${totalBet} gems`);
        }
    }

    resetBets() {
        if (this.isRacing) return;

        this.selectedMarbles.clear();
        this.bets = {};
        
        document.querySelectorAll('.marble').forEach(marble => {
            marble.classList.remove('selected');
        });
        
        this.updateBettingInterface();
        this.validateAndUpdateStartButton();
        this.clearResults();
        this.clearError();
    }

    async startRace() {
        if (this.isRacing || this.selectedMarbles.size === 0) return;

        this.isRacing = true;
        document.getElementById('start-race').disabled = true;
        this.clearResults();
        this.clearError();

        const totalBet = Object.values(this.bets).reduce((sum, bet) => sum + bet, 0);
        this.gems -= totalBet;
        this.updateGemDisplay();
        this.saveGems();

        this.updateRaceStatusMessage('Race starting...');
        
        await this.simulateRace();
    }

    async simulateRace() {
        const raceMarbles = Array.from(this.selectedMarbles);
        const raceTrack = document.getElementById('race-marbles');
        const trackWidth = document.getElementById('race-track').clientWidth - 100;
        
        raceTrack.innerHTML = '';

        const marbleElements = raceMarbles.map(marbleId => {
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

        this.updateRaceStatusMessage('Racing in progress...');

        const raceResults = [];
        const raceDuration = 3000 + Math.random() * 4000; // 3-7 seconds
        const startTime = Date.now();

        return new Promise((resolve) => {
            const raceInterval = setInterval(() => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / raceDuration, 1);

                marbleElements.forEach(marble => {
                    if (marble.dataset.finished) return;

                    const randomSpeed = 0.5 + Math.random() * 0.5;
                    const currentDistance = parseFloat(marble.dataset.distance);
                    const newDistance = currentDistance + (randomSpeed * 2);
                    
                    marble.dataset.distance = newDistance.toString();
                    marble.style.left = `${Math.min(newDistance, trackWidth)}px`;

                    if (newDistance >= trackWidth && !raceResults.find(r => r.id === parseInt(marble.dataset.id))) {
                        marble.dataset.finished = 'true';
                        raceResults.push({
                            id: parseInt(marble.dataset.id),
                            position: raceResults.length + 1
                        });
                    }
                });

                if (raceResults.length === marbleElements.length || progress >= 1) {
                    clearInterval(raceInterval);

                    marbleElements.forEach(marble => {
                        if (!raceResults.find(r => r.id === parseInt(marble.dataset.id))) {
                            raceResults.push({
                                id: parseInt(marble.dataset.id),
                                position: raceResults.length + 1
                            });
                        }
                    });

                    raceResults.sort((a, b) => a.position - b.position);
                    this.finishRace(raceResults);
                    resolve();
                }
            }, 50);
        });
    }

    finishRace(results) {
        this.updateRaceStatusMessage('Race finished!');
        this.displayResults(results);
        this.calculateAndDisplayPayouts(results);
        
        this.isRacing = false;
        document.getElementById('start-race').disabled = false;
        this.validateAndUpdateStartButton();
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('race-results');
        resultsContainer.innerHTML = '';

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            if (result.position === 1) resultItem.classList.add('first');
            else if (result.position === 2) resultItem.classList.add('second');
            else if (result.position === 3) resultItem.classList.add('third');

            const positionText = this.getPositionText(result.position);
            
            resultItem.innerHTML = `
                <div class="position">${positionText}</div>
                <div class="marble-info">
                    <div class="marble-preview" style="background: ${this.marbleStyles[result.id - 1]};">${result.id}</div>
                    <span>Marble ${result.id}</span>
                </div>
            `;
            
            resultsContainer.appendChild(resultItem);
        });
    }

    getPositionText(position) {
        const positions = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
        return positions[position - 1] || `${position}th`;
    }

    calculateAndDisplayPayouts(results) {
        let totalWinnings = 0;
        const payoutDetails = [];

        results.forEach(result => {
            const marbleId = result.id;
            const betAmount = this.bets[marbleId] || 0;
            let multiplier = 0;
            let winnings = 0;

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
                    winnings
                });
            }
        });

        this.gems += totalWinnings;
        this.updateGemDisplay();
        this.saveGems();

        const payoutContainer = document.getElementById('payout-info');
        const totalBet = Object.values(this.bets).reduce((sum, bet) => sum + bet, 0);
        const netResult = totalWinnings - totalBet;

        let payoutHTML = '<h3>Payout Summary</h3>';
        
        if (payoutDetails.length > 0) {
            payoutDetails.forEach(detail => {
                payoutHTML += `<div>Marble ${detail.marbleId} (${this.getPositionText(detail.position)}): ${detail.betAmount} × ${detail.multiplier} = ${detail.winnings} gems</div>`;
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
}

document.addEventListener('DOMContentLoaded', () => {
    new MarbleRaceGame();
});