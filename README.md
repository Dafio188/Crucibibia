# CruciBibbia

App Android di cruciverba tratti dalla Bibbia, originariamente pubblicati nelle riviste Svegliatevi! dal 1994 al 2005.

## Funzionalità

- **Raccolta completa**: Cruciverba biblici dal 1994 al 2005 (4-6 per anno)
- **Griglia 15x15**: Interfaccia intuitiva per la compilazione
- **Tastiera personalizzata**: Ottimizzata per l'inserimento su mobile
- **Salvataggio progressi**: Riprendi dove hai lasciato
- **Verifica risposte**: Controlla gli errori in tempo reale
- **Suggerimenti**: Rivela una lettera o l'intera soluzione
- **Timer**: Tieni traccia del tempo impiegato
- **Tema chiaro/scuro**: Supporto per entrambe le modalità

## Tecnologie

- **Kotlin** + **Jetpack Compose**
- **Material 3 Design**
- **Room Database** per la persistenza
- **Navigation Compose**
- **MVVM Architecture**

## Struttura del Progetto

```
app/
├── src/main/
│   ├── java/com/crucibibia/app/
│   │   ├── data/
│   │   │   ├── local/       # Database Room
│   │   │   ├── model/       # Modelli dati
│   │   │   └── repository/  # Repository
│   │   ├── ui/
│   │   │   ├── navigation/  # Navigazione
│   │   │   ├── screens/     # Schermate UI
│   │   │   ├── theme/       # Tema e colori
│   │   │   └── viewmodel/   # ViewModels
│   │   ├── CrucibibiaApp.kt
│   │   └── MainActivity.kt
│   ├── assets/puzzles/      # Dati cruciverba JSON
│   └── res/                 # Risorse Android
```

## Formato Dati Cruciverba

### index.json
```json
[
  {
    "id": "1994_01",
    "year": 1994,
    "number": 1,
    "title": "Cruciverba Biblico 1",
    "source": "Svegliatevi! Gennaio 1994",
    "gridSize": 15
  }
]
```

### {id}_grid.json
```json
{
  "size": 15,
  "grid": [
    ["G", "E", "N", "E", "S", "I", "#", ...],
    ...
  ]
}
```

### {id}_clues.json
```json
{
  "horizontal": [
    {"number": 1, "clue": "Primo libro della Bibbia", "answer": "GENESI"}
  ],
  "vertical": [
    {"number": 1, "clue": "Figlio di Giacobbe", "answer": "GIOBBE"}
  ]
}
```

## Compilazione

1. Apri il progetto in Android Studio
2. Sincronizza Gradle
3. Esegui su emulatore o dispositivo fisico

```bash
./gradlew assembleDebug
```

## Licenza

Contenuti dei cruciverba: © Watch Tower Bible and Tract Society of Pennsylvania (jw.org)

## Autore

Sviluppato per uso personale e educativo.
