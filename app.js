// Rocket League Bingo - Online Multiplayer mit User-System

class BingoGame {
    constructor() {
        this.username = null;
        this.userId = null;
        this.playerId = null;
        this.gameId = null;
        this.isHost = false;
        this.gameState = null;
        this.gameListener = null;
        this.userStats = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkLogin();
        this.waitForFirebase();
    }

    waitForFirebase() {
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
        
        // Tabs
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        
        // Buttons
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.createGameBtn = document.getElementById('createGameBtn');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.joinGameConfirmBtn = document.getElementById('joinGameConfirmBtn');
        this.backToSetupBtn = document.getElementById('backToSetupBtn');
        this.copyGameIdBtn = document.getElementById('copyGameIdBtn');
        this.cancelGameBtn = document.getElementById('cancelGameBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        // Login Inputs
        this.loginUsername = document.getElementById('loginUsername');
        this.loginPassword = document.getElementById('loginPassword');
        this.registerUsername = document.getElementById('registerUsername');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
        
        // Game Inputs
        this.minNumberInput = document.getElementById('minNumber');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.allowDuplicatesInput = document.getElementById('allowDuplicates');
        this.gameIdInput = document.getElementById('gameIdInput');
        
        // Displays
        this.currentUsername = document.getElementById('currentUsername');
        this.currentUsernameJoin = document.getElementById('currentUsernameJoin');
        this.winsCount = document.getElementById('winsCount');
        this.lossesCount = document.getElementById('lossesCount');
        this.totalGamesCount = document.getElementById('totalGamesCount');
        this.winsCountJoin = document.getElementById('winsCountJoin');
        this.playerNameDisplay = document.getElementById('playerNameDisplay');
        this.gameIdDisplay = document.getElementById('gameIdDisplay');
        this.yourName = document.getElementById('yourName');
        this.opponentName = document.getElementById('opponentName');
        this.yourWinsDisplay = document.getElementById('yourWinsDisplay');
        this.opponentWinsDisplay = document.getElementById('opponentWinsDisplay');
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
        // Tabs
        this.loginTab.addEventListener('click', () => this.showLoginForm());
        this.registerTab.addEventListener('click', () => this.showRegisterForm());
        
        // Auth
        this.loginBtn.addEventListener('click', () => this.login());
        this.registerBtn.addEventListener('click', () => this.register());
        this.logoutBtn.addEventListener('click', () => this.logout());
        
        // Game
        this.createGameBtn.addEventListener('click', () => this.createGame());
        this.joinGameBtn.addEventListener('click', () => this.showJoinScreen());
        this.joinGameConfirmBtn.addEventListener('click', () => this.joinGame());
        this.backToSetupBtn.addEventListener('click', () => this.showSetupScreen());
        this.copyGameIdBtn.addEventListener('click', () => this.copyGameId());
        this.cancelGameBtn.addEventListener('click', () => this.cancelGame());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Enter key support
        this.loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        this.registerPasswordConfirm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
        this.gameIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinGame();
        });
    }

    showLoginForm() {
        this.loginTab.classList.add('active');
        this.registerTab.classList.remove('active');
        this.loginForm.classList.remove('hidden');
        this.registerForm.classList.add('hidden');
    }

    showRegisterForm() {
        this.registerTab.classList.add('active');
        this.loginTab.classList.remove('active');
        this.registerForm.classList.remove('hidden');
        this.loginForm.classList.add('hidden');
    }

    async checkLogin() {
        const savedUserId = localStorage.getItem('bingo_user_id');
        if (savedUserId && window.firebaseDb) {
            try {
                const user = await this.loadUser(savedUserId);
                if (user) {
                    this.userId = savedUserId;
                    this.username = user.username;
                    this.userStats = user.stats;
                    this.playerId = this.generateId();
                    this.showSetupScreen();
                }
            } catch (error) {
                console.error('Auto-login failed:', error);
            }
        }
    }

    async register() {
        const username = this.registerUsername.value.trim();
        const password = this.registerPassword.value;
        const passwordConfirm = this.registerPasswordConfirm.value;
        
        if (!username || username.length < 3) {
            alert('Benutzername muss mindestens 3 Zeichen lang sein!');
            return;
        }
        
        if (!password || password.length < 6) {
            alert('Passwort muss mindestens 6 Zeichen lang sein!');
            return;
        }
        
        if (password !== passwordConfirm) {
            alert('Passwörter stimmen nicht überein!');
            return;
        }

        if (!window.firebaseDb) {
            alert('Firebase wird geladen, bitte warte...');
            return;
        }

        try {
            // Check if username exists
            const usersRef = window.firebaseRef(window.firebaseDb, 'users');
            const snapshot = await window.firebaseGet(usersRef);
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                for (let userId in users) {
                    if (users[userId].username.toLowerCase() === username.toLowerCase()) {
                        alert('Benutzername bereits vergeben!');
                        return;
                    }
                }
            }

            // Create user
            this.userId = this.generateId();
            const hashedPassword = await this.hashPassword(password);
            
            const userData = {
                userId: this.userId,
                username: username,
                password: hashedPassword,
                stats: {
                    wins: 0,
                    losses: 0,
                    totalGames: 0
                },
                createdAt: Date.now()
            };

            const userRef = window.firebaseRef(window.firebaseDb, `users/${this.userId}`);
            await window.firebaseSet(userRef, userData);

            this.username = username;
            this.userStats = userData.stats;
            this.playerId = this.generateId();
            
            localStorage.setItem('bingo_user_id', this.userId);
            
            alert('✅ Registrierung erfolgreich!');
            this.showSetupScreen();
            
        } catch (error) {
            console.error('Registration error:', error);
            alert('Fehler bei der Registrierung!');
        }
    }

    async login() {
        const username = this.loginUsername.value.trim();
        const password = this.loginPassword.value;
        
        if (!username || !password) {
            alert('Bitte Benutzername und Passwort eingeben!');
            return;
        }

        if (!window.firebaseDb) {
            alert('Firebase wird geladen, bitte warte...');
            return;
        }

        try {
            const usersRef = window.firebaseRef(window.firebaseDb, 'users');
            const snapshot = await window.firebaseGet(usersRef);
            
            if (!snapshot.exists()) {
                alert('Benutzername oder Passwort falsch!');
                return;
            }

            const users = snapshot.val();
            let foundUser = null;
            
            for (let userId in users) {
                if (users[userId].username.toLowerCase() === username.toLowerCase()) {
                    foundUser = { userId, ...users[userId] };
                    break;
                }
            }

            if (!foundUser) {
                alert('Benutzername oder Passwort falsch!');
                return;
            }

            const hashedPassword = await this.hashPassword(password);
            if (hashedPassword !== foundUser.password) {
                alert('Benutzername oder Passwort falsch!');
                return;
            }

            this.userId = foundUser.userId;
            this.username = foundUser.username;
            this.userStats = foundUser.stats;
            this.playerId = this.generateId();
            
            localStorage.setItem('bingo_user_id', this.userId);
            
            this.showSetupScreen();
            
        } catch (error) {
            console.error('Login error:', error);
            alert('Fehler beim Anmelden!');
        }
    }

    async hashPassword(password) {
        // Simple hash for demo - in production use proper encryption!
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'bingo_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async loadUser(userId) {
        if (!window.firebaseDb) return null;
        
        try {
            const userRef = window.firebaseRef(window.firebaseDb, `users/${userId}`);
            const snapshot = await window.firebaseGet(userRef);
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('Load user error:', error);
            return null;
        }
    }

    async updateUserStats(won) {
        if (!this.userId || !window.firebaseDb) return;
        
        try {
            this.userStats.totalGames++;
            if (won) {
                this.userStats.wins++;
            } else {
                this.userStats.losses++;
            }

            const statsRef = window.firebaseRef(window.firebaseDb, `users/${this.userId}/stats`);
            await window.firebaseSet(statsRef, this.userStats);
            
            this.updateStatsDisplay();
        } catch (error) {
            console.error('Update stats error:', error);
        }
    }

    updateStatsDisplay() {
        if (this.winsCount) this.winsCount.textContent = this.userStats.wins;
        if (this.lossesCount) this.lossesCount.textContent = this.userStats.losses;
        if (this.totalGamesCount) this.totalGamesCount.textContent = this.userStats.totalGames;
        if (this.winsCountJoin) this.winsCountJoin.textContent = this.userStats.wins;
        if (this.yourWinsDisplay) this.yourWinsDisplay.textContent = this.userStats.wins;
    }

    logout() {
        localStorage.removeItem('bingo_user_id');
        this.userId = null;
        this.username = null;
        this.userStats = null;
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
            alert('Firebase wird geladen, bitte warte...');
            return;
        }

        this.gameId = this.generateId();
        this.isHost = true;

        const numbers = this.generateBingoNumbers(min, max, allowDuplicates);
        
        this.gameState = {
            gameId: this.gameId,
            hostId: this.playerId,
            hostUserId: this.userId,
            hostName: this.username,
            hostWins: this.userStats.wins,
            guestId: null,
            guestUserId: null,
            guestName: null,
            guestWins: 0,
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
            alert('Firebase wird geladen, bitte warte...');
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
            this.gameState.guestUserId = this.userId;
            this.gameState.guestName = this.username;
            this.gameState.guestWins = this.userStats.wins;
            this.gameState.status = 'playing';
            
            await this.saveGameState();
            this.showGameScreen();
            this.listenToGameChanges();
        } catch (error) {
            console.error('Join error:', error);
            alert('Fehler beim Beitreten!');
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
        const patterns = [
            { name: 'Reihe 1', indices: [0,1,2,3,4] },
            { name: 'Reihe 2', indices: [5,6,7,8,9] },
            { name: 'Reihe 3', indices: [10,11,12,13,14] },
            { name: 'Reihe 4', indices: [15,16,17,18,19] },
            { name: 'Reihe 5', indices: [20,21,22,23,24] },
            { name: 'Spalte 1', indices: [0,5,10,15,20] },
            { name: 'Spalte 2', indices: [1,6,11,16,21] },
            { name: 'Spalte 3', indices: [2,7,12,17,22] },
            { name: 'Spalte 4', indices: [3,8,13,18,23] },
            { name: 'Spalte 5', indices: [4,9,14,19,24] },
            { name: 'Diagonale ↘', indices: [0,6,12,18,24] },
            { name: 'Diagonale ↙', indices: [4,8,12,16,20] }
        ];
        
        const hostMarked = new Set([...this.gameState.hostMarked, 12]);
        const hostBingos = [];
        for (const pattern of patterns) {
            if (pattern.indices.every(i => hostMarked.has(i))) {
                hostBingos.push(pattern.name);
            }
        }
        
        const guestMarked = new Set([...this.gameState.guestMarked, 12]);
        const guestBingos = [];
        for (const pattern of patterns) {
            if (pattern.indices.every(i => guestMarked.has(i))) {
                guestBingos.push(pattern.name);
            }
        }
        
        this.gameState.hostBingos = hostBingos;
        this.gameState.guestBingos = guestBingos;
        
        if (hostBingos.length > 0 && this.gameState.status === 'playing') {
            this.gameState.winner = 'host';
            this.gameState.status = 'finished';
            this.saveGameState();
            
            // Update stats
            if (this.isHost) {
                this.updateUserStats(true);
            } else {
                this.updateUserStats(false);
            }
            
            this.showWinner();
        } else if (guestBingos.length > 0 && this.gameState.status === 'playing') {
            this.gameState.winner = 'guest';
            this.gameState.status = 'finished';
            this.saveGameState();
            
            // Update stats
            if (!this.isHost) {
                this.updateUserStats(true);
            } else {
                this.updateUserStats(false);
            }
            
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
                    Deine Bingos: ${yourBingos.join(', ')}<br>
                    Neue Statistik: ${this.userStats.wins} Siege
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

    async updateGameDisplay() {
        if (!this.gameState) return;
        
        const yourBoard = this.isHost ? this.gameState.hostBoard : this.gameState.guestBoard;
        const opponentBoard = this.isHost ? this.gameState.guestBoard : this.gameState.hostBoard;
        const yourMarked = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        const opponentMarked = this.isHost ? this.gameState.guestMarked : this.gameState.hostMarked;
        
        this.renderBoard(yourBoard, yourMarked, this.yourBoard, true);
        this.renderBoard(opponentBoard, opponentMarked, this.opponentBoard, false);
        
        this.yourScore.textContent = yourMarked.length + 1;
        this.opponentScore.textContent = opponentMarked.length + 1;
        
        this.yourName.textContent = this.username;
        this.opponentName.textContent = this.isHost ? this.gameState.guestName : this.gameState.hostName;
        
        this.yourWinsDisplay.textContent = this.isHost ? this.gameState.hostWins : this.gameState.guestWins;
        this.opponentWinsDisplay.textContent = this.isHost ? this.gameState.guestWins : this.gameState.hostWins;
    }

    async saveGameState() {
        if (!window.firebaseDb || !this.gameId) return;
        
        try {
            const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
            await window.firebaseSet(gameRef, this.gameState);
        } catch (error) {
            console.error('Save error:', error);
        }
    }

    async loadGameState(gameId) {
        if (!window.firebaseDb) return null;
        
        try {
            const gameRef = window.firebaseRef(window.firebaseDb, `games/${gameId || this.gameId}`);
            const snapshot = await window.firebaseGet(gameRef);
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('Load error:', error);
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
            
            if (this.isHost && updatedState.status === 'playing' && this.gameScreen.classList.contains('hidden')) {
                this.showGameScreen();
            }
            
            if (!this.gameScreen.classList.contains('hidden')) {
                this.updateGameDisplay();
                this.updateBingoDisplay();
                
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
            alert('Spiel-ID kopiert!');
        }).catch(() => {
            prompt('Kopiere diese Spiel-ID:', this.gameId);
        });
    }

    async cancelGame() {
        if (this.gameId && window.firebaseDb) {
            try {
                const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
                await window.firebaseRemove(gameRef);
            } catch (error) {
                console.error('Delete error:', error);
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
        this.updateStatsDisplay();
        
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

document.addEventListener('DOMContentLoaded', () => {
    new BingoGame();
});


// ===== ONLINE PLAYER SYSTEM =====

BingoGame.prototype.onlineListener = null;
BingoGame.prototype.challengeListener = null;
BingoGame.prototype.onlinePlayers = {};
BingoGame.prototype.pendingChallenge = null;

BingoGame.prototype.startOnlinePresence = async function() {
    if (!window.firebaseDb || !this.userId) return;
    
    const presenceRef = window.firebaseRef(window.firebaseDb, `online/${this.userId}`);
    const presenceData = {
        userId: this.userId,
        username: this.username,
        wins: this.userStats.wins,
        lastSeen: Date.now()
    };
    
    await window.firebaseSet(presenceRef, presenceData);
    
    // Update every 30 seconds
    this.presenceInterval = setInterval(async () => {
        await window.firebaseSet(presenceRef, { ...presenceData, lastSeen: Date.now() });
    }, 30000);
    
    // Remove on disconnect
    window.addEventListener('beforeunload', () => {
        window.firebaseRemove(presenceRef);
    });
    
    this.listenToOnlinePlayers();
    this.listenToChallenges();
};

BingoGame.prototype.listenToOnlinePlayers = function() {
    if (!window.firebaseDb) return;
    
    const onlineRef = window.firebaseRef(window.firebaseDb, 'online');
    this.onlineListener = window.firebaseOnValue(onlineRef, (snapshot) => {
        if (!snapshot.exists()) {
            this.renderOnlinePlayers({});
            return;
        }
        
        const players = snapshot.val();
        const now = Date.now();
        const activePlayers = {};
        
        // Filter players active in last 2 minutes
        for (let userId in players) {
            if (now - players[userId].lastSeen < 120000) {
                activePlayers[userId] = players[userId];
            }
        }
        
        this.onlinePlayers = activePlayers;
        this.renderOnlinePlayers(activePlayers);
    });
};

BingoGame.prototype.renderOnlinePlayers = function(players) {
    const container = document.getElementById('onlinePlayersList');
    if (!container) return;
    
    const playerCount = Object.keys(players).length;
    
    if (playerCount === 0 || (playerCount === 1 && players[this.userId])) {
        container.innerHTML = '<p class="loading-text">Keine anderen Spieler online</p>';
        return;
    }
    
    container.innerHTML = '';
    
    for (let userId in players) {
        if (userId === this.userId) continue;
        
        const player = players[userId];
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        
        playerDiv.innerHTML = `
            <div class="player-info-item">
                <div class="online-indicator"></div>
                <div>
                    <div class="player-name-item">${player.username}</div>
                    <div class="player-stats-item">🏆 ${player.wins} Siege</div>
                </div>
            </div>
            <button class="challenge-btn" data-user-id="${userId}">Herausfordern</button>
        `;
        
        const btn = playerDiv.querySelector('.challenge-btn');
        btn.addEventListener('click', () => this.challengePlayer(userId, player.username));
        
        container.appendChild(playerDiv);
    }
};

BingoGame.prototype.challengePlayer = async function(targetUserId, targetUsername) {
    if (!window.firebaseDb) return;
    
    const min = parseInt(this.minNumberInput.value);
    const max = parseInt(this.maxNumberInput.value);
    const allowDuplicates = this.allowDuplicatesInput.checked;
    
    if (min >= max) {
        alert('Minimum muss kleiner als Maximum sein!');
        return;
    }
    
    this.gameId = this.generateId();
    const numbers = this.generateBingoNumbers(min, max, allowDuplicates);
    
    const challengeData = {
        challengeId: this.gameId,
        fromUserId: this.userId,
        fromUsername: this.username,
        toUserId: targetUserId,
        toUsername: targetUsername,
        settings: { min, max, allowDuplicates },
        boards: numbers,
        status: 'pending',
        createdAt: Date.now()
    };
    
    const challengeRef = window.firebaseRef(window.firebaseDb, `challenges/${this.gameId}`);
    await window.firebaseSet(challengeRef, challengeData);
    
    alert(`Herausforderung an ${targetUsername} gesendet!`);
};

BingoGame.prototype.listenToChallenges = function() {
    if (!window.firebaseDb || !this.userId) return;
    
    const challengesRef = window.firebaseRef(window.firebaseDb, 'challenges');
    this.challengeListener = window.firebaseOnValue(challengesRef, (snapshot) => {
        if (!snapshot.exists()) return;
        
        const challenges = snapshot.val();
        
        for (let challengeId in challenges) {
            const challenge = challenges[challengeId];
            
            if (challenge.toUserId === this.userId && challenge.status === 'pending') {
                this.showChallengeModal(challenge);
                break;
            }
        }
    });
};

BingoGame.prototype.showChallengeModal = function(challenge) {
    this.pendingChallenge = challenge;
    
    const modal = document.getElementById('challengeModal');
    const text = document.getElementById('challengeText');
    
    text.textContent = `${challenge.fromUsername} fordert dich heraus! (${challenge.settings.min}-${challenge.settings.max})`;
    modal.classList.remove('hidden');
    
    const acceptBtn = document.getElementById('acceptChallengeBtn');
    const declineBtn = document.getElementById('declineChallengeBtn');
    
    acceptBtn.onclick = () => this.acceptChallenge();
    declineBtn.onclick = () => this.declineChallenge();
};

BingoGame.prototype.acceptChallenge = async function() {
    if (!this.pendingChallenge || !window.firebaseDb) return;
    
    const challenge = this.pendingChallenge;
    this.gameId = challenge.challengeId;
    this.isHost = false;
    
    this.gameState = {
        gameId: this.gameId,
        hostId: this.generateId(),
        hostUserId: challenge.fromUserId,
        hostName: challenge.fromUsername,
        hostWins: 0,
        guestId: this.generateId(),
        guestUserId: this.userId,
        guestName: this.username,
        guestWins: this.userStats.wins,
        settings: challenge.settings,
        hostBoard: challenge.boards.host,
        guestBoard: challenge.boards.guest,
        hostMarked: [],
        guestMarked: [],
        hostBingos: [],
        guestBingos: [],
        status: 'playing',
        winner: null,
        createdAt: Date.now()
    };
    
    await this.saveGameState();
    
    const challengeRef = window.firebaseRef(window.firebaseDb, `challenges/${challenge.challengeId}`);
    await window.firebaseRemove(challengeRef);
    
    document.getElementById('challengeModal').classList.add('hidden');
    this.pendingChallenge = null;
    
    this.showGameScreen();
    this.listenToGameChanges();
};

BingoGame.prototype.declineChallenge = async function() {
    if (!this.pendingChallenge || !window.firebaseDb) return;
    
    const challengeRef = window.firebaseRef(window.firebaseDb, `challenges/${this.pendingChallenge.challengeId}`);
    await window.firebaseRemove(challengeRef);
    
    document.getElementById('challengeModal').classList.add('hidden');
    this.pendingChallenge = null;
};

// Update showSetupScreen to start online presence
const originalShowSetupScreen = BingoGame.prototype.showSetupScreen;
BingoGame.prototype.showSetupScreen = function() {
    originalShowSetupScreen.call(this);
    this.startOnlinePresence();
};

// Update logout to stop presence
const originalLogout = BingoGame.prototype.logout;
BingoGame.prototype.logout = async function() {
    if (this.userId && window.firebaseDb) {
        const presenceRef = window.firebaseRef(window.firebaseDb, `online/${this.userId}`);
        await window.firebaseRemove(presenceRef);
    }
    
    if (this.presenceInterval) {
        clearInterval(this.presenceInterval);
    }
    
    if (this.onlineListener) {
        this.onlineListener();
    }
    
    if (this.challengeListener) {
        this.challengeListener();
    }
    
    originalLogout.call(this);
};
