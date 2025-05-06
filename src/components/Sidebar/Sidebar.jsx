import React from "react";
import "./Sidebar.scss";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Dashboard</h3>
      </div>
      <ul className="sidebar-links">
        <li>Mes Annonces</li>
        <li>Messages</li>
        <li>Saved Properties</li>
        <li>Profile Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
