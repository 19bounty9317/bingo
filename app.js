// Simple peer-to-peer game state management using localStorage and polling
// For production, consider using Firebase, Socket.io, or similar real-time service

class BingoGame {
    constructor() {
        this.playerId = this.generateId();
        this.gameId = null;
        this.isHost = false;
        this.gameState = null;
        this.pollInterval = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Screens
        this.setupScreen = document.getElementById('setupScreen');
        this.joinScreen = document.getElementById('joinScreen');
        this.waitingScreen = document.getElementById('waitingScreen');
        this.gameScreen = document.getElementById('gameScreen');
        
        // Buttons
        this.createGameBtn = document.getElementById('createGameBtn');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.joinGameConfirmBtn = document.getElementById('joinGameConfirmBtn');
        this.backToSetupBtn = document.getElementById('backToSetupBtn');
        this.copyGameIdBtn = document.getElementById('copyGameIdBtn');
        this.cancelGameBtn = document.getElementById('cancelGameBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        // Inputs
        this.minNumberInput = document.getElementById('minNumber');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.allowDuplicatesInput = document.getElementById('allowDuplicates');
        this.gameIdInput = document.getElementById('gameIdInput');
        
        // Displays
        this.playerIdDisplay = document.getElementById('playerIdDisplay');
        this.gameIdDisplay = document.getElementById('gameIdDisplay');
        this.yourScore = document.getElementById('yourScore');
        this.opponentScore = document.getElementById('opponentScore');
        this.gameStatus = document.getElementById('gameStatus');
        this.yourBoard = document.getElementById('yourBoard');
        this.opponentBoard = document.getElementById('opponentBoard');
        this.winnerModal = document.getElementById('winnerModal');
        this.winnerText = document.getElementById('winnerText');
    }

    attachEventListeners() {
        this.createGameBtn.addEventListener('click', () => this.createGame());
        this.joinGameBtn.addEventListener('click', () => this.showJoinScreen());
        this.joinGameConfirmBtn.addEventListener('click', () => this.joinGame());
        this.backToSetupBtn.addEventListener('click', () => this.showSetupScreen());
        this.copyGameIdBtn.addEventListener('click', () => this.copyGameId());
        this.cancelGameBtn.addEventListener('click', () => this.cancelGame());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    generateId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    createGame() {
        const min = parseInt(this.minNumberInput.value);
        const max = parseInt(this.maxNumberInput.value);
        const allowDuplicates = this.allowDuplicatesInput.checked;

        if (min >= max) {
            alert('Minimum muss kleiner als Maximum sein!');
            return;
        }

        this.gameId = this.generateId();
        this.isHost = true;

        const numbers = this.generateBingoNumbers(min, max, allowDuplicates);
        
        this.gameState = {
            gameId: this.gameId,
            host: this.playerId,
            guest: null,
            settings: { min, max, allowDuplicates },
            hostBoard: numbers.host,
            guestBoard: numbers.guest,
            hostMarked: [],
            guestMarked: [],
            status: 'waiting',
            winner: null
        };

        this.saveGameState();
        this.showWaitingScreen();
        this.startPolling();
    }

    joinGame() {
        const gameId = this.gameIdInput.value.trim().toUpperCase();
        
        if (!gameId) {
            alert('Bitte Spiel-ID eingeben!');
            return;
        }

        const gameState = this.loadGameState(gameId);
        
        if (!gameState) {
            alert('Spiel nicht gefunden!');
            return;
        }

        if (gameState.guest) {
            alert('Spiel ist bereits voll!');
            return;
        }

        this.gameId = gameId;
        this.isHost = false;
        this.gameState = gameState;
        this.gameState.guest = this.playerId;
        this.gameState.status = 'playing';
        
        this.saveGameState();
        this.showGameScreen();
        this.startPolling();
    }

    generateBingoNumbers(min, max, allowDuplicates) {
        const generateBoard = () => {
            const board = [];
            const used = new Set();
            
            for (let i = 0; i < 25; i++) {
                if (i === 12) {
                    board.push('FREE');
                    continue;
                }
                
                let num;
                do {
                    num = Math.floor(Math.random() * (max - min + 1)) + min;
                } while (!allowDuplicates && used.has(num));
                
                used.add(num);
                board.push(num);
            }
            
            return board;
        };

        return {
            host: generateBoard(),
            guest: generateBoard()
        };
    }

    renderBoard(board, markedIndices, container, isYourBoard) {
        container.innerHTML = '';
        
        board.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.textContent = number;
            
            if (number === 'FREE') {
                cell.classList.add('free');
            } else if (markedIndices.includes(index)) {
                cell.classList.add(isYourBoard ? 'marked' : 'opponent-marked');
            }
            
            if (isYourBoard && number !== 'FREE') {
                cell.addEventListener('click', () => this.markCell(index));
            }
            
            container.appendChild(cell);
        });
    }

