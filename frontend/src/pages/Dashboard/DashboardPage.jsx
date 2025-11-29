import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logout } from "../../store/slices/auth.slice.js"
import { userApi, taskApi } from "../../services/api"
import Card, { CardHeader, CardBody } from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Spinner from "../../components/ui/Spinner"
import useToast from "../../hooks/useToast"
import "./DashboardPage.css"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    streak: 0,
    nextChallenge: "",
    tasksCompleted: 0,
    totalTasks: 0,
    workoutsThisWeek: 0,
  })
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [statsData, tasksData] = await Promise.all([
        userApi.getStats(),
        taskApi.getAll({ completed: false, limit: 5 }),
      ])

      setStats({
        totalWorkouts: statsData.totalWorkouts,
        streak: statsData.streak,
        tasksCompleted: statsData.tasksCompleted,
        totalTasks: statsData.totalTasks,
        nextChallenge: statsData.nextChallenge,
        workoutsThisWeek: statsData.workoutsThisWeek,
      })

      setTasks(tasksData.tasks || [])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await taskApi.toggle(taskId)
      
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
      setStats((prev) => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
      }))
      
      toast.success("Task completed!")
    } catch (err) {
      console.error("Error completing task:", err)
      toast.error("Failed to complete task")
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success("Logged out successfully")
    navigate("/login")
  }

  if (loading) {
    return <Spinner fullScreen text="Loading dashboard..." />
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Dashboard</h1>
          <p className="dashboard-page-subtitle">Welcome back! Here's your fitness overview.</p>
        </div>
        <Button variant="ghost" size="small" onClick={handleLogout}>
          Logout
        </Button>
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
                <div className="stat-value">
                  {stats.tasksCompleted}/{stats.totalTasks}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="elevated" hover>
          <CardBody>
            <div className="stat-card-content">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">This Week</div>
                <div className="stat-value">{stats.workoutsThisWeek}</div>
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
              <div className="empty-state">
                <p>No pending tasks</p>
                <Link to="/tasks">
                  <Button variant="secondary" size="small" style={{ marginTop: "12px" }}>
                    Create Task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <span className="task-name">{task.title}</span>
                    <Button variant="primary" size="small" onClick={() => handleCompleteTask(task._id)}>
                      Complete
                    </Button>
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
              <Link to="/challenges" className="quick-action-link">
                <Button variant="secondary" size="medium" fullWidth>
                  View Challenges
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
