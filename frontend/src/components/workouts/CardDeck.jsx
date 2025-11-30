import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import Button from "../ui/Button";
import "./CardDeck.css";

export default function CardDeck({ exercises, onExerciseComplete }) {
  const [currentCard, setCurrentCard] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [usedExercises, setUsedExercises] = useState([]);

  const getAvailableExercises = () => {
    return exercises.filter((ex) => !usedExercises.includes(ex._id));
  };

  const shuffleAndDraw = () => {
    const available = getAvailableExercises();

    if (available.length === 0) {
      setUsedExercises([]);
      return shuffleAndDraw();
    }

    setIsShuffling(true);
    setIsFlipped(false);
    setCurrentCard(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * available.length);
      const selectedExercise = available[randomIndex];
      setCurrentCard(selectedExercise);
      setIsShuffling(false);

      setTimeout(() => {
        setIsFlipped(true);
      }, 300);
    }, 1200);
  };

  const handleComplete = () => {
    if (currentCard) {
      setUsedExercises((prev) => [...prev, currentCard._id]);
      if (onExerciseComplete) {
        onExerciseComplete(currentCard);
      }
    }
    setCurrentCard(null);
    setIsFlipped(false);
  };

  const handleSkip = () => {
    if (currentCard) {
      setUsedExercises((prev) => [...prev, currentCard._id]);
    }
    shuffleAndDraw();
  };

  const availableCount = exercises.length - usedExercises.length;

  return (
    <div className="card-deck-container">
      <div className="deck-header">
        <div className="deck-info">
          <h2 className="deck-title">Exercise Deck</h2>
          <p className="deck-subtitle">Draw a card to start your workout</p>
        </div>
        <div className="deck-counter">
          <span className="counter-value">{availableCount}</span>
          <span className="counter-label">Cards Left</span>
        </div>
      </div>

      <div className="card-area">
        {/* Deck Stack Visual */}
        {!currentCard && !isShuffling && (
          <div className="deck-stack">
            <div className="deck-card deck-card-3"></div>
            <div className="deck-card deck-card-2"></div>
            <div className="deck-card deck-card-1"></div>
          </div>
        )}

        {isShuffling && (
          <div className="deck-stack shuffling">
            <div className="deck-card deck-card-1"></div>
            <div className="deck-card deck-card-2"></div>
            <div className="deck-card deck-card-3"></div>
          </div>
        )}

        {currentCard && !isShuffling && (
          <div className="current-card-wrapper">
            <ExerciseCard exercise={currentCard} isFlipped={isFlipped} />
          </div>
        )}
      </div>

      <div className="deck-actions">
        {!currentCard ? (
          <Button
            variant="primary"
            size="large"
            onClick={shuffleAndDraw}
            disabled={isShuffling || exercises.length === 0}
            loading={isShuffling}
          >
            {isShuffling ? "Shuffling..." : "🎲 Draw Card"}
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="large" onClick={handleSkip}>
              Skip Exercise
            </Button>
            <Button variant="primary" size="large" onClick={handleComplete}>
              ✓ Complete Workout
            </Button>
          </>
        )}
      </div>

      {availableCount === 0 && (
        <div className="deck-reset-message">
          🎉 You've completed all exercises! The deck will reset on next draw.
        </div>
      )}
    </div>
  );
}
