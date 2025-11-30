import { useState, useEffect } from "react";
import { nutritionApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./NutritionPage.css";

export default function NutritionPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [guides, setGuides] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    meals: [{ name: "", calories: "", time: "" }],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, statsData, guidesData] = await Promise.all([
        nutritionApi.getLogs({ limit: 30 }),
        nutritionApi.getStats(7),
        nutritionApi.getGuides(),
      ]);

      setLogs(logsData.foodLogs || []);
      setStats(statsData);
      setGuides(guidesData.guides || []);
    } catch (err) {
      console.error("Error fetching nutrition data:", err);
      toast.error("Failed to load nutrition data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    setFormData((prev) => ({
      ...prev,
      meals: [...prev.meals, { name: "", calories: "", time: "" }],
    }));
  };

  const handleRemoveMeal = (index) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  };

  const handleMealChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.map((meal, i) =>
        i === index ? { ...meal, [field]: value } : meal
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.meals.every((meal) => !meal.name)) {
      toast.error("Please add at least one meal");
      return;
    }

    setSubmitting(true);

    try {
      const mealsWithCalories = formData.meals
        .filter((meal) => meal.name)
        .map((meal) => ({
          ...meal,
          calories: parseInt(meal.calories) || 0,
        }));

      const data = await nutritionApi.createLog({
        date: formData.date,
        meals: mealsWithCalories,
        notes: formData.notes,
      });

      setLogs((prev) => [data.foodLog, ...prev]);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        meals: [{ name: "", calories: "", time: "" }],
        notes: "",
      });
      setShowForm(false);
      toast.success("Food log created!");
      fetchData();
    } catch (err) {
      console.error("Error creating food log:", err);
      toast.error("Failed to create food log");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this food log?")) {
      return;
    }

    try {
      await nutritionApi.deleteLog(logId);
      setLogs((prev) => prev.filter((log) => log._id !== logId));
      toast.success("Food log deleted");
      fetchData();
    } catch (err) {
      console.error("Error deleting food log:", err);
      toast.error("Failed to delete food log");
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading nutrition data..." />;
  }

  return (
    <div className="nutrition-page">
      <div className="nutrition-header">
        <div>
          <h1 className="page-title">Nutrition</h1>
          <p className="page-subtitle">Track your meals and nutrition</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            🍽️ Log Food
          </Button>
        )}
      </div>

      {stats && (
        <div className="nutrition-stats">
          <div className="stat-card">
            <div className="stat-label">Total Logs</div>
            <div className="stat-value">{stats.totalLogs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Week</div>
            <div className="stat-value">{stats.logsInPeriod}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Calories (7d)</div>
            <div className="stat-value">{stats.totalCalories}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Calories/Day</div>
            <div className="stat-value">{stats.averageCaloriesPerDay}</div>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="card-title">Log Food</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="nutrition-form">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                fullWidth
                required
              />

              <div className="meals-section">
                <div className="meals-header">
                  <label className="form-label">Meals</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={handleAddMeal}
                  >
                    + Add Meal
                  </Button>
                </div>

                {formData.meals.map((meal, index) => (
                  <div key={index} className="meal-item">
                    <Input
                      placeholder="Meal name"
                      value={meal.name}
                      onChange={(e) =>
                        handleMealChange(index, "name", e.target.value)
                      }
                      fullWidth
                    />
                    <Input
                      placeholder="Calories"
                      type="number"
                      value={meal.calories}
                      onChange={(e) =>
                        handleMealChange(index, "calories", e.target.value)
                      }
                      fullWidth
                    />
                    <Input
                      placeholder="Time (e.g., Breakfast)"
                      value={meal.time}
                      onChange={(e) =>
                        handleMealChange(index, "time", e.target.value)
                      }
                      fullWidth
                    />
                    {formData.meals.length > 1 && (
                      <button
                        type="button"
                        className="remove-meal-btn"
                        onClick={() => handleRemoveMeal(index)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="nutrition-textarea"
                  placeholder="Any notes about your meals..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  Save Log
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="guides-section">
        <h2 className="section-title">Meal Ideas</h2>
        <div className="guides-grid">
          {guides.map((guide, index) => (
            <Card key={index}>
              <CardBody>
                <h3 className="guide-title">{guide.name}</h3>
                <ul className="meal-list">
                  {guide.meals.map((meal, mIndex) => (
                    <li key={mIndex} className="meal-list-item">
                      <span className="meal-name">{meal.name}</span>
                      <span className="meal-calories">{meal.calories} cal</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div className="logs-section">
        <h2 className="section-title">Your Food Logs</h2>
        {logs.length === 0 ? (
          <Card>
            <CardBody>
              <div className="empty-state">
                <p>No food logs yet. Start tracking your nutrition!</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <Card key={log._id}>
                <CardBody>
                  <div className="log-header">
                    <div className="log-date">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <button
                      className="delete-log-btn"
                      onClick={() => handleDelete(log._id)}
                    >
                      🗑️
                    </button>
                  </div>

                  {log.meals && log.meals.length > 0 && (
                    <div className="log-meals">
                      {log.meals.map((meal, index) => (
                        <div key={index} className="log-meal-item">
                          <div className="meal-info">
                            <span className="meal-name">{meal.name}</span>
                            {meal.time && (
                              <span className="meal-time">({meal.time})</span>
                            )}
                          </div>
                          <span className="meal-calories">
                            {meal.calories} cal
                          </span>
                        </div>
                      ))}
                      <div className="log-total">
                        <span>Total Calories:</span>
                        <span className="total-value">
                          {log.meals.reduce(
                            (sum, meal) => sum + (meal.calories || 0),
                            0
                          )}{" "}
                          cal
                        </span>
                      </div>
                    </div>
                  )}

                  {log.notes && (
                    <div className="log-notes">
                      <strong>Notes:</strong> {log.notes}
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
