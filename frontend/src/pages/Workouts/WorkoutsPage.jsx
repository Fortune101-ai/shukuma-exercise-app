import { useState, useEffect } from "react";
import { exerciseApi, workoutApi } from "../../services/api";
import Card, { CardBody } from "../../components/ui/Card";
import CardDeck from "../../components/workouts/CardDeck";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./WorkoutsPage.css";

export default function WorkoutsPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("deck");
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
  });
  const toast = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await exerciseApi.getAll({ limit: 50 });
      setExercises(data.exercises || []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = async (exercise) => {
    try {
      await workoutApi.log({
        exerciseId: exercise._id,
        duration: exercise.duration || 10,
        notes: `Completed via card deck`,
      });

      toast.success("Workout completed! 🎉");
    } catch (err) {
      console.error("Error logging workout:", err);
      toast.error("Failed to log workout");
    }
  };

  const handleStartWorkout = async (exercise) => {
    try {
      await workoutApi.log({
        exerciseId: exercise._id,
        duration: exercise.duration || 10,
        notes: `Started workout: ${exercise.name}`,
      });
      toast.success(`Started ${exercise.name}! 💪`);
    } catch (err) {
      console.error("Error starting workout:", err);
      toast.error("Failed to start workout");
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: "#10b981",
      intermediate: "#f59e0b",
      advanced: "#ef4444",
      easy: "#10b981",
      medium: "#f59e0b",
      hard: "#ef4444",
    };
    return colors[difficulty?.toLowerCase()] || "#6b7280";
  };

  const getFilteredExercises = () => {
    return exercises.filter((exercise) => {
      if (filters.category && exercise.category !== filters.category) {
        return false;
      }
      if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
        return false;
      }
      return true;
    });
  };

  const filteredExercises = getFilteredExercises();

  if (loading) {
    return <Spinner fullScreen text="Loading exercises..." />;
  }

  return (
    <div className="workouts-page">
      <div className="workouts-header">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">
            {viewMode === "deck"
              ? "Draw a card and complete your exercise"
              : "Browse all available exercises"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="medium"
          onClick={() => setViewMode(viewMode === "deck" ? "grid" : "deck")}
        >
          {viewMode === "deck" ? "📋 View All" : "🎴 Card Deck"}
        </Button>
      </div>

      {viewMode === "grid" && (
        <div className="workouts-filters">
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Balance">Balance</option>
            <option value="HIIT">HIIT</option>
          </select>

          <select
            className="filter-select"
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
            }
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {viewMode === "deck" ? (
        <CardDeck
          exercises={exercises}
          onExerciseComplete={handleExerciseComplete}
        />
      ) : (
        <div className="exercises-grid">
          {filteredExercises.length === 0 ? (
            <div className="empty-state">
              <p>No exercises found matching your filters</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <Card key={exercise._id} hover>
                <CardBody>
                  <div className="exercise-card">
                    <div className="exercise-header">
                      <h3 className="exercise-name">{exercise.name}</h3>
                      <span
                        className="exercise-difficulty"
                        style={{
                          backgroundColor: getDifficultyColor(
                            exercise.difficulty
                          ),
                        }}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>

                    <p className="exercise-description">
                      {exercise.description}
                    </p>

                    <div className="exercise-meta">
                      <span className="exercise-meta-item">
                        ⏱️ {exercise.duration || 10} min
                      </span>
                      <span className="exercise-meta-item">
                        🔥 {exercise.caloriesBurned || 0} cal
                      </span>
                      <span className="exercise-meta-item">
                        🏷️ {exercise.category}
                      </span>
                    </div>

                    {exercise.muscleGroups &&
                      exercise.muscleGroups.length > 0 && (
                        <div className="exercise-muscles">
                          {exercise.muscleGroups.map((muscle) => (
                            <span key={muscle} className="muscle-tag">
                              {muscle}
                            </span>
                          ))}
                        </div>
                      )}

                    <Button
                      variant="primary"
                      size="medium"
                      fullWidth
                      onClick={() => handleStartWorkout(exercise)}
                    >
                      Start Workout
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}