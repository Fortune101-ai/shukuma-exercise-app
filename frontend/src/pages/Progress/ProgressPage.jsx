import { useState, useEffect } from "react";
import { userApi, workoutApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./ProgressPage.css";

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const [progressData, statsData, calendarData] = await Promise.all([
        userApi.getProgress(),
        workoutApi.getStats(),
        workoutApi.getCalendar(),
      ]);

      setProgress(progressData);
      setWorkoutStats(statsData);
      setCalendar(calendarData.calendarData || []);
    } catch (err) {
      console.error("Error fetching progress data:", err);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading progress..." />;
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1 className="page-title">Progress</h1>
        <p className="page-subtitle">Track your fitness journey</p>
      </div>

      <div className="progress-stats">
        <Card variant="elevated">
          <CardBody>
            <div className="stat-large">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <div className="stat-label">Total Workouts</div>
                <div className="stat-value-large">
                  {progress?.totalWorkouts || 0}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-large">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-label">Current Streak</div>
                <div className="stat-value-large">
                  {progress?.streak || 0} days
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-large">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-label">Total Hours</div>
                <div className="stat-value-large">
                  {workoutStats?.totalHours || 0}h
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody>
            <div className="stat-large">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">This Week</div>
                <div className="stat-value-large">
                  {workoutStats?.thisWeek || 0}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {progress?.achievements && progress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="card-title">🏆 Achievements</h2>
          </CardHeader>
          <CardBody>
            <div className="achievements-grid">
              {progress.achievements.map((achievement, index) => (
                <div key={index} className="achievement-badge">
                  {achievement}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="card-title">📅 Workout Calendar</h2>
        </CardHeader>
        <CardBody>
          {calendar.length === 0 ? (
            <div className="empty-state">
              <p>
                No workout history yet. Start working out to see your calendar!
              </p>
            </div>
          ) : (
            <div className="calendar-grid">
              {calendar.map((day) => (
                <div
                  key={day.date}
                  className={`calendar-day ${day.count > 0 ? "has-workout" : ""}`}
                  title={`${day.date}: ${day.count} workout(s)`}
                  style={{
                    opacity:
                      day.count > 0 ? Math.min(0.3 + day.count * 0.2, 1) : 0.1,
                  }}
                >
                  <div className="calendar-date">
                    {new Date(day.date).getDate()}
                  </div>
                  {day.count > 0 && (
                    <div className="calendar-count">{day.count}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {progress?.recentWorkouts && progress.recentWorkouts.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="card-title">Recent Workouts</h2>
          </CardHeader>
          <CardBody>
            <div className="recent-workouts">
              {progress.recentWorkouts.map((workout) => (
                <div key={workout._id} className="workout-item">
                  <div className="workout-info">
                    <div className="workout-name">
                      {workout.exerciseId?.name || "Unknown Exercise"}
                    </div>
                    <div className="workout-date">
                      {new Date(workout.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="workout-duration">{workout.duration} min</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {progress?.workoutFrequency && progress.workoutFrequency.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="card-title">📊 Last 30 Days Activity</h2>
          </CardHeader>
          <CardBody>
            <div className="frequency-chart">
              {progress.workoutFrequency.map((day) => (
                <div key={day.date} className="frequency-bar-container">
                  <div
                    className="frequency-bar"
                    style={{
                      height: `${Math.min((day.workouts / 3) * 100, 100)}%`,
                    }}
                    title={`${day.date}: ${day.workouts} workout(s)`}
                  />
                  <div className="frequency-label">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