    markCell(index) {
        if (this.gameState.status !== 'playing') return;
        
        const markedArray = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        
        if (markedArray.includes(index)) {
            const idx = markedArray.indexOf(index);
            markedArray.splice(idx, 1);
        } else {
            markedArray.push(index);
        }
        
        this.saveGameState();
        this.updateGameDisplay();
        this.checkWinner();
    }

    checkWinner() {
        const markedArray = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        const board = this.isHost ? this.gameState.hostBoard : this.gameState.guestBoard;
        
        // Winning patterns
        const patterns = [
            // Rows
            [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
            // Columns
            [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
            // Diagonals
            [0,6,12,18,24], [4,8,12,16,20]
        ];
        
        const marked = new Set([...markedArray, 12]); // Include FREE space
        
        for (const pattern of patterns) {
            if (pattern.every(i => marked.has(i))) {
                this.gameState.winner = this.isHost ? 'host' : 'guest';
                this.gameState.status = 'finished';
                this.saveGameState();
                this.showWinner();
                return;
            }
        }
    }

    showWinner() {
        const isWinner = (this.isHost && this.gameState.winner === 'host') || 
                        (!this.isHost && this.gameState.winner === 'guest');
        
        this.winnerText.textContent = isWinner ? '🎉 Du hast gewonnen! 🎉' : '😔 Gegner hat gewonnen!';
        this.winnerModal.classList.remove('hidden');
    }

    closeModal() {
        this.winnerModal.classList.add('hidden');
    }

    updateGameDisplay() {
        const yourBoard = this.isHost ? this.gameState.hostBoard : this.gameState.guestBoard;
        const opponentBoard = this.isHost ? this.gameState.guestBoard : this.gameState.hostBoard;
        const yourMarked = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        const opponentMarked = this.isHost ? this.gameState.guestMarked : this.gameState.hostMarked;
        
        this.renderBoard(yourBoard, yourMarked, this.yourBoard, true);
        this.renderBoard(opponentBoard, opponentMarked, this.opponentBoard, false);
        
        this.yourScore.textContent = yourMarked.length + 1; // +1 for FREE
        this.opponentScore.textContent = opponentMarked.length + 1;
    }

    saveGameState() {
        localStorage.setItem(`bingo_game_${this.gameId}`, JSON.stringify(this.gameState));
    }

    loadGameState(gameId) {
        const data = localStorage.getItem(`bingo_game_${gameId || this.gameId}`);
        return data ? JSON.parse(data) : null;
    }

    startPolling() {
        this.pollInterval = setInterval(() => {
            const updatedState = this.loadGameState();
            
            if (!updatedState) {
                this.stopPolling();
                alert('Spiel wurde beendet!');
                this.resetGame();
                return;
            }
            
            this.gameState = updatedState;
            
            if (this.isHost && updatedState.status === 'playing' && this.gameScreen.classList.contains('hidden')) {
                this.showGameScreen();
            }
            
            if (!this.gameScreen.classList.contains('hidden')) {
                this.updateGameDisplay();
            }
        }, 1000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    copyGameId() {
        navigator.clipboard.writeText(this.gameId).then(() => {
            alert('Spiel-ID kopiert!');
        });
    }

    cancelGame() {
        if (this.gameId) {
            localStorage.removeItem(`bingo_game_${this.gameId}`);
        }
        this.stopPolling();
        this.resetGame();
    }

    resetGame() {
        this.stopPolling();
        this.gameId = null;
        this.isHost = false;
        this.gameState = null;
        this.showSetupScreen();
    }

    showSetupScreen() {
        this.setupScreen.classList.remove('hidden');
        this.joinScreen.classList.add('hidden');
        this.waitingScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
    }

    showJoinScreen() {
        this.setupScreen.classList.add('hidden');
        this.joinScreen.classList.remove('hidden');
    }

    showWaitingScreen() {
        this.setupScreen.classList.add('hidden');
        this.waitingScreen.classList.remove('hidden');
        this.playerIdDisplay.textContent = this.playerId;
        this.gameIdDisplay.textContent = this.gameId;
    }

    showGameScreen() {
        this.waitingScreen.classList.add('hidden');
        this.joinScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.updateGameDisplay();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
});
