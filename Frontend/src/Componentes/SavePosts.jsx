import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Saveposts.css";

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const fetchSaved = async () => {
    if (!isLoggedIn) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/saved", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Failed to load saved posts");
        setPosts([]);
        return;
      }

      setPosts(Array.isArray(data.savedBlogs) ? data.savedBlogs : []);
    } catch (e) {
      setError("Failed to load saved posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [isLoggedIn]);

  const handleUnsave = async (blogId) => {
    if (!isLoggedIn) return;

    setBusyId(blogId);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/blog/save/${blogId}` , {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Failed to update saved posts");
        return;
      }

      setPosts((prev) => prev.filter((p) => p?._id !== blogId));
    } catch {
      setError("Failed to update saved posts");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="saved-posts-page">
      <h2>Saved Posts</h2>

      {!isLoggedIn ? (
        <p>
          Please <Link to="/login">login</Link> to view your saved posts.
        </p>
      ) : loading ? (
        <p>Loading saved posts...</p>
      ) : error ? (
        <p>{error}</p>
      ) : posts.length === 0 ? (
        <p>You have no saved posts yet.</p>
      ) : (
        <div className="saved-posts">
          {posts.map((blog) => (
            <div key={blog._id} className="saved-post-card">
              <h3>{blog.title}</h3>
              <p>{(blog.description || "").substring(0, 140)}...</p>

              <div className="saved-post-actions">
                <Link to={`/blog/${blog._id}`}>Read</Link>
                <button
                  type="button"
                  className="unsave-btn"
                  onClick={() => handleUnsave(blog._id)}
                  disabled={busyId === blog._id}
                >
                  {busyId === blog._id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/" className="back-link">
        ← Back to Home
      </Link>
    </div>
  );
};

export default SavedPosts;
