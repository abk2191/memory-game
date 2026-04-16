import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [divValues, setDivValues] = useState(Array(9).fill(null));
  const [showNumbers, setShowNumbers] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [gameActive, setGameActive] = useState(true);
  const [nextNumber, setNextNumber] = useState(1);
  const [divColors, setDivColors] = useState(Array(9).fill("#ffffff"));
  const [revealedNumbers, setRevealedNumbers] = useState(Array(9).fill(null));
  const [gameWon, setGameWon] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("bestScore");
    return saved ? parseInt(saved) : 0;
  });

  const arr = [1, 2, 3, 4];

  // Save best score to localStorage
  useEffect(() => {
    if (bestScore > 0) {
      localStorage.setItem("bestScore", bestScore);
    }
  }, [bestScore]);

  const assignRandomNumbers = () => {
    // Reset game state
    setGameActive(true);
    setGameWon(false);
    setNextNumber(1);
    setDivColors(Array(9).fill("#ffffff"));
    setRevealedNumbers(Array(9).fill(null));
    setScore(0);

    // Clear existing timer if any
    if (timerId) {
      clearTimeout(timerId);
    }

    // Create a copy of the array to shuffle
    const numbersToAssign = [...arr];

    // Shuffle the array randomly
    for (let i = numbersToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbersToAssign[i], numbersToAssign[j]] = [
        numbersToAssign[j],
        numbersToAssign[i],
      ];
    }

    // Create an array of available indices (0-8)
    const availableIndices = Array.from({ length: 9 }, (_, i) => i);

    // Shuffle available indices
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableIndices[i], availableIndices[j]] = [
        availableIndices[j],
        availableIndices[i],
      ];
    }

    // Create new values array (all null initially)
    const newValues = Array(9).fill(null);

    // Assign numbers to random indices
    for (let i = 0; i < numbersToAssign.length; i++) {
      newValues[availableIndices[i]] = numbersToAssign[i];
    }

    setDivValues(newValues);

    // Show the numbers for 3 seconds
    setShowNumbers(true);

    // Set timer to hide numbers after 3 seconds
    const newTimerId = setTimeout(() => {
      setShowNumbers(false);
    }, 3000);

    setTimerId(newTimerId);
  };

  const handleDivClick = (index, value) => {
    // Only process if game is active and numbers are hidden and game not won
    if (!gameActive || showNumbers || gameWon) return;

    // Check if this div has a number
    if (value === null) {
      // Clicked on empty div - wrong move
      setDivColors((prev) => {
        const newColors = [...prev];
        newColors[index] = "#ffebee";
        return newColors;
      });
      setGameActive(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Check if the number matches the next expected number
    if (value === nextNumber) {
      // Correct guess
      setDivColors((prev) => {
        const newColors = [...prev];
        newColors[index] = "#e8f5e9";
        return newColors;
      });

      setRevealedNumbers((prev) => {
        const newRevealed = [...prev];
        newRevealed[index] = value;
        return newRevealed;
      });

      // Update score
      setScore((prev) => prev + 1);

      // Check if game is complete (all numbers found)
      if (nextNumber === 4) {
        setGameWon(true);
        setGameActive(false);

        // Update best score
        const newScore = score + 1;
        if (newScore > bestScore) {
          setBestScore(newScore);
        }
      } else {
        setNextNumber((prev) => prev + 1);
      }
    } else {
      // Wrong guess
      setDivColors((prev) => {
        const newColors = [...prev];
        newColors[index] = "#ffebee";
        return newColors;
      });
      setGameActive(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const getDisplayValue = (index) => {
    // If number is revealed (correctly guessed), show it
    if (revealedNumbers[index] !== null) {
      return revealedNumbers[index];
    }
    // If showing initial preview, show the number
    if (showNumbers && divValues[index] !== null) {
      return divValues[index];
    }
    // Otherwise show empty
    return "";
  };

  return (
    <div className="app">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <h1 className="game-title">
            <span className="title-icon">🎯</span>
            Memory Match
          </h1>
          <div className="stats">
            <div className="stat-card">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}/4</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Best</span>
              <span className="stat-value">{bestScore}</span>
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className={`game-status ${shake ? "shake" : ""}`}>
          {gameWon ? (
            <div className="status-message success">
              <span>🎉</span>
              <span>Perfect Memory! You Won!</span>
              <span>🏆</span>
            </div>
          ) : !gameActive && !showNumbers && !gameWon ? (
            <div className="status-message error">
              <span>💀</span>
              <span>Game Over! Wrong Move!</span>
              <span>💀</span>
            </div>
          ) : showNumbers ? (
            <div className="status-message info">
              <span>🧠</span>
              <span>Memorize the positions...</span>
              <div className="timer-bar"></div>
            </div>
          ) : gameActive && nextNumber <= 4 ? (
            <div className="status-message playing">
              <span>🔍</span>
              <span>Find number</span>
              <span className="next-number">{nextNumber}</span>
            </div>
          ) : null}
        </div>

        {/* Game Grid */}
        <div className="game-grid">
          {divValues.map((value, index) => (
            <div
              key={index}
              onClick={() => handleDivClick(index, value)}
              className={`game-card ${!gameActive || showNumbers || gameWon ? "disabled" : ""} ${
                divColors[index] === "#e8f5e9" ? "correct" : ""
              } ${divColors[index] === "#ffebee" ? "wrong" : ""}`}
              style={{
                backgroundColor: divColors[index],
              }}
            >
              <div className="card-content">
                {getDisplayValue(index) && (
                  <span
                    className={`card-number ${showNumbers ? "preview" : "revealed"}`}
                  >
                    {getDisplayValue(index)}
                  </span>
                )}
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button
            className={`new-game-btn ${showNumbers || !gameActive || gameWon ? "pulse" : ""}`}
            onClick={assignRandomNumbers}
          >
            <span className="btn-icon">🔄</span>
            {showNumbers ? "Resetting..." : "New Game"}
          </button>

          {!gameActive && !gameWon && !showNumbers && (
            <p className="hint-text">Click "New Game" to try again!</p>
          )}

          {!showNumbers && gameActive && !gameWon && nextNumber <= 4 && (
            <p className="hint-text">
              Click on the div containing {nextNumber}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="instructions">
          <div className="instruction-item">
            <span className="instruction-icon">👁️</span>
            <span>Remember number positions (3 seconds)</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">1️⃣</span>
            <span>Click numbers in order: 1 → 2 → 3 → 4</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">✅</span>
            <span>Correct = Green & Permanent</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">❌</span>
            <span>Wrong = Game Over</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
