import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userApi, taskApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    streak: 0,
    tasksCompleted: 0,
    nextChallenge: "",
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API calls when backend is ready
      // const [statsData, tasksData] = await Promise.all([
      //   userApi.getStats(),
      //   taskApi.getAll()
      // ])

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStats({
        totalWorkouts: 42,
        streak: 7,
        tasksCompleted: 28,
        nextChallenge: "30 Day Challenge",
      });

      setTasks([
        { _id: "1", name: "Complete morning workout", completed: false },
        { _id: "2", name: "Log today's meals", completed: false },
        { _id: "3", name: "Drink 8 glasses of water", completed: false },
      ]);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      // TODO: Call API when backend is ready
      // await taskApi.complete(taskId)

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, completed: true } : task,
        ),
      );
      toast.success("Task completed!");
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Dashboard</h1>
        <p className="dashboard-page-subtitle">
          Welcome back! Here's your fitness overview.
        </p>
      </div>

      <div className="stats-grid">
        <Card variant="elevated" hover>
          <CardBody>
            <div className="stat-card-content">
              <div className="stat-icon">💪</div>
              <div className="stat-info">
                <div className="stat-label">Total Workouts</div>
                <div className="stat-value">{stats.totalWorkouts}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" hover>
          <CardBody>
            <div className="stat-card-content">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <div className="stat-label">Current Streak</div>
                <div className="stat-value">{stats.streak} days</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" hover>
          <CardBody>
            <div className="stat-card-content">
              <div className="stat-icon">✓</div>
              <div className="stat-info">
                <div className="stat-label">Tasks Completed</div>
                <div className="stat-value">{stats.tasksCompleted}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" hover>
          <CardBody>
            <div className="stat-card-content">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <div className="stat-label">Next Challenge</div>
                <div className="stat-value-small">
                  {stats.nextChallenge || "None"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card>
          <CardHeader>
            <h2 className="card-title">Today's Tasks</h2>
          </CardHeader>
          <CardBody>
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks for today</p>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <span
                      className={`task-name ${task.completed ? "task-completed" : ""}`}
                    >
                      {task.name}
                    </span>
                    {!task.completed && (
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleCompleteTask(task._id)}
                      >
                        Complete
                      </Button>
                    )}
                    {task.completed && <span className="task-check">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="card-title">Quick Actions</h2>
          </CardHeader>
          <CardBody>
            <div className="quick-actions">
              <Link to="/workouts" className="quick-action-link">
                <Button variant="secondary" size="medium" fullWidth>
                  Start Workout
                </Button>
              </Link>
              <Link to="/journal" className="quick-action-link">
                <Button variant="secondary" size="medium" fullWidth>
                  Write Journal Entry
                </Button>
              </Link>
              <Link to="/nutrition" className="quick-action-link">
                <Button variant="secondary" size="medium" fullWidth>
                  Log Meal
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
