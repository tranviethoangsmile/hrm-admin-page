---
name: hrm-admin
description: Hướng dẫn thiết kế và viết code cho trang quản trị hrm-admin-page (React + CoreUI + Vite + i18next). Dùng skill này khi cần tạo trang mới, component mới, hoặc hoàn thiện các trang "Coming Soon" trong hệ thống admin HRM. Bắt buộc đọc khi người dùng yêu cầu viết bất kỳ view/component nào cho admin page, dùng CoreUI, kết nối API backend, hoặc thêm chức năng quản lý cho ADMIN/LEADER/STAFF.
---

# HRM Admin Page — Frontend Skill

## Tech Stack
- **Framework**: React 18 + Vite
- **UI Library**: CoreUI React v5 (`@coreui/react`)
- **Icons**: `@coreui/icons-react`
- **Charts**: Chart.js + `@coreui/react-chartjs`
- **HTTP**: Axios
- **State**: Redux (legacy `createStore`) — dùng sessionStorage cho auth
- **i18n**: i18next + react-i18next (EN/VI/JP/PT)
- **Date**: moment.js + react-datepicker
- **Alerts**: SweetAlert2
- **Realtime**: Socket.IO client

---

## Màu sắc & Brand

```css
/* Brand color chính — dùng nhất quán */
--brand-green: #1a7f37;
--brand-green-gradient: linear-gradient(90deg, #1a7f37, #43e97b);

/* Trạng thái */
--success: #1a7f37   /* confirmed, active */
--danger:  #e74c3c   /* rejected, inactive */
--warning: #f9c846   /* pending */
--info:    #3498db   /* info, detail */
```

---

## Cấu trúc file view

```
src/views/tenModule/
├── TenModuleManagement.jsx    ← file chính (chỉ dùng .jsx)
└── TenModuleModal.jsx         ← modal riêng nếu phức tạp (optional)
```

**Lưu ý:** Nếu thấy cả `.js` và `.jsx` cùng tên → xóa `.js`, giữ `.jsx`.

---

## Template component chuẩn

```jsx
// src/views/tenModule/TenModuleManagement.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  CCard, CCardBody, CCardHeader,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormSelect, CFormSwitch,
  CRow, CCol, CBadge, CSpinner,
} from '@coreui/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  buildApiUrl,
  TEN_MODULE, CREATE, SEARCH, UPDATE, DELETE,
} from '../../constants';

const TenModuleManagement = () => {
  const { t } = useTranslation();
  // Lấy user từ sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('userIF')) || {};

  // ── State ──────────────────────────────────
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ field1: '', field2: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── API calls ──────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        buildApiUrl(TEN_MODULE, SEARCH),
        { position: userData.position }
      );
      setList(res.data?.data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [userData.position]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleCreate = async () => {
    if (!form.field1) { setError(t('fill_required')); return; }
    setSaving(true);
    try {
      const res = await axios.post(
        buildApiUrl(TEN_MODULE, CREATE),
        { ...form, position: userData.position }
      );
      if (res.data?.success) {
        setShowCreate(false);
        setForm({ field1: '', field2: '', is_active: true });
        fetchList();
      } else {
        setError(res.data?.message || t('error'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: t('confirm_delete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#aaa',
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel'),
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(buildApiUrl(TEN_MODULE, `/${id}`));
      fetchList();
    } catch { /* silent */ }
  };

  // ── Render ─────────────────────────────────
  return (
    <div className="bg-light min-vh-100 p-4">
      <CCard className="shadow-sm rounded-4">
        <CCardHeader className="d-flex justify-content-between align-items-center py-3">
          <h5 className="fw-bold mb-0" style={{ color: '#1a7f37' }}>
            {t('ten_module')}
          </h5>
          <CButton
            color="success"
            size="sm"
            onClick={() => { setShowCreate(true); setError(''); }}
          >
            + {t('add')}
          </CButton>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5"><CSpinner color="success" /></div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>{t('field1')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                  <CTableHeaderCell>{t('action')}</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {list.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={4} className="text-center text-muted py-4">
                      {t('noData')}
                    </CTableDataCell>
                  </CTableRow>
                ) : list.map((item, idx) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell>{idx + 1}</CTableDataCell>
                    <CTableDataCell>{item.field1}</CTableDataCell>
                    <CTableDataCell>
                      <StatusBadge active={item.is_active} t={t} />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="info" variant="outline" className="me-2"
                        onClick={() => { setDetail(item); setShowDetail(true); }}>
                        {t('view')}
                      </CButton>
                      <CButton size="sm" color="danger" variant="outline"
                        onClick={() => handleDelete(item.id)}>
                        {t('delete')}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal tạo mới */}
      <CModal visible={showCreate} onClose={() => setShowCreate(false)}
        alignment="center" backdrop="static">
        <CModalHeader className="border-0 rounded-top-4"
          style={{ background: 'linear-gradient(90deg,#1a7f37,#43e97b)' }}>
          <CModalTitle className="text-white fw-bold">+ {t('add')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel className="fw-bold">{t('field1')}</CFormLabel>
                <CFormInput
                  value={form.field1}
                  onChange={e => setForm(f => ({ ...f, field1: e.target.value }))}
                  placeholder={t('field1')}
                  required
                />
              </CCol>
              <CCol xs={12}>
                <CFormSwitch
                  label={<span className="fw-bold text-success">{t('is_active')}</span>}
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                />
              </CCol>
              {error && (
                <CCol xs={12}>
                  <div className="text-danger small text-center">{error}</div>
                </CCol>
              )}
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setShowCreate(false)}>
            {t('cancel')}
          </CButton>
          <CButton color="success" onClick={handleCreate} disabled={saving}>
            {saving ? <CSpinner size="sm" /> : t('add')}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal chi tiết */}
      <CModal visible={showDetail} onClose={() => setShowDetail(false)} alignment="center">
        <CModalHeader className="border-0 rounded-top-4"
          style={{ background: 'linear-gradient(90deg,#3498db,#6dd5fa)' }}>
          <CModalTitle className="text-white fw-bold">{t('detail')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detail && (
            <div className="p-2">
              <p><strong>{t('field1')}:</strong> {detail.field1}</p>
              <p><strong>{t('status')}:</strong> <StatusBadge active={detail.is_active} t={t} /></p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDetail(false)}>{t('cancel')}</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

// ── Sub-components ─────────────────────────────
const StatusBadge = ({ active, t }) => (
  <CBadge
    color={active ? 'success' : 'danger'}
    className="px-3 py-2 fw-semibold"
    style={{
      background: active
        ? 'linear-gradient(90deg,#1a7f37,#43e97b)'
        : 'linear-gradient(90deg,#e74c3c,#f9d423)',
    }}
  >
    {active ? t('confirmed') : t('notConfirmed')}
  </CBadge>
);

export default TenModuleManagement;
```

