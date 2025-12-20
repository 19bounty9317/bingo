// Rocket League Bingo - Online Multiplayer mit Firebase

class BingoGame {
    constructor() {
        this.username = null;
        this.playerId = null;
        this.gameId = null;
        this.isHost = false;
        this.gameState = null;
        this.gameListener = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkLogin();
        this.waitForFirebase();
    }

    waitForFirebase() {
        // Warte bis Firebase geladen ist
        const checkFirebase = setInterval(() => {
            if (window.firebaseDb) {
                clearInterval(checkFirebase);
                console.log('✅ Firebase verbunden!');
            }
        }, 100);
    }

    initializeElements() {
        // Screens
        this.loginScreen = document.getElementById('loginScreen');
        this.setupScreen = document.getElementById('setupScreen');
        this.joinScreen = document.getElementById('joinScreen');
        this.waitingScreen = document.getElementById('waitingScreen');
        this.gameScreen = document.getElementById('gameScreen');
        
        // Buttons
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.createGameBtn = document.getElementById('createGameBtn');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.joinGameConfirmBtn = document.getElementById('joinGameConfirmBtn');
        this.backToSetupBtn = document.getElementById('backToSetupBtn');
        this.copyGameIdBtn = document.getElementById('copyGameIdBtn');
        this.cancelGameBtn = document.getElementById('cancelGameBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        // Inputs
        this.usernameInput = document.getElementById('usernameInput');
        this.minNumberInput = document.getElementById('minNumber');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.allowDuplicatesInput = document.getElementById('allowDuplicates');
        this.gameIdInput = document.getElementById('gameIdInput');
        
        // Displays
        this.currentUsername = document.getElementById('currentUsername');
        this.currentUsernameJoin = document.getElementById('currentUsernameJoin');
        this.playerNameDisplay = document.getElementById('playerNameDisplay');
        this.gameIdDisplay = document.getElementById('gameIdDisplay');
        this.yourName = document.getElementById('yourName');
        this.opponentName = document.getElementById('opponentName');
        this.yourScore = document.getElementById('yourScore');
        this.opponentScore = document.getElementById('opponentScore');
        this.yourBingoStatus = document.getElementById('yourBingoStatus');
        this.opponentBingoStatus = document.getElementById('opponentBingoStatus');
        this.gameStatus = document.getElementById('gameStatus');
        this.yourBoard = document.getElementById('yourBoard');
        this.opponentBoard = document.getElementById('opponentBoard');
        this.winnerModal = document.getElementById('winnerModal');
        this.winnerText = document.getElementById('winnerText');
    }

    attachEventListeners() {
        this.loginBtn.addEventListener('click', () => this.login());
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.createGameBtn.addEventListener('click', () => this.createGame());
        this.joinGameBtn.addEventListener('click', () => this.showJoinScreen());
        this.joinGameConfirmBtn.addEventListener('click', () => this.joinGame());
        this.backToSetupBtn.addEventListener('click', () => this.showSetupScreen());
        this.copyGameIdBtn.addEventListener('click', () => this.copyGameId());
        this.cancelGameBtn.addEventListener('click', () => this.cancelGame());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Enter key support
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        this.gameIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinGame();
        });
    }

    checkLogin() {
        const savedUser = localStorage.getItem('bingo_username');
        if (savedUser) {
            this.username = savedUser;
            this.playerId = this.generateId();
            this.showSetupScreen();
        }
    }

    login() {
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            alert('Bitte gib einen Benutzernamen ein!');
            return;
        }
        
        if (username.length < 3) {
            alert('Benutzername muss mindestens 3 Zeichen lang sein!');
            return;
        }
        
        this.username = username;
        this.playerId = this.generateId();
        localStorage.setItem('bingo_username', username);
        this.showSetupScreen();
    }

    logout() {
        localStorage.removeItem('bingo_username');
        this.username = null;
        this.playerId = null;
        this.showLoginScreen();
    }

    generateId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    async createGame() {
        const min = parseInt(this.minNumberInput.value);
        const max = parseInt(this.maxNumberInput.value);
        const allowDuplicates = this.allowDuplicatesInput.checked;

        if (min >= max) {
            alert('Minimum muss kleiner als Maximum sein!');
            return;
        }

        if (!window.firebaseDb) {
            alert('Firebase wird geladen, bitte warte einen Moment...');
            return;
        }

        this.gameId = this.generateId();
        this.isHost = true;

        const numbers = this.generateBingoNumbers(min, max, allowDuplicates);
        
        this.gameState = {
            gameId: this.gameId,
            hostId: this.playerId,
            hostName: this.username,
            guestId: null,
            guestName: null,
            settings: { min, max, allowDuplicates },
            hostBoard: numbers.host,
            guestBoard: numbers.guest,
            hostMarked: [],
            guestMarked: [],
            hostBingos: [],
            guestBingos: [],
            status: 'waiting',
            winner: null,
            createdAt: Date.now()
        };

        await this.saveGameState();
        this.showWaitingScreen();
        this.listenToGameChanges();
    }

    async joinGame() {
        const gameId = this.gameIdInput.value.trim().toUpperCase();
        
        if (!gameId) {
            alert('Bitte Spiel-ID eingeben!');
            return;
        }

        if (!window.firebaseDb) {
            alert('Firebase wird geladen, bitte warte einen Moment...');
            return;
        }

        try {
            const gameState = await this.loadGameState(gameId);
            
            if (!gameState) {
                alert('Spiel nicht gefunden!');
                return;
            }

            if (gameState.guestId) {
                alert('Spiel ist bereits voll!');
                return;
            }

            this.gameId = gameId;
            this.isHost = false;
            this.gameState = gameState;
            this.gameState.guestId = this.playerId;
            this.gameState.guestName = this.username;
            this.gameState.status = 'playing';
            
            await this.saveGameState();
            this.showGameScreen();
            this.listenToGameChanges();
        } catch (error) {
            console.error('Fehler beim Beitreten:', error);
            alert('Fehler beim Beitreten des Spiels!');
        }
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
            
            if (isYourBoard && number !== 'FREE' && this.gameState.status === 'playing') {
                cell.addEventListener('click', () => this.markCell(index));
            }
            
            container.appendChild(cell);
        });
    }

    async markCell(index) {
        if (this.gameState.status !== 'playing') return;
        
        const markedArray = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        
        if (markedArray.includes(index)) {
            const idx = markedArray.indexOf(index);
            markedArray.splice(idx, 1);
        } else {
            markedArray.push(index);
        }
        
        await this.saveGameState();
        this.updateGameDisplay();
        this.checkForBingos();
    }

    checkForBingos() {
        // Winning patterns
        const patterns = [
            // Rows
            { name: 'Reihe 1', indices: [0,1,2,3,4] },
            { name: 'Reihe 2', indices: [5,6,7,8,9] },
            { name: 'Reihe 3', indices: [10,11,12,13,14] },
            { name: 'Reihe 4', indices: [15,16,17,18,19] },
            { name: 'Reihe 5', indices: [20,21,22,23,24] },
            // Columns
            { name: 'Spalte 1', indices: [0,5,10,15,20] },
            { name: 'Spalte 2', indices: [1,6,11,16,21] },
            { name: 'Spalte 3', indices: [2,7,12,17,22] },
            { name: 'Spalte 4', indices: [3,8,13,18,23] },
            { name: 'Spalte 5', indices: [4,9,14,19,24] },
            // Diagonals
            { name: 'Diagonale ↘', indices: [0,6,12,18,24] },
            { name: 'Diagonale ↙', indices: [4,8,12,16,20] }
        ];
        
        // Check host bingos
        const hostMarked = new Set([...this.gameState.hostMarked, 12]);
        const hostBingos = [];
        for (const pattern of patterns) {
            if (pattern.indices.every(i => hostMarked.has(i))) {
                hostBingos.push(pattern.name);
            }
        }
        
        // Check guest bingos
        const guestMarked = new Set([...this.gameState.guestMarked, 12]);
        const guestBingos = [];
        for (const pattern of patterns) {
            if (pattern.indices.every(i => guestMarked.has(i))) {
                guestBingos.push(pattern.name);
            }
        }
        
        this.gameState.hostBingos = hostBingos;
        this.gameState.guestBingos = guestBingos;
        
        // Check for winner (first to get a bingo)
        if (hostBingos.length > 0 && this.gameState.status === 'playing') {
            this.gameState.winner = 'host';
            this.gameState.status = 'finished';
            this.saveGameState();
            this.showWinner();
        } else if (guestBingos.length > 0 && this.gameState.status === 'playing') {
            this.gameState.winner = 'guest';
            this.gameState.status = 'finished';
            this.saveGameState();
            this.showWinner();
        } else {
            this.saveGameState();
        }
        
        this.updateBingoDisplay();
    }

    updateBingoDisplay() {
        const yourBingos = this.isHost ? this.gameState.hostBingos : this.gameState.guestBingos;
        const opponentBingos = this.isHost ? this.gameState.guestBingos : this.gameState.hostBingos;
        
        if (yourBingos.length > 0) {
            this.yourBingoStatus.textContent = `🎉 BINGO! (${yourBingos.join(', ')})`;
            this.yourBingoStatus.classList.add('has-bingo');
        } else {
            this.yourBingoStatus.textContent = '';
            this.yourBingoStatus.classList.remove('has-bingo');
        }
        
        if (opponentBingos.length > 0) {
            this.opponentBingoStatus.textContent = `🎉 BINGO! (${opponentBingos.join(', ')})`;
            this.opponentBingoStatus.classList.add('has-bingo');
        } else {
            this.opponentBingoStatus.textContent = '';
            this.opponentBingoStatus.classList.remove('has-bingo');
        }
    }

    showWinner() {
        const isWinner = (this.isHost && this.gameState.winner === 'host') || 
                        (!this.isHost && this.gameState.winner === 'guest');
        
        const winnerName = this.gameState.winner === 'host' ? this.gameState.hostName : this.gameState.guestName;
        const yourBingos = this.isHost ? this.gameState.hostBingos : this.gameState.guestBingos;
        const opponentBingos = this.isHost ? this.gameState.guestBingos : this.gameState.hostBingos;
        
        if (isWinner) {
            this.winnerText.innerHTML = `
                🎉 Du hast gewonnen! 🎉<br>
                <small style="font-size: 0.6em; color: #666; margin-top: 10px; display: block;">
                    Deine Bingos: ${yourBingos.join(', ')}
                </small>
            `;
        } else {
            this.winnerText.innerHTML = `
                😔 ${winnerName} hat gewonnen!<br>
                <small style="font-size: 0.6em; color: #666; margin-top: 10px; display: block;">
                    Gegner Bingos: ${opponentBingos.join(', ')}
                </small>
            `;
        }
        
        this.winnerModal.classList.remove('hidden');
    }

    closeModal() {
        this.winnerModal.classList.add('hidden');
    }

    updateGameDisplay() {
        if (!this.gameState) return;
        
        const yourBoard = this.isHost ? this.gameState.hostBoard : this.gameState.guestBoard;
        const opponentBoard = this.isHost ? this.gameState.guestBoard : this.gameState.hostBoard;
        const yourMarked = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        const opponentMarked = this.isHost ? this.gameState.guestMarked : this.gameState.hostMarked;
        
        this.renderBoard(yourBoard, yourMarked, this.yourBoard, true);
        this.renderBoard(opponentBoard, opponentMarked, this.opponentBoard, false);
        
        this.yourScore.textContent = yourMarked.length + 1; // +1 for FREE
        this.opponentScore.textContent = opponentMarked.length + 1;
        
        // Update player names
        this.yourName.textContent = this.username;
        this.opponentName.textContent = this.isHost ? this.gameState.guestName : this.gameState.hostName;
    }

    async saveGameState() {
        if (!window.firebaseDb || !this.gameId) return;
        
        try {
            const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
            await window.firebaseSet(gameRef, this.gameState);
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
        }
    }

    async loadGameState(gameId) {
        if (!window.firebaseDb) return null;
        
        try {
            const gameRef = window.firebaseRef(window.firebaseDb, `games/${gameId || this.gameId}`);
            const snapshot = await window.firebaseGet(gameRef);
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            return null;
        }
    }

    listenToGameChanges() {
        if (!window.firebaseDb || !this.gameId) return;
        
        const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
        
        this.gameListener = window.firebaseOnValue(gameRef, (snapshot) => {
            if (!snapshot.exists()) {
                alert('Spiel wurde beendet!');
                this.resetGame();
                return;
            }
            
            const updatedState = snapshot.val();
            this.gameState = updatedState;
            
            // Host wartet auf Gegner
            if (this.isHost && updatedState.status === 'playing' && this.gameScreen.classList.contains('hidden')) {
                this.showGameScreen();
            }
            
            // Update Display wenn im Spiel
            if (!this.gameScreen.classList.contains('hidden')) {
                this.updateGameDisplay();
                this.updateBingoDisplay();
                
                // Check for winner
                if (updatedState.status === 'finished' && updatedState.winner) {
                    this.showWinner();
                }
            }
        });
    }

    stopListening() {
        if (this.gameListener) {
            this.gameListener();
            this.gameListener = null;
        }
    }

    copyGameId() {
        navigator.clipboard.writeText(this.gameId).then(() => {
            alert('Spiel-ID kopiert! Teile sie mit deinem Gegner.');
        }).catch(() => {
            // Fallback für ältere Browser
            prompt('Kopiere diese Spiel-ID:', this.gameId);
        });
    }

    async cancelGame() {
        if (this.gameId && window.firebaseDb) {
            try {
                const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
                await window.firebaseRemove(gameRef);
            } catch (error) {
                console.error('Fehler beim Löschen:', error);
            }
        }
        this.stopListening();
        this.resetGame();
    }

    resetGame() {
        this.stopListening();
        this.gameId = null;
        this.isHost = false;
        this.gameState = null;
        this.showSetupScreen();
    }

    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.setupScreen.classList.add('hidden');
        this.joinScreen.classList.add('hidden');
        this.waitingScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
    }

    showSetupScreen() {
        this.currentUsername.textContent = this.username;
        this.currentUsernameJoin.textContent = this.username;
        this.loginScreen.classList.add('hidden');
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
        this.playerNameDisplay.textContent = this.username;
        this.gameIdDisplay.textContent = this.gameId;
    }

    showGameScreen() {
        this.waitingScreen.classList.add('hidden');
        this.joinScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.updateGameDisplay();
        this.updateBingoDisplay();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
});
