import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  return <div>Dashboard: {user?.email}</div>;
};

export default Dashboard;