---

## Quy tắc UI

### Modal headers — màu theo hành động
```jsx
// Tạo mới → green gradient
style={{ background: 'linear-gradient(90deg,#1a7f37,#43e97b)' }}

// Chi tiết / xem → blue gradient  
style={{ background: 'linear-gradient(90deg,#3498db,#6dd5fa)' }}

// Cập nhật → warning gradient
style={{ background: 'linear-gradient(90deg,#f9c846,#f7971e)' }}

// Xóa / nguy hiểm → red gradient
style={{ background: 'linear-gradient(90deg,#e74c3c,#f9d423)' }}
```

### Status badges
```jsx
// Dùng linear-gradient để badge đẹp hơn color đơn thuần
// Active/Confirmed: green gradient
// Inactive/Rejected: red gradient  
// Pending: yellow/orange gradient
// Info: blue gradient
```

### Confirm xóa — luôn dùng SweetAlert2
```jsx
const confirm = await Swal.fire({
  title: t('confirm_delete'),
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#e74c3c',
  cancelButtonColor: '#aaa',
  confirmButtonText: t('delete'),
  cancelButtonText: t('cancel'),
});
if (!confirm.isConfirmed) return;
```

### Kết nối API — luôn dùng constants
```javascript
// constants.js đã có sẵn tất cả base URL và paths
// KHÔNG hardcode URL như: 'http://54.200.248.63:80/api/...'
// PHẢI dùng: buildApiUrl(TEN_MODULE) hoặc adminRequest({ path: `${TEN_MODULE}/...` })
```

---

## Thêm constant mới

```javascript
// src/constants.js — thêm vào cuối
export const TEN_MODULE = '/ten-module';
export const GET_TEN_MODULE_BY_ID = '/getbyid';
```

---

## Thêm vào Navigation (_nav.js)

```jsx
// Cho ADMIN
{
  component: CNavItem,
  name: 'ten_module',          // key i18n
  to: '/ten-module',
  icon: <CIcon icon={cilIconName} customClassName="nav-icon" style={iconColor} />,
},
```

---

## Thêm vào Routes (routes.js)

```javascript
const TenModuleManagement = React.lazy(() => import('./views/tenModule/TenModuleManagement'));

// Trong mảng routes:
{ path: '/ten-module', name: 'Tên module', element: TenModuleManagement },
```

---

## i18n — Thêm translation

```javascript
// src/i18next/i18next.js — thêm vào cả 4 ngôn ngữ (en, vi, jp, pt)
// en:
ten_module: 'Module Name',
field1_label: 'Field 1',

// vi:
ten_module: 'Tên module',
field1_label: 'Trường 1',
```

---

## Checklist khi tạo trang mới

- [ ] Tạo file `.jsx` trong `src/views/tenModule/`
- [ ] Dùng `useTranslation()` cho tất cả text hiển thị
- [ ] Lấy `userData` từ `sessionStorage.getItem('userIF')`
- [ ] Kết nối API qua constants (không hardcode URL)
- [ ] Header card dùng màu `#1a7f37` làm brand color
- [ ] Confirm xóa bằng SweetAlert2
- [ ] Loading state với `CSpinner`
- [ ] Empty state hiển thị `{t('noData')}`
- [ ] Thêm route vào `routes.js`
- [ ] Thêm nav item vào `_nav.js` (đúng role)
- [ ] Thêm translation keys vào `i18next.js`
- [ ] Thêm constant paths vào `constants.js`
