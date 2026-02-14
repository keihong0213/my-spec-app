# Technical Implementation Plan: English Vocabulary Typing Tutor

## 1. Project Overview
A simple, kid-friendly typing tutor web app focused on English vocabulary. It displays words with definitions, speaks the word upon correct completion, and tracks basic progress.

## 2. Tech Stack
- **Frontend Framework**: React + Vite (Fast, modern, lightweight).
- **Styling**: Tailwind CSS (Utility-first, easy for responsive/kid-friendly designs).
- **State Management**: React Context + `useReducer` (Manage game state: current word, input, score, audio status).
- **Audio**: Web Speech API (`window.speechSynthesis`) for TTS. No external dependencies.
- **Routing**: None required for MVP (Single Page Application).
- **Deployment**: GitHub Pages (Static hosting).

## 3. Data Source
- **Vocabulary**: `src/data/vocabulary.json`.
- **Structure**:
  ```json
  [
    {
      "id": "word_001",
      "word": "apple",
      "definition": "A round fruit with red or green skin and crisp flesh.",
      "difficulty": "easy"
    },
    ...
  ]
  ```
- **Initial Set**: ~50 words (manually curated).

## 4. Component Architecture
### Core Components
1.  **`App.jsx`**: Main container, handles layout and global state provider.
2.  **`GameContainer`**: Manages the game loop (start, playing, end).
3.  **`WordDisplay`**: Renders the current word.
    -   Highlight matched letters (green).
    -   Highlight current target letter (underline/cursor).
    -   Highlight remaining letters (gray).
4.  **`DefinitionBox`**: Displays the definition of the current word.
5.  **`KeyboardInput`**: (Invisible) Captures global keydown events. Visual keyboard optional for MVP.
6.  **`Feedback`**: Visual/Audio feedback component (e.g., success animation).
7.  **`StatsSummary`**: Displays results at the end of a session.

### State Management (Context)
-   `GameStateContext`:
    -   `status`: 'idle' | 'playing' | 'completed'
    -   `currentWordIndex`: number
    -   `userInput`: string
    -   `score`: { correct: number, errors: number }
    -   `words`: Array<Word>

## 5. Implementation Steps
1.  **Setup**:
    -   Initialize Vite project: `npm create vite@latest my-typing-tutor -- --template react`
    -   Install Tailwind CSS.
2.  **Data**:
    -   Create `vocabulary.json` with 50 words.
3.  **Core Logic**:
    -   Implement `useTypingEngine` hook to handle keystrokes, validation, and progress.
    -   Implement `useTTS` hook for `speechSynthesis`.
4.  **UI Construction**:
    -   Build `WordDisplay` with character-level styling.
    -   Build `DefinitionBox`.
    -   Integrate `GameContainer`.
5.  **Refinement**:
    -   Add simple animations (CSS transitions) for correct/incorrect typing.
    -   Add "Start" and "Play Again" screens.
6.  **Deployment**:
    -   Configure `vite.config.js` for base URL.
    -   Deploy to GitHub Pages.

## 6. Key Decisions
-   **No Backend**: Keep it simple and offline-capable.
-   **Web Speech API**: Free, no API keys, works in modern browsers.
-   **Tailwind**: Rapid UI development, easy to customize themes for kids.
-   **React Context**: Sufficient for this scale; Redux is overkill.
