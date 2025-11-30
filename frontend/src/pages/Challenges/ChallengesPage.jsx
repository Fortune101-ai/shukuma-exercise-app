import { useState, useEffect } from "react";
import { challengeApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./ChallengesPage.css";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); 
  const [stats, setStats] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allChallenges, myJoined, statsData] = await Promise.all([
        challengeApi.getAll({ limit: 50 }),
        challengeApi.getMyJoinedChallenges(),
        challengeApi.getStats(),
      ]);

      setChallenges(allChallenges.challenges || []);
      setMyChallenges(myJoined.challenges || []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching challenges:", err);
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await challengeApi.join(challengeId);
      toast.success("Successfully joined challenge!");
      fetchData();
    } catch (err) {
      console.error("Error joining challenge:", err);
      toast.error(err.message || "Failed to join challenge");
    }
  };

  const handleLeaveChallenge = async (challengeId) => {
    if (!window.confirm("Are you sure you want to leave this challenge?")) {
      return;
    }

    try {
      await challengeApi.leave(challengeId);
      toast.success("Left challenge");
      fetchData();
    } catch (err) {
      console.error("Error leaving challenge:", err);
      toast.error("Failed to leave challenge");
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: "#10b981",
      medium: "#f59e0b",
      hard: "#ef4444",
    };
    return colors[difficulty] || "#6b7280";
  };

  const getDifficultyEmoji = (difficulty) => {
    const emojis = {
      easy: "🟢",
      medium: "🟡",
      hard: "🔴",
    };
    return emojis[difficulty] || "⚪";
  };

  const getFilteredChallenges = () => {
    if (activeTab === "my") {
      return myChallenges;
    }

    const now = new Date();
    return challenges.filter((challenge) => {
      const start = new Date(challenge.startDate);
      const end = new Date(challenge.endDate);

      if (activeTab === "active") {
        return now >= start && now <= end;
      }
      if (activeTab === "upcoming") {
        return now < start;
      }
      return true;
    });
  };

  const filteredChallenges = getFilteredChallenges();

  const isParticipating = (challengeId) => {
    return myChallenges.some((c) => c._id === challengeId);
  };

  if (loading) {
    return <Spinner fullScreen text="Loading challenges..." />;
  }

  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <div>
          <h1 className="page-title">Challenges</h1>
          <p className="page-subtitle">
            Join challenges and compete with the community
          </p>
        </div>
      </div>

      {stats && (
        <div className="challenges-stats">
          <div className="stat-card">
            <div className="stat-label">Active Challenges</div>
            <div className="stat-value" style={{ color: "var(--primary)" }}>
              {stats.activeChallenges}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">You're Participating</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {stats.userParticipating}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: "var(--info)" }}>
              {stats.userCompleted}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upcoming</div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>
              {stats.upcomingChallenges}
            </div>
          </div>
        </div>
      )}

      <div className="challenges-tabs">
        <button
          className={`tab-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Challenges
        </button>
        <button
          className={`tab-button ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Now
        </button>
        <button
          className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`tab-button ${activeTab === "my" ? "active" : ""}`}
          onClick={() => setActiveTab("my")}
        >
          My Challenges ({myChallenges.length})
        </button>
      </div>

      <div className="challenges-grid">
        {filteredChallenges.length === 0 ? (
          <Card>
            <CardBody>
              <div className="empty-state">
                <p>
                  {activeTab === "my"
                    ? "You haven't joined any challenges yet"
                    : "No challenges available"}
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredChallenges.map((challenge) => {
            const participating = isParticipating(challenge._id);
            const daysRemaining = Math.ceil(
              (new Date(challenge.endDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={challenge._id} hover>
                <CardBody>
                  <div className="challenge-card">
                    <div className="challenge-header">
                      <div className="challenge-type-badge">
                        {challenge.type}
                      </div>
                      <div
                        className="challenge-difficulty"
                        style={{
                          backgroundColor: getDifficultyColor(
                            challenge.difficulty
                          ),
                        }}
                      >
                        {getDifficultyEmoji(challenge.difficulty)}{" "}
                        {challenge.difficulty}
                      </div>
                    </div>

                    <h3 className="challenge-title">{challenge.title}</h3>
                    <p className="challenge-description">
                      {challenge.description}
                    </p>

                    <div className="challenge-meta">
                      <div className="meta-item">
                        <span className="meta-icon">🎯</span>
                        <span className="meta-text">
                          Goal: {challenge.goal}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">👥</span>
                        <span className="meta-text">
                          {challenge.participantCount || 0} participants
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text">
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : "Ended"}
                        </span>
                      </div>
                    </div>

                    {challenge.reward && (
                      <div className="challenge-reward">
                        <span className="reward-icon">🏆</span>
                        <span className="reward-text">{challenge.reward}</span>
                      </div>
                    )}

                    {challenge.userProgress !== undefined && (
                      <div className="challenge-progress">
                        <div className="progress-header">
                          <span className="progress-label">Your Progress</span>
                          <span className="progress-value">
                            {challenge.userProgress} / {challenge.goal}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                (challenge.userProgress / challenge.goal) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="challenge-actions">
                      {participating ? (
                        <>
                          <Button
                            variant="ghost"
                            size="medium"
                            fullWidth
                            onClick={() => handleLeaveChallenge(challenge._id)}
                          >
                            Leave Challenge
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="medium"
                          fullWidth
                          onClick={() => handleJoinChallenge(challenge._id)}
                          disabled={daysRemaining < 0}
                        >
                          {daysRemaining < 0
                            ? "Challenge Ended"
                            : "Join Challenge"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}