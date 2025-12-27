import React from "react";
import "./About.css";

const About = () => {
  return (
    <main className="about-container">
      <header>
        <h1>About This Blog</h1>
        <p className="about-intro">
          A simple blog platform where users can create posts, share ideas, and
          interact with content from the community.
        </p>
      </header>

      <section>
        <h2>Features</h2>
        <ul>
          <li>User registration and authentication</li>
          <li>Create, read, update, and delete blog posts</li>
          <li>Like and unlike posts</li>
          <li>Protected routes for logged-in users</li>
        </ul>
      </section>

      <section>
        <h2>Technology Stack</h2>
        <ul>
          <li>
            <strong>Frontend:</strong> React, React Router
          </li>
          <li>
            <strong>Backend:</strong> Node.js, Express
          </li>
          <li>
            <strong>Database:</strong> MongoDB
          </li>
          <li>
            <strong>Authentication:</strong> JWT
          </li>
        </ul>
      </section>
    </main>
  );
};

export default About;
