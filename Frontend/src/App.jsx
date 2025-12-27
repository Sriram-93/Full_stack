import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import Register from "./Componentes/Register.jsx";
import Login from "./Componentes/Login.jsx";
import Dashboard from "./Componentes/Dashboard.jsx";
import Home from "./Componentes/Home.jsx"; // Ensure this is imported
import AddBlog from "./Componentes/AddBlog.jsx";
import ProtectedRoute from "./Componentes/ProtectedRoute.jsx";
import BlogDetails from "./Componentes/BlogDetails.jsx";
import SavedPosts from "./Componentes/SavePosts.jsx";
import About from "./Componentes/About.jsx";
import Contact from "./Componentes/Contact.jsx";
import Navbar from "./Componentes/Navbar.jsx";


function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function AppLayout() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/savedposts" element={<SavedPosts />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/addblog"
          element={
            <ProtectedRoute>
              <AddBlog />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
