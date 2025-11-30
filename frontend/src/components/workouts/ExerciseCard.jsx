import "./ExerciseCard.css";

export default function ExerciseCard({ exercise, isFlipped }) {
  if (!exercise) return null;

  const displayMuscles =
    exercise.muscleGroups?.slice(0, 3).join(", ") || "Full Body";

  return (
    <div className={`exercise-card-container ${isFlipped ? "flipped" : ""}`}>
      <div className="exercise-card-inner">
        <div className="exercise-card-face card-back">
          <div className="card-pattern"></div>
          <div className="card-logo">
            <div className="card-logo-icon">💪</div>
            <div className="card-logo-text">SHUKUMA</div>
          </div>
        </div>

        <div className="exercise-card-face card-front">
          <div className="card-image">
            {exercise.imageUrl ? (
              <img src={exercise.imageUrl} alt={exercise.name} />
            ) : (
              <div className="card-placeholder">
                <span className="card-placeholder-icon">💪</span>
              </div>
            )}
          </div>

          <div className="card-content">
            <div
              className={`card-difficulty-badge badge-${exercise.difficulty?.toLowerCase()}`}
            >
              {exercise.difficulty}
            </div>

            <h3 className="card-exercise-name">{exercise.name}</h3>

            <div className="card-muscles">
              <span className="muscle-icon">🎯</span>
              <span className="muscle-text">{displayMuscles}</span>
            </div>

            <div className="card-stats">
              {exercise.reps ? (
                <div className="card-stat">
                  <span className="stat-value">{exercise.reps}</span>
                  <span className="stat-label"> Reps</span>
                </div>
              ) : (
                <div className="card-stat">
                  <span className="stat-value">{exercise.duration}</span>
                  <span className="stat-label"> Minutes</span>
                </div>
              )}

              <div className="card-stat-divider"></div>

              <div className="card-stat">
                <span className="stat-value">{exercise.sets || 3}</span>
                <span className="stat-label"> Sets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
