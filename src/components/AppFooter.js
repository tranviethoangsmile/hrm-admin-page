import React from "react";

const AppFooter = () => {
  return (
    <footer className="app-footer content-panel">
      <div>
        <strong>HRM Metal</strong>
        <div className="small">Human resources operations workspace</div>
      </div>
      <div className="small">
        © {new Date().getFullYear()} Built for clear daily execution
      </div>
    </footer>
  );
};

export default AppFooter;
