import { useState, useEffect } from "react";
import { taskApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./TasksPage.css";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskApi.getAll({ limit: 100 });
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await taskApi.getStats();
      setStats({
        total: data.totalTasks,
        completed: data.completedTasks,
        pending: data.pendingTasks,
        completionRate: data.completionRate,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setAddingTask(true);

    try {
      const data = await taskApi.create({ title: newTaskTitle.trim() });
      setTasks((prev) => [data.task, ...prev]);
      setNewTaskTitle("");
      toast.success("Task created!");
      fetchStats();
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Failed to create task");
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await taskApi.toggle(taskId);

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );

      toast.success("Task updated!");
      fetchStats();
    } catch (err) {
      console.error("Error toggling task:", err);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskApi.delete(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast.success("Task deleted");
      fetchStats();
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteAllCompleted = async () => {
    const completedCount = tasks.filter((t) => t.completed).length;

    if (completedCount === 0) {
      toast.error("No completed tasks to delete");
      return;
    }

    if (!window.confirm(`Delete all ${completedCount} completed tasks?`)) {
      return;
    }

    try {
      await taskApi.deleteAllCompleted();
      setTasks((prev) => prev.filter((task) => !task.completed));
      toast.success(`${completedCount} tasks deleted`);
      fetchStats();
    } catch (err) {
      console.error("Error deleting completed tasks:", err);
      toast.error("Failed to delete completed tasks");
    }
  };

  const handleCompleteAll = async () => {
    const pendingCount = tasks.filter((t) => !t.completed).length;

    if (pendingCount === 0) {
      toast.error("No pending tasks to complete");
      return;
    }

    if (
      !window.confirm(`Mark all ${pendingCount} pending tasks as completed?`)
    ) {
      return;
    }

    try {
      await taskApi.completeAll();
      setTasks((prev) => prev.map((task) => ({ ...task, completed: true })));
      toast.success(`${pendingCount} tasks completed`);
      fetchStats();
    } catch (err) {
      console.error("Error completing all tasks:", err);
      toast.error("Failed to complete all tasks");
    }
  };

  const getFilteredTasks = () => {
    if (filter === "pending") {
      return tasks.filter((task) => !task.completed);
    } else if (filter === "completed") {
      return tasks.filter((task) => task.completed);
    }
    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <Spinner fullScreen text="Loading tasks..." />;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your daily tasks and to-dos</p>
        </div>
      </div>

      <div className="tasks-stats">
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>
            {stats.completed}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>
            {stats.pending}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completion Rate</div>
          <div className="stat-value">{stats.completionRate}%</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="card-title">Add New Task</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleAddTask} className="add-task-form">
            <Input
              type="text"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={addingTask}
              fullWidth
            />
            <Button type="submit" variant="primary" loading={addingTask}>
              Add Task
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="tasks-controls">
        <div className="tasks-filters">
          <button
            className={`filter-button ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({tasks.length})
          </button>
          <button
            className={`filter-button ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            className={`filter-button ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        <div className="bulk-actions">
          <Button variant="ghost" size="small" onClick={handleCompleteAll}>
            Complete All
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={handleDeleteAllCompleted}
          >
            Delete Completed
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>
                {filter === "all"
                  ? "No tasks yet. Create your first task above!"
                  : filter === "pending"
                    ? "No pending tasks. Great job!"
                    : "No completed tasks yet."}
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                >
                  <div
                    className="task-checkbox"
                    onClick={() => handleToggleTask(task._id)}
                  >
                    {task.completed && <span className="checkmark">✓</span>}
                  </div>
                  <div className="task-content">
                    <span className="task-title">{task.title}</span>
                    <span className="task-date">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="task-delete"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
