import { useState, useEffect } from "react";
import { journalApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./JournalPage.css";

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [stats, setStats] = useState(null);
  const toast = useToast();

  const moods = [
    { value: "great", label: "Great", emoji: "😄", color: "#10b981" },
    { value: "good", label: "Good", emoji: "😊", color: "#84cc16" },
    { value: "okay", label: "Okay", emoji: "😐", color: "#eab308" },
    { value: "bad", label: "Bad", emoji: "😞", color: "#f59e0b" },
    { value: "terrible", label: "Terrible", emoji: "😢", color: "#ef4444" },
  ];

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await journalApi.getAll({ limit: 50 });
      setEntries(data.entries || []);
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      toast.error("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await journalApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast.error("Please write something in your journal");
      return;
    }

    setSubmitting(true);

    try {
      if (editingEntry) {
        const data = await journalApi.update(editingEntry._id, formData);
        setEntries((prev) =>
          prev.map((entry) =>
            entry._id === editingEntry._id ? data.entry : entry,
          ),
        );
        toast.success("Journal entry updated!");
      } else {
        const data = await journalApi.create(formData);
        setEntries((prev) => [data.entry, ...prev]);
        toast.success("Journal entry saved!");
      }

      setFormData({ title: "", content: "", mood: "" });
      setShowForm(false);
      setEditingEntry(null);
      fetchStats();
    } catch (err) {
      console.error("Error saving journal entry:", err);
      toast.error("Failed to save journal entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      title: entry.title || "",
      content: entry.content,
      mood: entry.mood || "",
    });
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = async (entryId) => {
    if (
      !window.confirm("Are you sure you want to delete this journal entry?")
    ) {
      return;
    }

    try {
      await journalApi.delete(entryId);
      setEntries((prev) => prev.filter((entry) => entry._id !== entryId));
      toast.success("Journal entry deleted");
      fetchStats();
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      toast.error("Failed to delete journal entry");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", mood: "" });
    setShowForm(false);
    setEditingEntry(null);
  };

  const getMoodData = (moodValue) => {
    return moods.find((m) => m.value === moodValue) || null;
  };

  if (loading) {
    return <Spinner fullScreen text="Loading journal..." />;
  }

  return (
    <div className="journal-page">
      <div className="journal-header">
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-subtitle">Document your fitness journey</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            ✏️ New Entry
          </Button>
        )}
      </div>

      {stats && (
        <div className="journal-stats">
          <div className="stat-card">
            <div className="stat-label">Total Entries</div>
            <div className="stat-value">{stats.totalEntries}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Week</div>
            <div className="stat-value">{stats.entriesThisWeek}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{stats.entriesThisMonth}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Most Common Mood</div>
            <div className="stat-value">{stats.mostCommonMood}</div>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="card-title">
              {editingEntry ? "Edit Entry" : "New Journal Entry"}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="journal-form">
              <Input
                label="Title (Optional)"
                type="text"
                placeholder="Give your entry a title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                fullWidth
              />

              <div className="form-group">
                <label className="form-label">How are you feeling?</label>
                <div className="mood-selector">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      className={`mood-button ${formData.mood === mood.value ? "active" : ""}`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, mood: mood.value }))
                      }
                      style={{
                        borderColor:
                          formData.mood === mood.value
                            ? mood.color
                            : "transparent",
                      }}
                    >
                      <span className="mood-emoji">{mood.emoji}</span>
                      <span className="mood-label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Thoughts</label>
                <textarea
                  className="journal-textarea"
                  placeholder="Write about your day, your feelings, your progress..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={8}
                  required
                />
              </div>

              <div className="form-actions">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="entries-list">
        {entries.length === 0 ? (
          <Card>
            <CardBody>
              <div className="empty-state">
                <p>
                  No journal entries yet. Start writing to document your
                  journey!
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          entries.map((entry) => {
            const moodData = getMoodData(entry.mood);
            return (
              <Card key={entry._id}>
                <CardBody>
                  <div className="entry-header">
                    <div className="entry-meta">
                      {moodData && (
                        <span
                          className="entry-mood"
                          style={{ color: moodData.color }}
                        >
                          {moodData.emoji} {moodData.label}
                        </span>
                      )}
                      <span className="entry-date">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="entry-actions">
                      <button
                        className="action-button"
                        onClick={() => handleEdit(entry)}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-button"
                        onClick={() => handleDelete(entry._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {entry.title && (
                    <h3 className="entry-title">{entry.title}</h3>
                  )}

                  <p className="entry-content">{entry.content}</p>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
