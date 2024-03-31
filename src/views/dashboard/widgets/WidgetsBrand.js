import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CWidgetStatsD, CRow, CCol } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilRestaurant,
  cilFingerprint,
  cilUser,
  cilQrCode,
} from "@coreui/icons";
import { BASE_URL, VERSION, V1, API, USER_URL } from "../../../constants";
import axios from "axios";
const WidgetsBrand = ({ users }) => {
  return (
    <CRow xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={
            <CIcon icon={cilUser} height={52} className="my-4 text-white" />
          }
          values={[{ title: "STAFFS", value: users }]}
          style={{
            "--cui-card-cap-bg": "#3b5998",
          }}
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={
            <CIcon icon={cilQrCode} height={52} className="my-4 text-white" />
          }
          values={[
            { title: "Yesterday", value: users },
            { title: "rest", value: "1.792" },
          ]}
          style={{
            "--cui-card-cap-bg": "#00aced",
          }}
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          icon={
            <CIcon
              icon={cilRestaurant}
              height={52}
              className="my-4 text-white"
            />
          }
          values={[
            { title: "contacts", value: "500" },
            { title: "feeds", value: "1.292" },
          ]}
          style={{
            "--cui-card-cap-bg": "#4875b4",
          }}
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsD
          color="warning"
          icon={
            <CIcon
              icon={cilFingerprint}
              height={52}
              className="my-4 text-white"
            />
          }
          values={[
            { title: "events", value: "12+" },
            { title: "meetings", value: "4" },
          ]}
        />
      </CCol>
    </CRow>
  );
};

WidgetsBrand.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
};

export default WidgetsBrand;
