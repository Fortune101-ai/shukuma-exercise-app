import "./ExerciseCard.css";

export default function ExerciseCard({ exercise, isFlipped }) {
  if (!exercise) return null;

  return (
    <div className={`exercise-card-container ${isFlipped ? "flipped" : ""}`}>
      <div className="exercise-card-inner">
        {/* Card Back */}
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
            <h3 className="card-exercise-name">{exercise.name}</h3>
            
            <div className="card-stats">
              {exercise.reps ? (
                <div className="card-stat">
                  <span className="stat-value">{exercise.reps}</span>
                  <span className="stat-label">Reps</span>
                </div>
              ) : (
                <div className="card-stat">
                  <span className="stat-value">{exercise.duration}</span>
                  <span className="stat-label">Minutes</span>
                </div>
              )}
              
              <div className="card-stat-divider"></div>
              
              <div className="card-stat">
                <span className="stat-value">{exercise.difficulty}</span>
                <span className="stat-label">Level</span>
              </div>
            </div>

            {exercise.description && (
              <p className="card-description">{exercise.description}</p>
            )}

            <div className={`card-difficulty-badge badge-${exercise.difficulty}`}>
              {exercise.difficulty}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}