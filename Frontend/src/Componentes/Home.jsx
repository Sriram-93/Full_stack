import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const [savedBlogs, setSavedBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState("");
  const [editingBlog, setEditingBlog] = useState(null);
  const [busyBlogId, setBusyBlogId] = useState(null);

  const navigate = useNavigate();

  const checkAuthStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("user");

    if (loggedIn === "true" && user) {
      const u = JSON.parse(user);
      setIsLoggedIn(true);
      setUserId(u._id || u.id);
    } else {
      setIsLoggedIn(false);
      setUserId(null);
    }
  };

  /* ================= FETCH BLOGS ================= */
  const fetchBlogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/blog/all");
      const data = await res.json();

      if (res.ok) {
        setBlogs(
          data.blogs.map((b) => ({
            ...b,
            likes: Array.isArray(b.likes)
              ? b.likes.map((id) => id.toString())
              : [],
            comments: Array.isArray(b.comments) ? b.comments : [],
          }))
        );
      }
    } catch (err) {
      console.error("Fetch blogs failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SAVED BLOGS ================= */
  const fetchSavedBlogs = async () => {
    if (!isLoggedIn) return;

    try {
      const res = await fetch("http://localhost:5000/api/users/saved", {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setSavedBlogs(data.savedBlogs.map((b) => b._id.toString()));
      }
    } catch (err) {
      console.error("Fetch saved blogs failed:", err);
    }
  };

  /* ================= FETCH MY BLOGS ================= */
  const fetchMyBlogs = async () => {
    if (!isLoggedIn) {
      setMyBlogs([]);
      return;
    }

    setMyLoading(true);
    setMyError("");
    try {
      const res = await fetch("http://localhost:5000/api/blog/mine", {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setMyError(data?.message || "Failed to load your blogs");
        setMyBlogs([]);
        return;
      }

      setMyBlogs(
        (data.blogs || []).map((b) => ({
          ...b,
          likes: Array.isArray(b.likes) ? b.likes.map((id) => id.toString()) : [],
          comments: Array.isArray(b.comments) ? b.comments : [],
        }))
      );
    } catch (err) {
      console.error("Fetch my blogs failed:", err);
      setMyError("Failed to load your blogs");
      setMyBlogs([]);
    } finally {
      setMyLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchSavedBlogs();
    fetchMyBlogs();
  }, [isLoggedIn]);

  /* ================= LIKE / UNLIKE ================= */
  const handleLike = async (blogId) => {
    if (!isLoggedIn) {
      alert("Please login to like posts");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/blog/like/${blogId}`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setBlogs((prev) =>
          prev.map((blog) =>
            blog._id === blogId ? { ...blog, likes: data.likes } : blog
          )
        );
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  /* ================= SAVE / UNSAVE ================= */
  const handleSave = async (blogId) => {
    if (!isLoggedIn) {
      alert("Login required");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/blog/save/${blogId}`, {
        method: "PATCH",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setSavedBlogs(data.savedBlogs.map((id) => id.toString()));
        // Optional: show feedback
        // alert(data.saved ? "Post saved!" : "Post unsaved!");
      } else {
        console.error("Save failed:", data.message);
        alert("Failed to save/unsave post");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save/unsave post");
    }
  };

  /* ================= EDIT / DELETE MY BLOGS ================= */
  const handleDeleteBlog = async (blogId) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (!window.confirm("Delete this blog? This cannot be undone.")) return;

    setBusyBlogId(blogId);
    try {
      const res = await fetch(`http://localhost:5000/api/blog/${blogId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Failed to delete blog");
        return;
      }

      setMyBlogs((prev) => prev.filter((b) => b._id !== blogId));
      setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    } catch (err) {
      console.error("Delete blog failed:", err);
      alert("Failed to delete blog");
    } finally {
      setBusyBlogId(null);
    }
  };

  const handleUpdateBlog = async () => {
    if (!editingBlog) return;
    const { id, title, description } = editingBlog;

    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    setBusyBlogId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.message || "Failed to update blog");
        return;
      }

      const updated = {
        ...data.blog,
        likes: Array.isArray(data.blog.likes)
          ? data.blog.likes.map((id) => id.toString())
          : [],
        comments: Array.isArray(data.blog.comments) ? data.blog.comments : [],
      };

      setMyBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, ...updated } : b))
      );
      setBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, ...updated } : b))
      );
      setEditingBlog(null);
    } catch (err) {
      console.error("Update blog failed:", err);
      alert("Failed to update blog");
    } finally {
      setBusyBlogId(null);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="home-page">
      <div className="home-container">
        <header className="hero">
          <h1>Welcome to DevBlog 2025</h1>
          <p>Explore the latest insights from our community</p>

          <div className="hero-btns">
            <Link to="/addblog" className="btn-primary">
              Write a Story
            </Link>
            {!isLoggedIn && (
              <Link to="/register" className="btn-primary">
                Join Community
              </Link>
            )}
          </div>
        </header>

        {isLoggedIn && (
          <section className="my-blogs-section">
            <div className="section-heading">
              <h2>My Blogs</h2>
              <div className="my-blogs-actions">
                <Link to="/addblog" className="btn-primary">
                  New Blog
                </Link>
                {myLoading && <span className="pill muted">Refreshing...</span>}
              </div>
            </div>

            {myError && <div className="pill error">{myError}</div>}
            {!myLoading && myBlogs.length === 0 && !myError && (
              <div className="empty-state">
                <p>You have not written any blogs yet.</p>
                <Link to="/addblog" className="btn-secondary">
                  Write your first blog
                </Link>
              </div>
            )}

            {myBlogs.length > 0 && (
              <div className="blog-grid">
                {myBlogs.map((blog) => {
                  const isEditing = editingBlog?.id === blog._id;

                  return (
                    <div key={blog._id} className="blog-card my-blog-card">
                      <div className="card-content">
                        <span className="author-tag">By you</span>
                        {!isEditing ? (
                          <>
                            <h3>{blog.title?.substring(0, 60)}...</h3>
                            <p>{blog.description?.substring(0, 150)}...</p>
                          </>
                        ) : (
                          <div className="edit-form">
                            <label>Title</label>
                            <input
                              value={editingBlog.title}
                              onChange={(e) =>
                                setEditingBlog((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                            />
                            <label>Description</label>
                            <textarea
                              value={editingBlog.description}
                              onChange={(e) =>
                                setEditingBlog((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}

                        <div className="card-footer my-blog-footer">
                          {!isEditing ? (
                            <>
                              <button
                                className="comment-btn"
                                onClick={() =>
                                  setEditingBlog({
                                    id: blog._id,
                                    title: blog.title || "",
                                    description: blog.description || "",
                                  })
                                }
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="save-btn danger"
                                onClick={() => handleDeleteBlog(blog._id)}
                                disabled={busyBlogId === blog._id}
                              >
                                {busyBlogId === blog._id ? "Deleting..." : "Delete"}
                              </button>
                              <button
                                className="read-more"
                                onClick={() => navigate(`/blog/${blog._id}`)}
                              >
                                Open
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="comment-btn"
                                onClick={handleUpdateBlog}
                                disabled={busyBlogId === blog._id}
                              >
                                {busyBlogId === blog._id ? "Saving..." : "Save"}
                              </button>
                              <button
                                className="save-btn"
                                onClick={() => setEditingBlog(null)}
                                disabled={busyBlogId === blog._id}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <main className="blog-feed">
          <h2>Latest Articles</h2>

          {loading ? (
            <div className="loader">Loading blogs...</div>
          ) : (
            <div className="blog-grid">
              {blogs.map((blog) => {
                const liked = blog.likes.includes(userId);
                const saved = savedBlogs.includes(blog._id);

                return (
                  <div key={blog._id} className="blog-card">
                    <div className="card-content">
                      <span className="author-tag">
                        By {blog.authorId?.name || "Anonymous"}
                      </span>

                      <h3>{blog.title?.substring(0, 60)}...</h3>
                      <p>{blog.description?.substring(0, 150)}...</p>

                      <div className="card-footer">
                        <button
                          className={`like-btn ${liked ? "liked" : ""}`}
                          onClick={() => handleLike(blog._id)}
                        >
                          {liked ? "❤️" : "🤍"} {blog.likes.length}
                        </button>

                        <button
                          className="comment-btn"
                          onClick={() => navigate(`/blog/${blog._id}`)}
                        >
                          💬 {blog.comments.length}
                        </button>

                        <button
                          className="save-btn"
                          onClick={() => handleSave(blog._id)}
                        >
                          {saved ? "🔖 Saved" : "📑 Save"}
                        </button>
                      </div>

                      <button
                        onClick={() => navigate(`/blog/${blog._id}`)}
                        className="read-more"
                      >
                        View Full Post
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
