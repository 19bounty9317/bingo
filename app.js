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
        this.onlineListener = null;
        this.challengeListener = null;
        this.userStats = null;
        this.onlinePlayers = {};
        this.pendingChallenge = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.waitForFirebase(); // Wartet auf Firebase, dann checkLogin
        this.initDarkMode();
        this.setupAutoSave();
    }

    waitForFirebase() {
        const checkFirebase = setInterval(() => {
            if (window.firebaseDb) {
                clearInterval(checkFirebase);
                console.log('✅ Firebase verbunden!');
                this.checkLogin(); // Auto-login nach Firebase-Verbindung
            }
        }, 100);
    }

    initializeElements() {
        // Screens
        this.loginScreen = document.getElementById('loginScreen');
        this.setupScreen = document.getElementById('setupScreen');
        this.joinScreen = document.getElementById('joinScreen');
        this.waitingScreen = document.getElementById('waitingScreen');
        this.gameModal = document.getElementById('gameModal');
        this.closeGameBtn = document.getElementById('closeGameBtn');
        
        // Tabs
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        this.resetTab = document.getElementById('resetTab');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.resetForm = document.getElementById('resetForm');
        
        // Buttons
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.resetPasswordBtn = document.getElementById('resetPasswordBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.deleteAccountBtn = document.getElementById('deleteAccountBtn');
        this.createGameBtn = document.getElementById('createGameBtn');
        this.gameNameInput = document.getElementById('gameNameInput');
        this.joinGameBtn = document.getElementById('joinGameBtn');
        this.joinGameConfirmBtn = document.getElementById('joinGameConfirmBtn');
        this.backToSetupBtn = document.getElementById('backToSetupBtn');
        this.copyGameIdBtn = document.getElementById('copyGameIdBtn');
        this.cancelGameBtn = document.getElementById('cancelGameBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        if (this.closeGameBtn) {
            this.closeGameBtn.addEventListener('click', () => this.closeGameModal());
        }
        
        if (this.renameGameInModalBtn) {
            this.renameGameInModalBtn.addEventListener('click', () => {
                if (!this.gameState || !this.gameId) return;
                const currentName = this.gameState.gameName || `Spiel ${this.gameId}`;
                this.renameGame(this.gameId, currentName);
            });
        }
        
        if (this.showStatsBtn) {
            this.showStatsBtn.addEventListener('click', () => this.showStats());
        }
        
        if (this.closeStatsBtn) {
            this.closeStatsBtn.addEventListener('click', () => this.closeStats());
        }
        
        // Login Inputs
        this.loginUsername = document.getElementById('loginUsername');
        this.loginPassword = document.getElementById('loginPassword');
        this.registerUsername = document.getElementById('registerUsername');
        this.registerPassword = document.getElementById('registerPassword');
        this.registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
        this.registerSecurityAnswer = document.getElementById('registerSecurityAnswer');
        this.resetUsername = document.getElementById('resetUsername');
        this.resetCode = document.getElementById('resetCode');
        this.resetNewPassword = document.getElementById('resetNewPassword');
        this.resetNewPasswordConfirm = document.getElementById('resetNewPasswordConfirm');
        
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
        this.crownCount = document.getElementById('crownCount');
        this.trophyCount = document.getElementById('trophyCount');
        this.playerNameDisplay = document.getElementById('playerNameDisplay');
        this.gameIdDisplay = document.getElementById('gameIdDisplay');
        this.waitingGameName = document.getElementById('waitingGameName');
        this.gameNameHeader = document.getElementById('gameNameHeader');
        this.renameGameInModalBtn = document.getElementById('renameGameInModalBtn');
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
        
        // Stats Modal
        this.statsModal = document.getElementById('statsModal');
        this.showStatsBtn = document.getElementById('showStatsBtn');
        this.closeStatsBtn = document.getElementById('closeStatsBtn');
    }

    attachEventListeners() {
        // Tabs
        this.loginTab.addEventListener('click', () => this.showLoginForm());
        this.registerTab.addEventListener('click', () => this.showRegisterForm());
        this.resetTab.addEventListener('click', () => this.showResetForm());
        
        // Auth
        this.loginBtn.addEventListener('click', () => this.login());
        this.registerBtn.addEventListener('click', () => this.register());
        this.resetPasswordBtn.addEventListener('click', () => this.resetPassword());
        this.logoutBtn.addEventListener('click', () => this.logout());
        if (this.deleteAccountBtn) {
            this.deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        }
        
        // Game
        if (this.createGameBtn) this.createGameBtn.addEventListener('click', () => this.createGame());
        if (this.joinGameBtn) this.joinGameBtn.addEventListener('click', () => this.showJoinScreen());
        if (this.joinGameConfirmBtn) this.joinGameConfirmBtn.addEventListener('click', () => this.joinGame());
        if (this.backToSetupBtn) this.backToSetupBtn.addEventListener('click', () => this.showSetupScreen());
        if (this.copyGameIdBtn) this.copyGameIdBtn.addEventListener('click', () => this.copyGameId());
        if (this.cancelGameBtn) this.cancelGameBtn.addEventListener('click', () => this.cancelGame());
        if (this.newGameBtn) this.newGameBtn.addEventListener('click', () => this.resetGame());
        if (this.closeModalBtn) this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // Enter key support
        if (this.loginPassword) {
            this.loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
        }
        if (this.registerPasswordConfirm) {
            this.registerPasswordConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.register();
            });
        }
        if (this.resetNewPasswordConfirm) {
            this.resetNewPasswordConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.resetPassword();
            });
        }
        if (this.gameIdInput) {
            this.gameIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.joinGame();
            });
        }
    }

    showLoginForm() {
        this.loginTab.classList.add('active');
        this.registerTab.classList.remove('active');
        this.resetTab.classList.remove('active');
        this.loginForm.classList.remove('hidden');
        this.registerForm.classList.add('hidden');
        this.resetForm.classList.add('hidden');
    }

    showRegisterForm() {
        this.registerTab.classList.add('active');
        this.loginTab.classList.remove('active');
        this.resetTab.classList.remove('active');
        this.registerForm.classList.remove('hidden');
        this.loginForm.classList.add('hidden');
        this.resetForm.classList.add('hidden');
    }
    
    showResetForm() {
        this.resetTab.classList.add('active');
        this.loginTab.classList.remove('active');
        this.registerTab.classList.remove('active');
        this.resetForm.classList.remove('hidden');
        this.loginForm.classList.add('hidden');
        this.registerForm.classList.add('hidden');
    }

    async checkLogin() {
        const savedUserId = localStorage.getItem('bingo_user_id');
        if (savedUserId && window.firebaseDb) {
            console.log('Auto-login attempt for user:', savedUserId);
            try {
                const user = await this.loadUser(savedUserId);
                if (user) {
                    console.log('Auto-login successful:', user.username);
                    this.userId = savedUserId;
                    this.username = user.username;
                    this.userStats = this.normalizeStats(user.stats);
                    this.playerId = this.generateId();
                    this.showSetupScreen();
                } else {
                    console.log('User not found, clearing saved ID');
                    localStorage.removeItem('bingo_user_id');
                }
            } catch (error) {
                console.error('Auto-login failed:', error);
                localStorage.removeItem('bingo_user_id');
            }
        }
    }

    async register() {
        console.log('Register clicked');
        const username = this.registerUsername.value.trim();
        const password = this.registerPassword.value;
        const passwordConfirm = this.registerPasswordConfirm.value;
        const securityAnswer = this.registerSecurityAnswer.value.trim().toLowerCase();
        
        console.log('Username:', username);
        console.log('Firebase DB:', window.firebaseDb ? 'Ready' : 'Not ready');
        
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
        
        if (!securityAnswer || securityAnswer.length < 2) {
            alert('Bitte Sicherheitsfrage beantworten (für Passwort-Reset)!');
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
            const hashedSecurityAnswer = await this.hashPassword(securityAnswer);
            
            const userData = {
                userId: this.userId,
                username: username,
                password: hashedPassword,
                securityAnswer: hashedSecurityAnswer,
                stats: {
                    wins: 0,
                    losses: 0,
                    totalGames: 0,
                    trophies: 0
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
        console.log('Login clicked');
        const username = this.loginUsername.value.trim();
        const password = this.loginPassword.value;
        
        console.log('Username:', username);
        console.log('Firebase DB:', window.firebaseDb ? 'Ready' : 'Not ready');
        
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
            this.userStats = this.normalizeStats(foundUser.stats);
            this.playerId = this.generateId();
            
            localStorage.setItem('bingo_user_id', this.userId);
            
            this.showSetupScreen();
            
        } catch (error) {
            console.error('Login error:', error);
            alert('Fehler beim Anmelden!');
        }
    }
    
    async resetPassword() {
        const username = this.resetUsername.value.trim();
        const resetCode = this.resetCode.value.trim().toUpperCase();
        const newPassword = this.resetNewPassword.value;
        const newPasswordConfirm = this.resetNewPasswordConfirm.value;
        
        if (!username || username.length < 3) {
            alert('Bitte gültigen Benutzernamen eingeben!');
            return;
        }
        
        if (!resetCode || resetCode.length !== 6) {
            alert('Bitte gültigen 6-stelligen Reset-Code eingeben!');
            return;
        }
        
        if (!newPassword || newPassword.length < 6) {
            alert('Neues Passwort muss mindestens 6 Zeichen lang sein!');
            return;
        }
        
        if (newPassword !== newPasswordConfirm) {
            alert('Passwörter stimmen nicht überein!');
            return;
        }

        if (!window.firebaseDb) {
            alert('Firebase wird geladen, bitte warte...');
            return;
        }

        try {
            // Check reset code
            const resetCodeRef = window.firebaseRef(window.firebaseDb, `resetCodes/${resetCode}`);
            const codeSnapshot = await window.firebaseGet(resetCodeRef);
            
            if (!codeSnapshot.exists()) {
                alert('Ungültiger Reset-Code!');
                return;
            }
            
            const codeData = codeSnapshot.val();
            
            // Check if code is expired
            if (Date.now() > codeData.expiresAt) {
                alert('Reset-Code ist abgelaufen!');
                await window.firebaseRemove(resetCodeRef);
                return;
            }
            
            // Check if code is already used
            if (codeData.used) {
                alert('Reset-Code wurde bereits verwendet!');
                return;
            }
            
            // Check if username matches
            if (codeData.username.toLowerCase() !== username.toLowerCase()) {
                alert('Reset-Code gehört nicht zu diesem Benutzernamen!');
                return;
            }
            
            // Update password
            const hashedPassword = await this.hashPassword(newPassword);
            const userPasswordRef = window.firebaseRef(window.firebaseDb, `users/${codeData.userId}/password`);
            await window.firebaseSet(userPasswordRef, hashedPassword);
            
            // Mark code as used
            const codeUsedRef = window.firebaseRef(window.firebaseDb, `resetCodes/${resetCode}/used`);
            await window.firebaseSet(codeUsedRef, true);

            alert('✅ Passwort erfolgreich zurückgesetzt! Du kannst dich jetzt anmelden.');
            this.showLoginForm();
            
            // Clear form
            this.resetUsername.value = '';
            this.resetCode.value = '';
            this.resetNewPassword.value = '';
            this.resetNewPasswordConfirm.value = '';
            
        } catch (error) {
            console.error('Reset password error:', error);
            alert('Fehler beim Zurücksetzen des Passworts!');
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

    normalizeStats(stats) {
        // Stellt sicher, dass ältere Accounts ohne "trophies"-Feld nicht crashen
        const safeStats = stats || { wins: 0, losses: 0, totalGames: 0 };
        if (typeof safeStats.trophies !== 'number') {
            safeStats.trophies = 0;
        }
        return safeStats;
    }

    async updateUserStats(won, trophyCount = 0) {
        if (!this.userId || !window.firebaseDb) return;
        
        try {
            this.userStats.totalGames++;
            if (won) {
                this.userStats.wins++;
                // Pokale: ein Pokal pro gleichzeitig abgeschlossenem Bingo-Muster (Reihe/Spalte/Diagonale)
                this.userStats.trophies = (this.userStats.trophies || 0) + Math.max(trophyCount, 1);
            } else {
                this.userStats.losses++;
            }

            const statsRef = window.firebaseRef(window.firebaseDb, `users/${this.userId}/stats`);
            await window.firebaseSet(statsRef, this.userStats);
            
            this.updateStatsDisplay();
            
            // Online-Presence sofort aktualisieren, damit andere Spieler die neuen Stats sehen
            if (this.userId && window.firebaseDb) {
                const presenceRef = window.firebaseRef(window.firebaseDb, `online/${this.userId}`);
                window.firebaseGet(presenceRef).then(snap => {
                    if (snap.exists()) {
                        window.firebaseSet(presenceRef, {
                            ...snap.val(),
                            wins: this.userStats.wins,
                            losses: this.userStats.losses,
                            totalGames: this.userStats.totalGames,
                            trophies: this.userStats.trophies || 0,
                            lastSeen: Date.now()
                        });
                    }
                }).catch(() => {});
            }
        } catch (error) {
            console.error('Update stats error:', error);
        }
    }

    updateStatsDisplay() {
        if (this.winsCount) this.winsCount.textContent = this.userStats.wins;
        if (this.lossesCount) this.lossesCount.textContent = this.userStats.losses;
        if (this.totalGamesCount) this.totalGamesCount.textContent = this.userStats.totalGames;
        if (this.winsCountJoin) this.winsCountJoin.textContent = this.userStats.trophies || 0;
        if (this.yourWinsDisplay) this.yourWinsDisplay.textContent = this.userStats.trophies || 0;
        if (this.crownCount) this.crownCount.textContent = this.userStats.trophies || 0;
        if (this.trophyCount) this.trophyCount.textContent = this.userStats.trophies || 0;
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
        
        const customName = this.gameNameInput ? this.gameNameInput.value.trim() : '';
        const gameName = customName || `Spiel ${this.gameId}`;
        
        this.gameState = {
            gameId: this.gameId,
            gameName: gameName,
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
        if (this.gameNameInput) this.gameNameInput.value = '';
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
        const range = max - min + 1;
        
        // Check if we have enough numbers when duplicates are not allowed
        if (!allowDuplicates && range < 50) {
            alert(`Warnung: Zahlenbereich zu klein! Benötigt mindestens 50 verschiedene Zahlen für 2 Spieler ohne Duplikate. Doppelte werden automatisch erlaubt.`);
            allowDuplicates = true;
        }
        
        const globalUsed = new Set(); // Shared between both boards
        
        const generateBoard = () => {
            const board = [];
            
            // Alle 25 Felder mit Zahlen füllen (kein FREE mehr!)
            for (let i = 0; i < 25; i++) {
                let num;
                let attempts = 0;
                do {
                    num = Math.floor(Math.random() * range) + min;
                    attempts++;
                    // Prevent infinite loop if range is too small
                    if (attempts > 1000) {
                        console.error('Could not generate unique numbers, allowing duplicates');
                        break;
                    }
                } while (!allowDuplicates && globalUsed.has(num));
                
                if (!allowDuplicates) {
                    globalUsed.add(num);
                }
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
        if (!board || !container) return;
        
        container.innerHTML = '';
        
        board.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.textContent = number;
            
            if (markedIndices && markedIndices.includes(index)) {
                cell.classList.add(isYourBoard ? 'marked' : 'opponent-marked');
            }
            
            if (isYourBoard && this.gameState && this.gameState.status === 'playing') {
                cell.addEventListener('click', () => this.markCell(index));
            }
            
            container.appendChild(cell);
        });
    }

    async markCell(index) {
        if (this.gameState.status !== 'playing') return;
        
        console.log('Mark cell:', index);
        
        const markedArray = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        
        if (markedArray.includes(index)) {
            const idx = markedArray.indexOf(index);
            markedArray.splice(idx, 1);
            console.log('Unmarked cell:', index);
        } else {
            markedArray.push(index);
            console.log('Marked cell:', index);
        }
        
        console.log('Marked array:', markedArray);
        
        await this.saveGameState();
        console.log('Game state saved');
        
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
        
        const hostMarked = new Set(this.gameState.hostMarked);
        const hostBingos = [];
        for (const pattern of patterns) {
            if (pattern.indices.every(i => hostMarked.has(i))) {
                hostBingos.push(pattern.name);
            }
        }
        
        const guestMarked = new Set(this.gameState.guestMarked);
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
            
            // Update stats - Pokale = Anzahl der gleichzeitig erreichten Bingo-Muster
            if (this.isHost) {
                this.updateUserStats(true, hostBingos.length);
            } else {
                this.updateUserStats(false, 0);
            }
            
            this.showWinner();
        } else if (guestBingos.length > 0 && this.gameState.status === 'playing') {
            this.gameState.winner = 'guest';
            this.gameState.status = 'finished';
            this.saveGameState();
            
            // Update stats - Pokale = Anzahl der gleichzeitig erreichten Bingo-Muster
            if (!this.isHost) {
                this.updateUserStats(true, guestBingos.length);
            } else {
                this.updateUserStats(false, 0);
            }
            
            this.showWinner();
        } else {
            this.saveGameState();
        }
        
        this.updateBingoDisplay();
    }

    updateBingoDisplay() {
        if (!this.gameState) return;
        
        const yourBingos = this.isHost ? (this.gameState.hostBingos || []) : (this.gameState.guestBingos || []);
        const opponentBingos = this.isHost ? (this.gameState.guestBingos || []) : (this.gameState.hostBingos || []);
        
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
                    Neue Statistik: ${this.userStats.trophies || 0} Pokale
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
        
        // Initialize arrays if they don't exist (for old games)
        if (!this.gameState.hostBingos) this.gameState.hostBingos = [];
        if (!this.gameState.guestBingos) this.gameState.guestBingos = [];
        if (!this.gameState.hostMarked) this.gameState.hostMarked = [];
        if (!this.gameState.guestMarked) this.gameState.guestMarked = [];
        
        const yourBoard = this.isHost ? this.gameState.hostBoard : this.gameState.guestBoard;
        const opponentBoard = this.isHost ? this.gameState.guestBoard : this.gameState.hostBoard;
        const yourMarked = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        const opponentMarked = this.isHost ? this.gameState.guestMarked : this.gameState.hostMarked;
        
        if (!yourBoard || !opponentBoard) return;
        
        this.renderBoard(yourBoard, yourMarked, this.yourBoard, true);
        this.renderBoard(opponentBoard, opponentMarked, this.opponentBoard, false);
        
        this.yourScore.textContent = yourMarked.length;
        this.opponentScore.textContent = opponentMarked.length;
        
        // Set player names
        const yourName = this.username;
        const opponentName = this.isHost ? this.gameState.guestName : this.gameState.hostName;
        
        this.yourName.textContent = yourName;
        this.opponentName.textContent = opponentName || 'Warte...';
        
        // Set board titles with player names
        const yourBoardTitle = document.getElementById('yourBoardTitle');
        const opponentBoardTitle = document.getElementById('opponentBoardTitle');
        if (yourBoardTitle) yourBoardTitle.textContent = yourName;
        if (opponentBoardTitle) opponentBoardTitle.textContent = opponentName || 'Gegner';
        
        // Live-Pokale anzeigen statt der beim Spielstart eingefrorenen Werte
        if (this.yourWinsDisplay) this.yourWinsDisplay.textContent = this.userStats ? (this.userStats.trophies || 0) : 0;
        
        const opponentUserId = this.isHost ? this.gameState.guestUserId : this.gameState.hostUserId;
        if (this.opponentWinsDisplay) {
            if (opponentUserId && window.firebaseDb) {
                try {
                    const opponentUser = await this.loadUser(opponentUserId);
                    // gameState kann waehrend des await gelöscht/zurückgesetzt worden sein
                    // (z.B. wenn das Spiel inzwischen entfernt wurde) - dann hier abbrechen
                    if (!this.gameState) return;
                    const opponentStats = this.normalizeStats(opponentUser ? opponentUser.stats : null);
                    this.opponentWinsDisplay.textContent = opponentStats.trophies || 0;
                } catch (error) {
                    console.error('Load opponent stats error:', error);
                    this.opponentWinsDisplay.textContent = 0;
                }
            } else {
                this.opponentWinsDisplay.textContent = 0;
            }
        }
        
        if (!this.gameState) return;
        
        if (this.gameNameHeader) {
            this.gameNameHeader.textContent = this.gameState.gameName || `Spiel ${this.gameState.gameId}`;
        }
    }

    async saveGameState() {
        if (!window.firebaseDb || !this.gameId) return;
        
        // Sicherstellen, dass das gespeicherte gameId-Feld immer mit dem
        // tatsaechlichen Firebase-Pfad uebereinstimmt (verhindert inkonsistente
        // Datensaetze, die sich nicht mehr richtig loeschen lassen)
        if (this.gameState) {
            this.gameState.gameId = this.gameId;
        }
        
        try {
            const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
            
            if (window.firebaseRunTransaction) {
                // Transaction statt set(): bricht automatisch ab, wenn der Pfad
                // zwischenzeitlich (z.B. durch "Spiel loeschen") auf null gesetzt wurde.
                // Verhindert, dass ein geloeschtes Spiel durch einen noch offenen
                // Tab/Client versehentlich wiederbelebt wird.
                const result = await window.firebaseRunTransaction(gameRef, (currentData) => {
                    if (currentData === null) {
                        // Spiel wurde geloescht - nicht wiederherstellen, Transaction abbrechen
                        return undefined;
                    }
                    return this.gameState;
                });
                
                if (!result.committed) {
                    console.log('saveGameState: Spiel wurde geloescht, Speichern abgebrochen.');
                    this.resetGame();
                }
            } else {
                // Fallback falls runTransaction nicht verfuegbar ist
                await window.firebaseSet(gameRef, this.gameState);
            }
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
        
        console.log('Starting to listen to game:', this.gameId);
        
        const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
        
        this.gameListener = window.firebaseOnValue(gameRef, (snapshot) => {
            console.log('Game update received');
            
            if (!snapshot.exists()) {
                alert('Spiel wurde beendet!');
                this.resetGame();
                return;
            }
            
            const updatedState = snapshot.val();
            console.log('Updated state:', updatedState);
            
            this.gameState = updatedState;
            
            if (this.isHost && updatedState.status === 'playing' && this.gameModal.classList.contains('hidden')) {
                this.showGameScreen();
            }
            
            if (!this.gameModal.classList.contains('hidden')) {
                console.log('Updating display...');
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
        this.gameModal.classList.add('hidden');
    }

    showSetupScreen() {
        this.currentUsername.textContent = this.username;
        this.currentUsernameJoin.textContent = this.username;
        this.updateStatsDisplay();
        
        this.loginScreen.classList.add('hidden');
        this.setupScreen.classList.remove('hidden');
        this.joinScreen.classList.add('hidden');
        this.waitingScreen.classList.add('hidden');
        this.gameModal.classList.add('hidden');
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
        if (this.waitingGameName) {
            this.waitingGameName.textContent = (this.gameState && this.gameState.gameName) || `Spiel ${this.gameId}`;
        }
    }

    showGameScreen() {
        this.waitingScreen.classList.add('hidden');
        this.joinScreen.classList.add('hidden');
        this.gameModal.classList.remove('hidden');
        this.updateGameDisplay();
        this.updateBingoDisplay();
    }
    
    closeGameModal() {
        this.gameModal.classList.add('hidden');
        this.stopListening();
        this.gameId = null;
        this.gameState = null;
    }
    
    showStats() {
        if (!this.gameState) return;
        
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
        
        const yourMarked = this.isHost ? this.gameState.hostMarked : this.gameState.guestMarked;
        const opponentMarked = this.isHost ? this.gameState.guestMarked : this.gameState.hostMarked;
        
        // Calculate your stats
        let yourThreeInRow = 0;
        let yourFourInRow = 0;
        let yourBingos = 0;
        
        patterns.forEach(pattern => {
            const markedCount = pattern.indices.filter(i => yourMarked.includes(i)).length;
            if (markedCount === 3) yourThreeInRow++;
            if (markedCount === 4) yourFourInRow++;
            if (markedCount === 5) yourBingos++;
        });
        
        // Calculate opponent stats
        let opponentThreeInRow = 0;
        let opponentFourInRow = 0;
        let opponentBingos = 0;
        
        patterns.forEach(pattern => {
            const markedCount = pattern.indices.filter(i => opponentMarked.includes(i)).length;
            if (markedCount === 3) opponentThreeInRow++;
            if (markedCount === 4) opponentFourInRow++;
            if (markedCount === 5) opponentBingos++;
        });
        
        // Update display
        document.getElementById('statsMarkedCells').textContent = yourMarked.length;
        document.getElementById('statsThreeInRow').textContent = yourThreeInRow;
        document.getElementById('statsFourInRow').textContent = yourFourInRow;
        document.getElementById('statsBingos').textContent = yourBingos;
        
        document.getElementById('statsOpponentMarkedCells').textContent = opponentMarked.length;
        document.getElementById('statsOpponentThreeInRow').textContent = opponentThreeInRow;
        document.getElementById('statsOpponentFourInRow').textContent = opponentFourInRow;
        document.getElementById('statsOpponentBingos').textContent = opponentBingos;
        
        this.statsModal.classList.remove('hidden');
    }
    
    closeStats() {
        this.statsModal.classList.add('hidden');
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
    
    // Alten Interval zuerst stoppen, damit sich nicht mehrere parallel häufen
    if (this.presenceInterval) {
        clearInterval(this.presenceInterval);
        this.presenceInterval = null;
    }
    
    const presenceRef = window.firebaseRef(window.firebaseDb, `online/${this.userId}`);
    const buildPresenceData = () => ({
        userId: this.userId,
        username: this.username,
        wins: this.userStats.wins,
        losses: this.userStats.losses,
        totalGames: this.userStats.totalGames,
        trophies: this.userStats.trophies || 0,
        lastSeen: Date.now()
    });
    
    await window.firebaseSet(presenceRef, buildPresenceData());
    
    // Update every 30 seconds (liest jeweils die aktuellen Live-Stats)
    this.presenceInterval = setInterval(async () => {
        await window.firebaseSet(presenceRef, buildPresenceData());
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
    
    // Alten Listener zuerst abmelden, um doppelte Registrierungen zu vermeiden
    if (this.onlineListener) {
        this.onlineListener();
        this.onlineListener = null;
    }
    
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
        
        const trophies = player.trophies || 0;
        const losses = player.losses || 0;
        const totalGames = player.totalGames || 0;
        
        playerDiv.innerHTML = `
            <div class="player-info-item">
                <div class="online-indicator"></div>
                <div>
                    <div class="player-name-item">${player.username}</div>
                    <div class="player-stats-item">
                        🏆 ${trophies} Pokale · ❌ ${losses} Niederlagen · 🎮 ${totalGames} Spiele
                    </div>
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
        gameName: `${this.username} vs ${targetUsername}`,
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
    
    // Alten Listener zuerst abmelden, um doppelte Registrierungen zu vermeiden
    if (this.challengeListener) {
        this.challengeListener();
        this.challengeListener = null;
    }
    
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
        gameName: challenge.gameName || `${challenge.fromUsername} vs ${this.username}`,
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

// Update showSetupScreen to start online presence and listen to games
const originalShowSetupScreen = BingoGame.prototype.showSetupScreen;
BingoGame.prototype.showSetupScreen = function() {
    originalShowSetupScreen.call(this);
    this.startOnlinePresence();
    this.listenToMyGames();
    this.listenToLeaderboard();
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


// ===== DARK MODE =====
BingoGame.prototype.initDarkMode = function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return; // Safety check
    
    const savedMode = localStorage.getItem('bingo_dark_mode');
    
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('bingo_dark_mode', isDark);
    });
};

// ===== DELETE ACCOUNT =====
BingoGame.prototype.deleteAccount = async function() {
    if (!confirm('Wirklich Account löschen? Alle Statistiken gehen verloren!')) {
        return;
    }
    
    if (!confirm('Bist du sicher? Dies kann nicht rückgängig gemacht werden!')) {
        return;
    }
    
    if (!window.firebaseDb || !this.userId) return;
    
    try {
        // Remove user data
        const userRef = window.firebaseRef(window.firebaseDb, `users/${this.userId}`);
        await window.firebaseRemove(userRef);
        
        // Remove online presence
        const presenceRef = window.firebaseRef(window.firebaseDb, `online/${this.userId}`);
        await window.firebaseRemove(presenceRef);
        
        alert('Account erfolgreich gelöscht!');
        this.logout();
    } catch (error) {
        console.error('Delete account error:', error);
        alert('Fehler beim Löschen des Accounts!');
    }
};

// ===== AUTO-SAVE ON CLOSE =====
BingoGame.prototype.setupAutoSave = function() {
    window.addEventListener('beforeunload', async (e) => {
        if (this.gameState && this.gameState.status === 'playing') {
            // Save current game state
            await this.saveGameState();
        }
        
        // Remove online presence
        if (this.userId && window.firebaseDb) {
            const presenceRef = window.firebaseRef(window.firebaseDb, `online/${this.userId}`);
            await window.firebaseRemove(presenceRef);
        }
    });
    
    // Auto-save every 10 seconds during game
    setInterval(async () => {
        if (this.gameState && this.gameState.status === 'playing' && this.gameId && window.firebaseDb) {
            // Vorher pruefen, ob das Spiel in Firebase noch existiert.
            // Verhindert, dass ein zwischenzeitlich geloeschtes Spiel durch
            // den Autosave eines noch geoeffneten Clients "wiederbelebt" wird.
            try {
                const gameRef = window.firebaseRef(window.firebaseDb, `games/${this.gameId}`);
                const snapshot = await window.firebaseGet(gameRef);
                if (!snapshot.exists()) {
                    console.log('Autosave: Spiel wurde geloescht, Autosave wird gestoppt.');
                    this.resetGame();
                    return;
                }
                this.saveGameState();
            } catch (error) {
                console.error('Autosave check error:', error);
            }
        }
    }, 10000);
};


// ===== MY GAMES LIST =====
BingoGame.prototype.myGamesListener = null;

BingoGame.prototype.listenToMyGames = function() {
    if (!window.firebaseDb || !this.userId) return;
    
    // Alten Listener zuerst abmelden, damit sich Listener nicht anhäufen
    // (sonst können veraltete Snapshots gelöschte Spiele wieder "auferstehen" lassen)
    if (this.myGamesListener) {
        this.myGamesListener();
        this.myGamesListener = null;
    }
    
    const gamesRef = window.firebaseRef(window.firebaseDb, 'games');
    this.myGamesListener = window.firebaseOnValue(gamesRef, (snapshot) => {
        if (!snapshot.exists()) {
            this.renderMyGames([]);
            return;
        }
        
        const allGames = snapshot.val();
        const myGames = [];
        
        // Filter games where user is host or guest
        for (let gameId in allGames) {
            const game = allGames[gameId];
            
            // Den tatsaechlichen Firebase-Schluessel als verbindliche ID erzwingen.
            // Falls das interne gameId-Feld (z.B. durch einen frueheren Bug) vom
            // echten Speicherort abweicht, wuerden Loeschen/Speichern sonst am
            // falschen Pfad greifen und das Spiel "unloeschbar" wirken lassen.
            if (game.gameId !== gameId) {
                console.warn(`Inkonsistente gameId erkannt: Schluessel=${gameId}, Feld=${game.gameId}. Wird korrigiert.`);
                game.gameId = gameId;
            }
            
            if (game.hostUserId === this.userId || game.guestUserId === this.userId) {
                myGames.push(game);
            }
        }
        
        // Sortierung: erst nach Status (laufend > wartend > beendet), dann neueste zuerst
        const statusOrder = { playing: 0, waiting: 1, finished: 2 };
        myGames.sort((a, b) => {
            const orderA = statusOrder[a.status] ?? 3;
            const orderB = statusOrder[b.status] ?? 3;
            if (orderA !== orderB) return orderA - orderB;
            return b.createdAt - a.createdAt;
        });
        
        this.renderMyGames(myGames);
    }, (error) => {
        console.error('listenToMyGames error:', error);
        const container = document.getElementById('myGamesList');
        if (container) {
            container.innerHTML = `<p class="loading-text">⚠️ Spiele konnten nicht geladen werden: ${error.message || error}. Firebase-Regeln für "games" prüfen (.read fehlt auf der games-Ebene).</p>`;
        }
    });
};

BingoGame.prototype.renderMyGames = function(games) {
    const container = document.getElementById('myGamesList');
    if (!container) return;
    
    if (games.length === 0) {
        container.innerHTML = '<p class="loading-text">Keine aktiven Spiele</p>';
        this.updateTotalStats([]);
        return;
    }
    
    container.innerHTML = '';
    
    games.forEach(game => {
      try {
        const isHost = game.hostUserId === this.userId;
        const opponent = isHost ? game.guestName : game.hostName;
        const opponentText = opponent || 'Warte auf Gegner...';
        
        let statusText = '';
        let statusClass = '';
        let gameClass = '';
        let crownIcon = '';
        
        if (game.status === 'waiting') {
            statusText = 'Wartet';
            statusClass = 'waiting';
            gameClass = 'waiting';
        } else if (game.status === 'playing') {
            statusText = 'Läuft';
            statusClass = 'playing';
            gameClass = 'playing';
        } else if (game.status === 'finished') {
            const won = (isHost && game.winner === 'host') || (!isHost && game.winner === 'guest');
            if (won) {
                statusText = 'Gewonnen';
                statusClass = 'won';
                gameClass = 'won';
                crownIcon = '👑 ';
            } else {
                statusText = 'Verloren';
                statusClass = 'lost';
                gameClass = 'lost';
            }
        }
        
        const displayName = game.gameName || `Spiel ${game.gameId}`;
        const settings = game.settings || {};
        const minVal = settings.min !== undefined ? settings.min : '?';
        const maxVal = settings.max !== undefined ? settings.max : '?';
        
        const gameDiv = document.createElement('div');
        gameDiv.className = `game-item ${gameClass}`;
        
        gameDiv.innerHTML = `
            <div class="game-info-item-full">
                <div class="game-title">${crownIcon}🎮 ${this.escapeHtml(displayName)}</div>
                <div class="game-details">
                    vs ${this.escapeHtml(opponentText)} | Zahlen: ${minVal}-${maxVal} | 
                    ID: ${game.gameId}
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <div class="game-status-badge ${statusClass}">${statusText}</div>
                <button class="rename-game-btn" data-game-id="${game.gameId}" title="Spiel umbenennen">✏️</button>
                <button class="delete-game-btn" data-game-id="${game.gameId}" title="Spiel löschen">🗑️</button>
            </div>
        `;
        
        // Click on game to open
        gameDiv.querySelector('.game-info-item-full').addEventListener('click', () => this.openGame(game));
        
        // Click on rename button
        const renameBtn = gameDiv.querySelector('.rename-game-btn');
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening game
            this.renameGame(game.gameId, displayName);
        });
        
        // Click on delete button
        const deleteBtn = gameDiv.querySelector('.delete-game-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening game
            this.deleteGame(game.gameId);
        });
        
        container.appendChild(gameDiv);
      } catch (error) {
        console.error('Error rendering game item:', game && game.gameId, error);
      }
    });
    
    // Update total statistics
    this.updateTotalStats(games);
};

// ===== LEADERBOARD (ALLE SPIELER, UNABHÄNGIG VOM ONLINE-STATUS) =====
BingoGame.prototype.listenToLeaderboard = function() {
    if (!window.firebaseDb) return;
    
    // Alten Listener zuerst abmelden, um doppelte Registrierungen zu vermeiden
    if (this.leaderboardListener) {
        this.leaderboardListener();
        this.leaderboardListener = null;
    }
    
    const usersRef = window.firebaseRef(window.firebaseDb, 'users');
    this.leaderboardListener = window.firebaseOnValue(usersRef, (snapshot) => {
        if (!snapshot.exists()) {
            this.renderLeaderboard([]);
            return;
        }
        
        const allUsers = snapshot.val();
        const players = [];
        
        for (let userId in allUsers) {
            const user = allUsers[userId];
            const stats = this.normalizeStats(user.stats);
            players.push({
                userId,
                username: user.username,
                trophies: stats.trophies || 0,
                wins: stats.wins || 0,
                losses: stats.losses || 0,
                totalGames: stats.totalGames || 0
            });
        }
        
        // Sortiert nach Pokalen absteigend, bei Gleichstand nach Siegen
        players.sort((a, b) => (b.trophies - a.trophies) || (b.wins - a.wins));
        
        this.renderLeaderboard(players);
    }, (error) => {
        console.error('Leaderboard listener error:', error);
        const container = document.getElementById('leaderboardList');
        if (container) {
            container.innerHTML = '<p class="loading-text">Rangliste konnte nicht geladen werden (Berechtigung fehlt?)</p>';
        }
    });
};

BingoGame.prototype.renderLeaderboard = function(players) {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    if (players.length === 0) {
        container.innerHTML = '<p class="loading-text">Noch keine Spieler registriert</p>';
        return;
    }
    
    container.innerHTML = '';
    
    const medals = ['🥇', '🥈', '🥉'];
    
    players.forEach((player, index) => {
        const rankIcon = medals[index] || `${index + 1}.`;
        const isSelf = player.userId === this.userId;
        
        const row = document.createElement('div');
        row.className = 'player-item leaderboard-item' + (isSelf ? ' self' : '');
        
        row.innerHTML = `
            <div class="player-info-item">
                <div class="leaderboard-rank">${rankIcon}</div>
                <div>
                    <div class="player-name-item">${this.escapeHtml(player.username)}${isSelf ? ' (Du)' : ''}</div>
                    <div class="player-stats-item">
                        🏆 ${player.trophies} Pokale · ❌ ${player.losses} Niederlagen · 🎮 ${player.totalGames} Spiele
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(row);
    });
};

BingoGame.prototype.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
};

// ===== RENAME GAME =====
BingoGame.prototype.renameGame = async function(gameId, currentName) {
    if (!window.firebaseDb) return;
    
    const newName = prompt('Neuer Name für dieses Bingo-Spiel:', currentName);
    
    if (newName === null) return; // Abgebrochen
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
        alert('Der Name darf nicht leer sein!');
        return;
    }
    
    try {
        const gameNameRef = window.firebaseRef(window.firebaseDb, `games/${gameId}/gameName`);
        await window.firebaseSet(gameNameRef, trimmedName);
    } catch (error) {
        console.error('Rename game error:', error);
        alert('Fehler beim Umbenennen des Spiels!');
    }
};

BingoGame.prototype.openGame = async function(game) {
    // Vorher pruefen, ob das Spiel noch existiert (kann inzwischen geloescht worden sein,
    // z.B. wenn ein Klick auf die Karte kurz vor/nach dem Loeschen durchgerutscht ist)
    if (window.firebaseDb && game.gameId) {
        try {
            const gameRef = window.firebaseRef(window.firebaseDb, `games/${game.gameId}`);
            const snapshot = await window.firebaseGet(gameRef);
            if (!snapshot.exists()) {
                console.log('openGame: Spiel existiert nicht mehr, wird ignoriert:', game.gameId);
                return;
            }
            // Frischen Stand aus Firebase nehmen statt des ggf. veralteten Listen-Objekts
            game = snapshot.val();
        } catch (error) {
            console.error('openGame existence check error:', error);
        }
    }
    
    this.gameId = game.gameId;
    this.gameState = game;
    this.isHost = game.hostUserId === this.userId;
    
    if (game.status === 'waiting') {
        this.showWaitingScreen();
    } else {
        this.showGameScreen();
    }
    
    this.listenToGameChanges();
};

// Update logout to stop presence and games listener
const originalLogout2 = BingoGame.prototype.logout;
BingoGame.prototype.logout = async function() {
    if (this.myGamesListener) {
        this.myGamesListener();
    }
    if (this.leaderboardListener) {
        this.leaderboardListener();
    }
    
    originalLogout2.call(this);
};


// ===== DELETE GAME =====
BingoGame.prototype.deleteGame = async function(gameId) {
    if (!confirm('Spiel wirklich löschen?')) {
        return;
    }
    
    if (!window.firebaseDb) return;
    
    try {
        const gameRef = window.firebaseRef(window.firebaseDb, `games/${gameId}`);
        await window.firebaseRemove(gameRef);
        
        // If this is the current game, close modal
        if (this.gameId === gameId) {
            this.closeGameModal();
        }
        
        console.log('Game deleted:', gameId);
    } catch (error) {
        console.error('Delete game error:', error);
        alert('Fehler beim Löschen des Spiels!');
    }
};

// ===== TOTAL STATISTICS =====
BingoGame.prototype.updateTotalStats = function(games) {
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
    
    let totalMarkedCells = 0;
    let totalThreeInRow = 0;
    let totalFourInRow = 0;
    let totalBingos = 0;
    
    games.forEach(game => {
        const isHost = game.hostUserId === this.userId;
        const myMarked = isHost ? (game.hostMarked || []) : (game.guestMarked || []);
        
        totalMarkedCells += myMarked.length;
        
        patterns.forEach(pattern => {
            const markedCount = pattern.indices.filter(i => myMarked.includes(i)).length;
            if (markedCount === 3) totalThreeInRow++;
            if (markedCount === 4) totalFourInRow++;
            if (markedCount === 5) totalBingos++;
        });
    });
    
    // Update display
    const totalMarkedCellsEl = document.getElementById('totalMarkedCells');
    const totalThreeInRowEl = document.getElementById('totalThreeInRow');
    const totalFourInRowEl = document.getElementById('totalFourInRow');
    const totalBingosEl = document.getElementById('totalBingos');
    
    if (totalMarkedCellsEl) totalMarkedCellsEl.textContent = totalMarkedCells;
    if (totalThreeInRowEl) totalThreeInRowEl.textContent = totalThreeInRow;
    if (totalFourInRowEl) totalFourInRowEl.textContent = totalFourInRow;
    if (totalBingosEl) totalBingosEl.textContent = totalBingos;
};

