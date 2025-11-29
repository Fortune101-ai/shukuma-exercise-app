import { useState, useEffect } from "react";
import { exerciseApi, workoutApi } from "../../services/api";
import Card, { CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./WorkoutsPage.css";

export default function WorkoutsPage() {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    category: "",
    search: "",
  });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [workoutModal, setWorkoutModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, exercises]);

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

  const applyFilters = () => {
    let filtered = [...exercises];

    if (filters.difficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === filters.difficulty);
    }

    if (filters.category) {
      filtered = filtered.filter((ex) => ex.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(searchLower) ||
          (ex.description && ex.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredExercises(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleGetRandom = async () => {
    try {
      const params = {};
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.category) params.category = filters.category;

      const data = await exerciseApi.getRandom(params);
      setSelectedExercise(data.exercise);
      setWorkoutModal(true);
    } catch (err) {
      console.error("Error getting random exercise:", err);
      toast.error("Failed to get random exercise");
    }
  };

  const handleStartWorkout = (exercise) => {
    setSelectedExercise(exercise);
    setWorkoutModal(true);
  };

  const handleLogWorkout = async () => {
    if (!selectedExercise) return;

    try {
      await workoutApi.log({
        exerciseId: selectedExercise._id,
        duration: selectedExercise.duration,
      });

      toast.success("Workout logged successfully! 🎉");
      setWorkoutModal(false);
      setSelectedExercise(null);
    } catch (err) {
      console.error("Error logging workout:", err);
      toast.error("Failed to log workout");
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "#10b981";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading exercises..." />;
  }

  return (
    <div className="workouts-page">
      <div className="workouts-header">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">
            Choose an exercise and start your workout
          </p>
        </div>
        <Button variant="primary" size="medium" onClick={handleGetRandom}>
          🎲 Random Exercise
        </Button>
      </div>

      <div className="workouts-filters">
        <Input
          type="text"
          placeholder="Search exercises..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />

        <select
          className="filter-select"
          value={filters.difficulty}
          onChange={(e) => handleFilterChange("difficulty", e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
        </select>

        {(filters.difficulty || filters.category || filters.search) && (
          <Button
            variant="ghost"
            size="small"
            onClick={() =>
              setFilters({ difficulty: "", category: "", search: "" })
            }
          >
            Clear Filters
          </Button>
        )}
      </div>

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

                  <p className="exercise-description">{exercise.description}</p>

                  <div className="exercise-meta">
                    <span className="exercise-meta-item">
                      ⏱️ {exercise.duration} min
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

      {workoutModal && selectedExercise && (
        <div className="modal-overlay" onClick={() => setWorkoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setWorkoutModal(false)}
            >
              ✕
            </button>
            <h2 className="modal-title">{selectedExercise.name}</h2>

            <div className="modal-body">
              <p className="exercise-description">
                {selectedExercise.description}
              </p>

              <div className="exercise-details">
                <div className="detail-item">
                  <strong>Duration:</strong> {selectedExercise.duration} minutes
                </div>
                {selectedExercise.sets && (
                  <div className="detail-item">
                    <strong>Sets:</strong> {selectedExercise.sets}
                  </div>
                )}
                {selectedExercise.reps && (
                  <div className="detail-item">
                    <strong>Reps:</strong> {selectedExercise.reps}
                  </div>
                )}
                <div className="detail-item">
                  <strong>Difficulty:</strong>{" "}
                  <span
                    style={{
                      color: getDifficultyColor(selectedExercise.difficulty),
                      fontWeight: "600",
                    }}
                  >
                    {selectedExercise.difficulty}
                  </span>
                </div>
              </div>

              {selectedExercise.instructions &&
                selectedExercise.instructions.length > 0 && (
                  <div className="exercise-instructions">
                    <h3>Instructions:</h3>
                    <ol>
                      {selectedExercise.instructions.map(
                        (instruction, index) => (
                          <li key={index}>{instruction}</li>
                        )
                      )}
                    </ol>
                  </div>
                )}

              <div className="modal-actions">
                <Button
                  variant="secondary"
                  size="large"
                  onClick={() => setWorkoutModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleLogWorkout}
                >
                  Complete Workout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
