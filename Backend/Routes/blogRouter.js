import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Blog from "../Models/BlogSchema.js";
import authMiddleware from "../MiddleWare/authMiddleWare.js";
import mongoose from "mongoose";
import User from "../Models/UserSchema.js";

const router = express.Router();

const minutesSince = (date) => {
  return (Date.now() - new Date(date).getTime()) / (1000 * 60);
};


router.post("/create", authMiddleware, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const newBlog = new Blog({
      authorId: req.user.userId,
      title,
      description,
    });
    await newBlog.save();
    res.status(201).json({ success: true, blog: newBlog });
  } catch (error) {
    next(error);
  }
});



router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user.userId })
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, blogs });
  } catch (err) {
    console.error("FETCH MY BLOGS ERROR:", err);
    res.status(500).json({ message: "Failed to load your blogs" });
  }
});

router.patch("/like/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.userId.toString();

    // Ensure likes array exists
    blog.likes = blog.likes || [];

    const alreadyLiked = blog.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await blog.save();

    res.status(200).json({
      success: true,
      likes: blog.likes.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("LIKE API ERROR:", error);
    res.status(500).json({ message: "Like failed" });
  }
});

router.post("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const newComment = {
      userId: req.user.userId,
      message: message.trim(),
      createdAt: new Date(),
    };
    blog.comments = blog.comments || [];
    blog.comments.push(newComment);

    await blog.save();
    await blog.populate("comments.userId", "name");

    res.status(201).json({
      success: true,
      comment: blog.comments[blog.comments.length - 1],
      commentsCount: blog.comments.length,
    });
  } catch (error) {
    console.error("COMMENT ERROR:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

router.get("/all", async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "authorId",
      "name"
    );
    res.json({ blog });
  } catch (error) {
    res.status(404).json({ message: "Blog not found" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit" });
    }

    if (title) blog.title = title;
    if (description) blog.description = description;

    await blog.save();
    await blog.populate("authorId", "name email");

    res.json({ success: true, blog });
  } catch (err) {
    console.error("UPDATE BLOG ERROR:", err);
    res.status(500).json({ message: "Failed to update blog" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await blog.deleteOne();
    res.json({ success: true, deleted: id });
  } catch (err) {
    console.error("DELETE BLOG ERROR:", err);
    res.status(500).json({ message: "Failed to delete blog" });
  }
});

router.put("/comment/:blogId/:commentId", authMiddleware, async (req, res) => {
  try {
    const { blogId, commentId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // 🔐 Owner check
    if (comment.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const mins = minutesSince(comment.createdAt);

    if (mins > 10) {
      return res.status(403).json({
        message: "Edit time expired (10 minutes)",
      });
    }

    comment.message = message.trim();
    await blog.save();
    await blog.populate("comments.userId", "name");

    res.json({
      success: true,
      comment: blog.comments.id(commentId),
    });
  } catch (err) {
    console.error("EDIT COMMENT ERROR:", err);
    res.status(500).json({ message: "Edit failed" });
  }
});

  

router.delete(
  "/comment/:blogId/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { blogId, commentId } = req.params;

      const blog = await Blog.findById(blogId);
      if (!blog) return res.status(404).json({ message: "Blog not found" });

      const comment = blog.comments.id(commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      // 🔐 Owner check
      if (comment.userId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      comment.deleteOne();
      await blog.save();

      res.json({
        success: true,
        commentId,
      });
    } catch (err) {
      console.error("DELETE COMMENT ERROR:", err);
      res.status(500).json({ message: "Delete failed" });
    }
  }
);

router.patch("/save/:blogId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { blogId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.savedBlogs.includes(blogId);

    if (alreadySaved) {
      user.savedBlogs = user.savedBlogs.filter(
        (id) => id.toString() !== blogId
      );
    } else {
      user.savedBlogs.push(blogId);
    }

    await user.save();

    res.json({
      success: true,
      savedBlogs: user.savedBlogs,
      saved: !alreadySaved,
    });
  } catch (err) {
    console.error("SAVE BLOG ERROR:", err);
    res.status(500).json({ message: "Save failed" });
  }
});
export default router;
