import React from "react";

const AppFooter = () => {
  return (
    <footer className="app-footer bg-white shadow-sm rounded-4 px-4 py-2 mt-3 text-center text-secondary small">
      © {new Date().getFullYear()} HRM Metal. All rights reserved.
    </footer>
  );
};

export default AppFooter;
