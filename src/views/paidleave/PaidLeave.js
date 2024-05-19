import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableRow,
  CTableHead,
  CTableBody,
  CTableHeaderCell,
  CTableDataCell,
  CContainer,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilUser } from "@coreui/icons";
import { BASE_URL, V1, VERSION, LOGIN_URL, API, PORT } from "../../constants";
const PaidLeave = () => {
  const navigate = useNavigate();

  return (
    <>
      <CContainer className="px-4">
        <CCard className="mb4">
          <CCardHeader>Traffic {" & "} Sales</CCardHeader>
        </CCard>
      </CContainer>
    </>
  );
};

export default PaidLeave;
