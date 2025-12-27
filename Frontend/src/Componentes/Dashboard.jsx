import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const dashboard = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users/saved", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPosts(data.savedBlogs || []));
  }, []);

  return (
    <div className="saved-posts-container">
      <h2>Saved Posts</h2>

      {posts.length === 0 ? (
        <p>No saved posts</p>
      ) : (
        posts.map((blog) => (
          <div key={blog._id} className="saved-blog-card">
            <h3>{blog.title}</h3>
            <p>{blog.description.substring(0, 120)}...</p>
            <Link to={`/blog/${blog._id}`}>Read</Link>
          </div>
        ))
      )}
    </div>
  );
};

export default dashboard;
