import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
  CImage,
} from "@coreui/react";
import { QRCodeCanvas } from "qrcode.react"; // Correct import statement
import socket from "../../../socket.config/socketio";
import avatar from "../../../assets/images/avatars/avatar-empty.png";
import Swal from "sweetalert2";
const Checkin = () => {
  const [qrValue, setQrValue] = useState("");
  const [userChecked, setUserChecked] = useState("");
  socket.on("userChecked", (data) => {
    if (data.data.message === "in") {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Welcome",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (data.data.message === "out") {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Thanks you",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    setUserChecked(data?.data.avatar.avatar);
  });
  socket.on("qrReset", (value) => {
    setQrValue(value);
  });

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={20}>
            <CCardGroup>
              <CCard className="align-items-center">
                <CCardBody className="bg-white">
                  <h1>Checkin</h1>
                  <QRCodeCanvas level="Q" size={300} value={qrValue} />
                </CCardBody>
              </CCard>
              <CCard
                className="text-black bg-white py-5 align-items-center"
                style={{ width: "100%", height: "500px" }}
              >
                <CCardBody className="text-center">
                  <CImage
                    fluid
                    src={userChecked ? userChecked : avatar}
                    width={300}
                  />
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Checkin;
