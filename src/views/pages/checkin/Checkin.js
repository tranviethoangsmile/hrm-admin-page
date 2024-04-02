import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
} from "@coreui/react";
import { QRCodeCanvas } from "qrcode.react"; // Correct import statement
import socket from "../../../socket.config/socketio";

const Checkin = () => {
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    socket.on("qrReset", (value) => {
      console.log(value);
      setQrValue(value);
    });

    return () => {
      socket.off("qrReset");
    };
  }, []);

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center bg-white">
          <CCol md={20}>
            <CCardGroup>
              <CCard
                className="align-items-center"
                style={{ width: "50%", height: "500px" }}
              >
                <CCardBody className="bg-white">
                  <h1>Checkin</h1>
                  <QRCodeCanvas
                    level="Q"
                    size={300}
                    bgColor="#ffffff"
                    value={qrValue}
                  />
                </CCardBody>
              </CCard>
              <CCard
                className="text-white bg-primary py-5"
                style={{ width: "50%", height: "500px" }}
              >
                <CCardBody className="text-center">
                  <div>
                    <h2>WELCOME</h2>
                    <p>
                      Welcome to the smart business management system. This
                      product is developed by Hoangdev.
                    </p>
                  </div>
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
