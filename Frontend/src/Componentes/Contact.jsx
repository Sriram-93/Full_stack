import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Contact.css";


const contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5005/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Message sent successfully!");
      navigate("/about");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2>Contact Us</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="contact-btn">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default contact;