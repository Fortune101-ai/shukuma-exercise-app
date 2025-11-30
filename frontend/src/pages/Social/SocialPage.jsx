import { useState, useEffect } from "react";
import { socialApi } from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import useToast from "../../hooks/useToast";
import "./SocialPage.css";

export default function SocialPage() {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const toast = useToast();
  useEffect(() => {
    fetchSocialData();
  }, []);
  const fetchSocialData = async () => {
    setLoading(true);
    try {
      const [friendsData, requestsData, feedData] = await Promise.all([
        socialApi.getFriends(),
        socialApi.getFriendRequests(),
        socialApi.getActivityFeed(20),
      ]);
      setFriends(friendsData.friends || []);
      setFriendRequests(requestsData.friendRequests || []);
      setActivityFeed(feedData.activities || []);
    } catch (err) {
      console.error("Error fetching social data:", err);
      toast.error("Failed to load social data");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await socialApi.searchUsers(searchQuery);
      setSearchResults(data.users || []);
    } catch (err) {
      console.error("Error searching users:", err);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };
  const handleSendRequest = async (userId) => {
    try {
      await socialApi.sendFriendRequest(userId);
      toast.success("Friend request sent!");
      setSearchResults((prev) => prev.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("Error sending friend request:", err);
      toast.error(err.message || "Failed to send friend request");
    }
  };
  const handleAcceptRequest = async (userId) => {
    try {
      await socialApi.acceptFriendRequest(userId);
      toast.success("Friend request accepted!");
      fetchSocialData();
    } catch (err) {
      console.error("Error accepting friend request:", err);
      toast.error("Failed to accept friend request");
    }
  };
  const handleRejectRequest = async (userId) => {
    try {
      await socialApi.rejectFriendRequest(userId);
      toast.success("Friend request rejected");
      fetchSocialData();
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      toast.error("Failed to reject friend request");
    }
  };
  const handleRemoveFriend = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) {
      return;
    }
    try {
      await socialApi.removeFriend(userId);
      toast.success("Friend removed");
      fetchSocialData();
    } catch (err) {
      console.error("Error removing friend:", err);
      toast.error("Failed to remove friend");
    }
  };
  if (loading) {
    return <Spinner fullScreen text="Loading social data..." />;
  }
  return (
    <div className="social-page">
      <div className="social-header">
        <h1 className="page-title">Social</h1>
        <p className="page-subtitle">Connect with friends and stay motivated</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="card-title">🔍 Find Friends</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSearch} className="search-form">
            <Input
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
            <Button type="submit" variant="primary" loading={searching}>
              Search
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div key={user._id} className="user-item">
                  <div className="user-avatar">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-username">@{user.username}</div>
                  </div>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleSendRequest(user._id)}
                  >
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="social-grid">
        {friendRequests.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="card-title">
                Friend Requests ({friendRequests.length})
              </h2>
            </CardHeader>
            <CardBody>
              <div className="requests-list">
                {friendRequests.map((user) => (
                  <div key={user._id} className="request-item">
                    <div className="user-avatar">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                    <div className="request-actions">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleAcceptRequest(user._id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleRejectRequest(user._id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="card-title">👥 Friends ({friends.length})</h2>
          </CardHeader>
          <CardBody>
            {friends.length === 0 ? (
              <div className="empty-state">
                <p>No friends yet. Search and add friends above!</p>
              </div>
            ) : (
              <div className="friends-list">
                {friends.map((friend) => (
                  <div key={friend._id} className="friend-item">
                    <div className="user-avatar">
                      {friend.name[0].toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{friend.name}</div>
                      <div className="user-username">@{friend.username}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleRemoveFriend(friend._id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="card-title">📰 Activity Feed</h2>
          </CardHeader>
          <CardBody>
            {activityFeed.length === 0 ? (
              <div className="empty-state">
                <p>No recent activity. Add friends to see their workouts!</p>
              </div>
            ) : (
              <div className="activity-feed">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-avatar">
                      {activity.user.name[0].toUpperCase()}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.user.name}</strong> completed{" "}
                        <strong>{activity.workout.exercise?.name}</strong>
                      </div>
                      <div className="activity-meta">
                        {new Date(activity.workout.date).toLocaleDateString()} •{" "}
                        {activity.workout.duration} min
                      </div>
                    </div>
                    <div className="activity-icon">💪</div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
