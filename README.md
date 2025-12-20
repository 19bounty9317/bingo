# 🚀 Rocket League Bingo - Online Multiplayer

Ein **echtes Online-Multiplayer** Bingo-Spiel für 2 Spieler mit Echtzeit-Synchronisation über Firebase!

## ✨ Features

- ✅ **Echtes Online-Multiplayer** - Spiele von verschiedenen Geräten/Orten
- ✅ **Echtzeit-Synchronisation** - Sieh sofort was dein Gegner macht
- ✅ Benutzername-System zur Spieler-Identifikation
- ✅ Individuelle Zahlenbereich-Eingabe (z.B. 10-150)
- ✅ Option für doppelte Zahlen
- ✅ Automatische Bingo-Erkennung (12 Muster: Reihen, Spalten, Diagonalen)
- ✅ Live-Anzeige welcher Spieler welche Bingos hat
- ✅ Responsive Design für Mobile & Desktop
- ✅ Kostenlos mit Firebase (bis 100 gleichzeitige Spieler)

## 🚀 Schnellstart

### 1. Firebase Setup (5 Minuten)

**Detaillierte Anleitung:** Siehe [FIREBASE-SETUP.md](FIREBASE-SETUP.md)

**Kurzversion:**
1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt
3. Aktiviere **Realtime Database** (im Testmodus)
4. Kopiere deine Firebase Config
5. Füge sie in `firebase-config.js` ein

### 2. Lokal testen

```bash
# Einfach index.html öffnen oder:
python -m http.server 8000
# Dann: http://localhost:8000
```

### 3. Auf GitHub Pages deployen

1. Erstelle ein GitHub Repository
2. Pushe alle Dateien (inkl. `firebase-config.js`)
3. Aktiviere GitHub Pages in Settings → Pages
4. Fertig! 🎉

## 📖 Spielanleitung

### Spiel erstellen:
1. Melde dich mit einem Benutzernamen an
2. Wähle Zahlenbereich (z.B. 1-75)
3. Optional: "Doppelte Zahlen erlauben"
4. Klicke "Spiel erstellen"
5. Teile die **Spiel-ID** mit deinem Gegner

### Spiel beitreten:
1. Melde dich mit einem Benutzernamen an
2. Klicke "Spiel beitreten"
3. Gib die Spiel-ID ein
4. Spiel startet automatisch!

### Spielen:
- Klicke auf Zahlen um sie zu markieren
- Dein Gegner sieht **sofort** deine Markierungen
- Erste Person mit 5 in einer Reihe gewinnt
- Das mittlere Feld ist "FREE" (automatisch markiert)

## 🎯 Bingo-Muster

Das Spiel erkennt automatisch 12 verschiedene Bingo-Muster:
- 5 horizontale Reihen
- 5 vertikale Spalten  
- 2 Diagonalen

Beispiel-Anzeige: `🎉 BINGO! (Reihe 3, Diagonale ↘)`

## 🏗️ Technische Details

### Stack:
- **Frontend:** Vanilla JavaScript (ES6+)
- **Backend:** Firebase Realtime Database
- **Hosting:** GitHub Pages
- **Keine Build-Tools nötig!**

### Dateien:
```
rocket-league-bingo/
├── index.html              # Hauptseite
├── style.css               # Styling
├── app.js                  # Spiellogik
├── firebase-config.js      # Firebase Konfiguration
├── README.md               # Diese Datei
└── FIREBASE-SETUP.md       # Firebase Setup Anleitung
```

### Firebase Struktur:
```json
{
  "games": {
    "ABC123": {
      "gameId": "ABC123",
      "hostName": "Player1",
      "guestName": "Player2",
      "hostBoard": [...],
      "guestBoard": [...],
      "hostMarked": [0, 5, 12],
      "guestMarked": [1, 6, 12],
      "hostBingos": ["Reihe 1"],
      "guestBingos": [],
      "status": "playing",
      "winner": null
    }
  }
}
```

## 🔒 Sicherheit

Die Standard-Konfiguration nutzt Firebase im **Testmodus** - perfekt für private Spiele mit Freunden.

Für öffentliche Deployment siehe [FIREBASE-SETUP.md](FIREBASE-SETUP.md) für erweiterte Sicherheitsregeln.

## 💰 Kosten

**Komplett kostenlos!** Firebase Free Tier bietet:
- 1 GB Speicher
- 10 GB/Monat Download
- 100 gleichzeitige Verbindungen

Das reicht für **hunderte Spiele täglich**!

## 🎮 Live Demo

Nach dem Setup ist deine App erreichbar unter:
`https://[dein-username].github.io/[repo-name]`

## 🐛 Troubleshooting

### "Firebase wird geladen..."
- Prüfe `firebase-config.js` - sind alle Werte korrekt?
- Öffne Browser-Konsole (F12) für Details

### "Spiel nicht gefunden"
- Beide Spieler müssen die gleiche App-Version nutzen
- Spiel-ID ist case-sensitive (Groß-/Kleinschreibung)

### Markierungen werden nicht synchronisiert
- Prüfe Firebase Realtime Database Regeln
- Stelle sicher dass beide Spieler online sind

## 🚀 Erweiterungsmöglichkeiten

- [ ] Spielhistorie & Statistiken
- [ ] Verschiedene Bingo-Varianten (4x4, 6x6)
- [ ] Sound-Effekte & Animationen
- [ ] Chat-Funktion
- [ ] Mehrere Spielräume/Lobbies
- [ ] Turniere & Ranglisten
- [ ] Mobile App (React Native/Flutter)

## 📝 Lizenz

MIT License - Nutze es wie du willst!

## 🤝 Beitragen

Pull Requests sind willkommen! Für größere Änderungen öffne bitte zuerst ein Issue.

---

**Viel Spaß beim Spielen! 🎉**

Bei Fragen oder Problemen, öffne ein GitHub Issue.

