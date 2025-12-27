import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AddBlog.css";


const AddBlog = () => {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("http://localhost:5000/api/blog/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", 
          body: JSON.stringify({ title,description }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Blog added successfully");
          navigate("/home");
        } else {
          alert(data.message || "Some Error");
        }
      } catch (error) {
        alert("Server connection failed");
      }
    };


  return (
    <div className="addblog-container">
      <Link to="/home" className="back-link">← Back to Feed</Link>
      <div className="addblog-card">
        <h2>Add New Blog</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <textarea
              onChange={(e) => setTitle(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="addblog-btn">
            Add Blog
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;