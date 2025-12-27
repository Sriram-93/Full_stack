    import React, { useEffect, useState } from "react";
    import { useParams, Link, useNavigate } from "react-router-dom";
    import "./BlogDetails.css";


    const EDIT_WINDOW_MINUTES = 10;

    const BlogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savedBlogs, setSavedBlogs] = useState([]);

    const [commentText, setCommentText] = useState("");
    const [posting, setPosting] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Fetch saved blogs on mount
    useEffect(() => {
        const fetchSavedBlogs = async () => {
            if (!isLoggedIn) return;
            try {
                const res = await fetch("http://localhost:5000/api/users/saved", {
                    credentials: "include",
                });
                const data = await res.json();
                if (res.ok) {
                    setSavedBlogs(data.savedBlogs.map((id) => id.toString()));
                }
            } catch (err) {
                console.error("Failed to fetch saved blogs:", err);
            }
        };
        fetchSavedBlogs();
    }, [isLoggedIn]);

    /* ================= TIME HELPERS ================= */
    const minutesAgo = (date) =>
        Math.floor((Date.now() - new Date(date)) / 60000);

    const timeAgo = (date) => {
        const mins = minutesAgo(date);
        if (mins === 0) return "Just now";
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.floor(mins / 60);
        return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    };

    /* ================= FETCH BLOG ================= */
    useEffect(() => {
        const fetchBlog = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/blog/${id}`);
            const data = await res.json();

            if (res.ok) {
            setBlog({
                ...data.blog,
                likes: data.blog.likes || [],
                comments: data.blog.comments || [],
            });
            }
        } catch (err) {
            console.error("Fetch blog failed:", err);
        } finally {
            setLoading(false);
        }
        };

        fetchBlog();
    }, [id]);

    /* ================= SAVE / UNSAVE ================= */
    const handleSave = async () => {
        if (!isLoggedIn) {
            alert("Login required");
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/blog/save/${id}`, {
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

    /* ================= LIKE BLOG ================= */
    const handleLike = async () => {
        if (!isLoggedIn) {
        alert("Please login to like");
        navigate("/login");
        return;
        }

        try {
        const res = await fetch(`http://localhost:5000/api/blog/like/${id}`, {
            method: "PATCH",
            credentials: "include",
        });

        const data = await res.json();
        if (res.ok) {
            setBlog((prev) => ({ ...prev, likes: data.likes }));
        }
        } catch (err) {
        console.error("Like failed:", err);
        }
    };

    /* ================= ADD COMMENT ================= */
    const handleAddComment = async () => {
        if (!isLoggedIn) {
        alert("Login required");
        navigate("/login");
        return;
        }

        if (!commentText.trim()) return;

        try {
        setPosting(true);
        const res = await fetch(`http://localhost:5000/api/blog/comment/${id}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: commentText }),
        });

        const data = await res.json();
        if (res.ok) {
            setBlog((prev) => ({
            ...prev,
            comments: [...prev.comments, data.comment],
            }));
            setCommentText("");
        }
        } catch (err) {
        console.error("Add comment failed:", err);
        } finally {
        setPosting(false);
        }
    };

    /* ================= DELETE COMMENT (ANYTIME) ================= */
    const handleDeleteComment = async (commentId) => {
        try {
        await fetch(`http://localhost:5000/api/blog/comment/${id}/${commentId}`, {
            method: "DELETE",
            credentials: "include",
        });

        setBlog((prev) => ({
            ...prev,
            comments: prev.comments.filter((c) => c._id !== commentId),
        }));
        } catch (err) {
        console.error("Delete comment failed:", err);
        }
    };

    /* ================= EDIT COMMENT (TIME LIMITED) ================= */
    const handleEditComment = async (commentId) => {
        try {
        const res = await fetch(
            `http://localhost:5000/api/blog/comment/${id}/${commentId}`,
            {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: editingText }),
            }
        );

        const data = await res.json();
        if (res.ok) {
            setBlog((prev) => ({
            ...prev,
            comments: prev.comments.map((c) =>
                c._id === commentId ? { ...data.comment, edited: true } : c
            ),
            }));
            setEditingId(null);
            setEditingText("");
        }
        } catch (err) {
        console.error("Edit comment failed:", err);
        }
    };

    /* ================= UI ================= */
    if (loading) return <div className="loader">Loading...</div>;
    if (!blog) return <div>Blog not found</div>;

    const liked = blog.likes.includes(userId);
    const saved = savedBlogs.includes(blog._id);

    return (
        <div className="blog-details-page">
        <div className="blog-details-container">
        <Link to="/home">← Back to Feed</Link>

        <article className="blog-details-card" style={{ padding: "40px" }}>
            <span className="blog-details-author-tag">
            By {blog.authorId?.name || "Anonymous"}
            </span>

            <h1>{blog.title}</h1>
            <p>{blog.description}</p>

            <div className="blog-details-card-footer">
            <button
                className={`blog-details-like-btn ${liked ? "liked" : ""}`}
                onClick={handleLike}
            >
                {liked ? "❤️" : "🤍"} {blog.likes.length}
            </button>
            <button
                className={`blog-details-save-btn ${saved ? "saved" : ""}`}
                onClick={handleSave}
            >
                {saved ? "🔖" : "📁"} {saved ? "Saved" : "Save"}
            </button>
            </div>
        </article>

        {/* ================= COMMENTS ================= */}
        <div className="blog-details-comments-section">
            <h3>Comments ({blog.comments.length})</h3>

            {blog.comments.map((c) => {
            const isOwner = c.userId?._id === userId;
            const mins = minutesAgo(c.createdAt);
            const canEdit = isOwner && mins <= EDIT_WINDOW_MINUTES;

            return (
                <div key={c._id} className="blog-details-comment-item">
                <div className="blog-details-comment-header">
                    <strong>{c.userId?.name || "User"}</strong>
                    <span className="blog-details-time">
                    {timeAgo(c.createdAt)}
                    {c.edited && <span className="blog-details-edited-tag"> · Edited</span>}
                    </span>
                </div>

                {editingId === c._id ? (
                    <>
                    <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                    />
                    <button onClick={() => handleEditComment(c._id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                ) : (
                    <p>{c.message}</p>
                )}

                {isOwner && editingId !== c._id && (
                    <div className="blog-details-comment-actions">
                    {canEdit && (
                        <button
                        onClick={() => {
                            setEditingId(c._id);
                            setEditingText(c.message);
                        }}
                        >
                        Edit
                        </button>
                    )}
                    <button onClick={() => handleDeleteComment(c._id)}>
                        Delete
                    </button>
                    </div>
                )}

                {!canEdit && isOwner && (
                    <span className="blog-details-edit-locked">
                    Edit locked (after {EDIT_WINDOW_MINUTES} mins)
                    </span>
                )}
                </div>
            );
            })}

            <div className="blog-details-comment-box">
            <textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleAddComment} disabled={posting}>
                {posting ? "Posting..." : "Add Comment"}
            </button>
            </div>
        </div>
        </div>
        </div>
    );
    };

    export default BlogDetails;
