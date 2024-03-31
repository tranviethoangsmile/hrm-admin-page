import React from "react";
import { CFooter } from "@coreui/react";

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a
          href="https://www.d-metal.co.jp/"
          target="_blank"
          rel="noopener noreferrer"
        >
          株式会社ダイハツメタル
        </a>
        <span className="ms-1">&copy; 2024 効果的な管理ソ​​リューション.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">搭載</span>
        <a
          href="https://www.facebook.com/tranviethoangsmile"
          target="_blank"
          rel="noopener noreferrer"
        >
          hoangdev &amp; Dashboard Template
        </a>
      </div>
    </CFooter>
  );
};

export default React.memo(AppFooter);
