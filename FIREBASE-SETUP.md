# 🔥 Firebase Setup Anleitung

## Schritt 1: Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf **"Projekt hinzufügen"** / **"Add project"**
3. Projekt-Name: z.B. `rocket-league-bingo`
4. Google Analytics: Optional (kannst du deaktivieren)
5. Klicke **"Projekt erstellen"**

## Schritt 2: Web-App registrieren

1. In deinem Firebase Projekt, klicke auf das **Web-Icon** (`</>`)
2. App-Spitzname: z.B. `Bingo Web App`
3. Firebase Hosting: **NICHT** aktivieren (wir nutzen GitHub Pages)
4. Klicke **"App registrieren"**

## Schritt 3: Firebase Config kopieren

Du siehst jetzt einen Code-Block wie diesen:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrst",
  authDomain: "rocket-bingo-12345.firebaseapp.com",
  databaseURL: "https://rocket-bingo-12345-default-rtdb.firebaseio.com",
  projectId: "rocket-bingo-12345",
  storageBucket: "rocket-bingo-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**WICHTIG:** Kopiere diese Werte!

## Schritt 4: Realtime Database aktivieren

1. Gehe in der linken Sidebar zu **"Build"** → **"Realtime Database"**
2. Klicke **"Datenbank erstellen"** / **"Create Database"**
3. Standort wählen: z.B. `europe-west1` (Europa)
4. Sicherheitsregeln: Wähle **"Im Testmodus starten"** / **"Start in test mode"**
5. Klicke **"Aktivieren"**

### ⚠️ Sicherheitsregeln anpassen (WICHTIG!)

Nach der Erstellung, gehe zu **"Regeln"** / **"Rules"** und ersetze mit:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt"]
      }
    }
  }
}
```

Klicke **"Veröffentlichen"** / **"Publish"**

## Schritt 5: Config in deine App einfügen

1. Öffne die Datei `firebase-config.js`
2. Ersetze die Platzhalter mit deinen echten Werten aus Schritt 3:

```javascript
export const firebaseConfig = {
    apiKey: "DEIN_ECHTER_API_KEY",
    authDomain: "dein-projekt.firebaseapp.com",
    databaseURL: "https://dein-projekt-default-rtdb.firebaseio.com",
    projectId: "dein-projekt",
    storageBucket: "dein-projekt.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

3. Speichere die Datei

## Schritt 6: Testen

1. Öffne `index.html` in deinem Browser
2. Öffne die Browser-Konsole (F12)
3. Du solltest sehen: `✅ Firebase verbunden!`
4. Erstelle ein Spiel und teste es!

## Schritt 7: Auf GitHub Pages deployen

1. Pushe alle Dateien zu GitHub (inkl. `firebase-config.js`)
2. Aktiviere GitHub Pages in den Repository Settings
3. Fertig! Die App ist online und funktioniert weltweit

## 🔒 Sicherheitshinweise

### Für Produktion (später):

Die aktuellen Regeln erlauben jedem Lese- und Schreibzugriff. Für eine produktive App solltest du:

1. **Alte Spiele automatisch löschen:**
```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.child('createdAt').val() > (now - 86400000)"
      }
    }
  }
}
```

2. **Firebase Authentication hinzufügen** (optional)

## 🆓 Kostenlos?

Ja! Firebase Realtime Database ist kostenlos für:
- **1 GB Speicher**
- **10 GB/Monat Download**
- **100 gleichzeitige Verbindungen**

Das reicht locker für hunderte Spiele pro Tag!

## ❓ Probleme?

### "Firebase wird geladen..."
- Prüfe ob `firebase-config.js` korrekt ausgefüllt ist
- Öffne Browser-Konsole (F12) für Fehlermeldungen

### "Permission denied"
- Prüfe die Realtime Database Regeln (Schritt 4)
- Stelle sicher dass die Database URL korrekt ist

### Spiel nicht gefunden
- Prüfe ob beide Spieler die gleiche Firebase Database nutzen
- Prüfe die Spiel-ID (Groß-/Kleinschreibung beachten)

## 🎮 Fertig!

Jetzt können Spieler von überall auf der Welt gegeneinander spielen! 🚀
