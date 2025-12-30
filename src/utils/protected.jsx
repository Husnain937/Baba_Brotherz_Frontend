import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Protected = ({ children, permission }) => {
  const { user } = useAuth();

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 👑 Admin has full access
  if (user.role === "admin") {
    return children;
  }

  // 🔒 Permission-based check
  if (permission && !user.permissions?.[permission]) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default Protected;
