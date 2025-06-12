import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
  CButton, CModal, CModalHeader, CModalBody, CModalFooter, CFormInput, CFormLabel, CFormTextarea, CFormSelect,
  CSpinner, CRow, CCol, CForm, CFormSwitch,
} from '@coreui/react';
import axios from 'axios';
import {
  BASE_URL, PORT, API, VERSION, V1, EVENTS, GET_EVENTS_WITH_POSITION
} from '../../constants';
import CIcon from '@coreui/icons-react';
import { cilCalendar, cilShieldAlt, cilStar, cilPlus, cilChevronBottom, cilChevronRight } from '@coreui/icons';
import { useLocation } from 'react-router-dom';

const API_BASE = `${BASE_URL}${PORT}${API}${VERSION}${V1}${EVENTS}`;

const defaultForm = {
  name: '',
  description: '',
  date_start: '',
  date_end: '',
  position: '',
  media: '',
  is_safety: false,
  is_active: true,
};

// Helper: chuẩn hóa ngày về yyyy-mm-dd
function toDateString(val) {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}

const AdminEventManagement = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState(defaultForm);
  const [updating, setUpdating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [filter, setFilter] = useState({ position: '' });
  const [mediaFile, setMediaFile] = useState(null);
  const [updateMediaFile, setUpdateMediaFile] = useState(null);
  const location = useLocation();

  // POSITIONS giống EmployeeManagement
  const POSITIONS = [
    { value: 'HINO', label: t('POSITION_HINO') },
    { value: 'IZUMO', label: t('POSITION_IZUMO') },
    { value: 'KYOTO', label: t('POSITION_KYOTO') },
    { value: 'OSAKA', label: t('POSITION_OSAKA') },
    { value: 'TOKYO', label: t('POSITION_TOKYO') },
    { value: 'COMPORATION', label: t('POSITION_COMPORATION') },
  ];

  // Lấy userData từ sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('userIF')) || {};

  // Khi là admin, filter mặc định theo position
  useEffect(() => {
    if (userData.role === 'ADMIN' && userData.position) {
      setFilter({ position: userData.position });
    }
  }, []);

  // Fetch all events
  const fetchList = async (customFilter) => {
    setLoading(true);
    try {
      let res;
      if (customFilter && customFilter.position) {
        res = await axios.post(`${API_BASE}/getwithposition`, { position: customFilter.position });
      } else {
        res = await axios.get(`${API_BASE}/getall`);
      }
      setList(res.data?.data || []);
    } catch (e) {
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (filter.position) fetchList(filter);
    else fetchList();
  }, [filter.position]);

  // Khi chọn file media mới
  const handleMediaFileChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);
    if (file) setForm(f => ({ ...f, media: '' }));
  };

  const handleUpdateMediaFileChange = (e) => {
    const file = e.target.files[0];
    setUpdateMediaFile(file);
    if (file) setUpdateForm(f => ({ ...f, media: '' }));
  };

  // Create event
  const handleCreate = async () => {
    if (!form.name || !form.description || !form.date_start || !form.date_end || !form.position) {
      setError(t('requiredFields'));
      return;
    }
    setCreating(true);
    setError('');
    try {
      let data;
      if (mediaFile) {
        data = new FormData();
        data.append('name', form.name);
        data.append('description', form.description);
        data.append('date_start', toDateString(form.date_start));
        data.append('date_end', toDateString(form.date_end));
        data.append('position', form.position);
        data.append('is_safety', form.is_safety);
        data.append('is_active', form.is_active);
        data.append('media', mediaFile);
      } else {
        data = { ...form, date_start: toDateString(form.date_start), date_end: toDateString(form.date_end) };
      }
      const res = await axios.post(`${API_BASE}/create`, data, mediaFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : {});
      if (res.data?.success) {
        setShowCreate(false);
        setForm(defaultForm);
        setMediaFile(null);
        fetchList(filter);
        setAlert({ visible: true, type: 'success', message: t('user.create.toast.success') || 'Tạo thành công!' });
        setTimeout(() => setAlert(a => ({ ...a, visible: false })), 2000);
      } else {
        setError(res.data?.message || t('error'));
        setAlert({ visible: true, type: 'danger', message: res.data?.message || t('error') });
      }
    } catch (e) {
      setError(t('error'));
      setAlert({ visible: true, type: 'danger', message: t('error') });
    }
    setCreating(false);
  };

  // Show detail
  const handleShowDetail = async (id) => {
    setShowDetail(true);
    setDetail(null);
    try {
      const res = await axios.post(`${API_BASE}/searchbyid`, { id });
      setDetail(res.data?.data || null);
    } catch (e) {
      setDetail(null);
    }
  };

  // Open update modal
  const handleOpenUpdate = (item) => {
    setUpdateForm({ ...item });
    setUpdateError('');
    setShowUpdate(true);
  };

  // Update event
  const handleUpdate = async () => {
    if (!updateForm.name || !updateForm.description) {
      setUpdateError(t('requiredFields'));
      return;
    }
    setUpdating(true);
    setUpdateError('');
    try {
      const data = {
        id: updateForm.id,
        name: updateForm.name,
        description: updateForm.description,
        is_safety: updateForm.is_safety,
        is_active: updateForm.is_active,
      };
      const res = await axios.post(`${API_BASE}/update`, data);
      if (res.data?.success) {
        setShowUpdate(false);
        setUpdateForm(defaultForm);
        setUpdateMediaFile(null);
        fetchList(filter);
        setAlert({ visible: true, type: 'success', message: t('user.update.toast.success') || 'Cập nhật thành công!' });
        setTimeout(() => setAlert(a => ({ ...a, visible: false })), 2000);
      } else {
        setUpdateError(res.data?.message || t('error'));
        setAlert({ visible: true, type: 'danger', message: res.data?.message || t('error') });
      }
    } catch (e) {
      setUpdateError(t('error'));
      setAlert({ visible: true, type: 'danger', message: t('error') });
    }
    setUpdating(false);
  };

  // Delete event
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.post(`${API_BASE}/delete`, { id: deleteId });
      setDeleteId(null);
      setDeleting(false);
      setShowDetail(false);
      fetchList(filter);
      setAlert({ visible: true, type: 'success', message: t('user.delete.toast.success') || 'Xóa thành công!' });
      setTimeout(() => setAlert(a => ({ ...a, visible: false })), 2000);
    } catch (e) {
      setDeleting(false);
      setAlert({ visible: true, type: 'danger', message: t('error') });
    }
  };

  // Helper: lấy label position
  const getPositionLabel = (value) => {
    const found = POSITIONS.find((p) => p.value === value);
    return found ? found.label : value;
  };

  // Khi mở modal tạo mới, set position mặc định theo userData
  const handleOpenCreate = () => {
    setForm({ ...defaultForm, position: userData.position || '' });
    setMediaFile(null);
    setError('');
    setShowCreate(true);
  };

  // Filter list theo tab
  const filteredList = list.filter(ev => {
    if (location.pathname === '/events/safety') return ev.is_safety;
    if (location.pathname === '/events/normal') return !ev.is_safety;
    return true;
  });

  const isSafetyPage = location.pathname === '/events/safety';
  const isNormalPage = location.pathname === '/events/normal';

  return (
    <div className="bg-light min-vh-100 p-0">
      <div className="flex-grow-1 p-4">
        {isSafetyPage || isNormalPage ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 400 }}>
            <div style={{ fontSize: 22, color: '#aaa', fontWeight: 600, letterSpacing: 1, padding: '48px 0' }}>
              {t('feature_in_development') || 'Chức năng đang phát triển...'}
            </div>
          </div>
        ) : (
          <>
            <CButton color="success" className="fw-bold mb-4 px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2" onClick={() => setShowCreate(true)}>
              <CIcon icon={cilPlus} /> {t('add')}
            </CButton>
            <h2 className="fw-bold mb-3" style={{ color: '#1a7f37' }}>{t('events')}</h2>
            <CCard className="shadow-sm rounded-4">
              <CCardHeader className="bg-white border-0 px-4 py-4 rounded-top-4 d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">{t('events')}</h5>
              </CCardHeader>
              <CCardBody>
                {/* FILTER UI */}
                {!(userData.role === 'ADMIN') && (
                  <CRow className="mb-3 align-items-end g-3">
                    <CCol xs={12} md={4}>
                      <CFormLabel>{t('position')}</CFormLabel>
                      <CFormSelect
                        value={filter.position}
                        onChange={e => setFilter(f => ({ ...f, position: e.target.value }))}
                      >
                        <option value="">{t('selectPosition')}</option>
                        {POSITIONS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                )}
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                  </div>
                ) : (
                  <div className="table-responsive">
                    <CTable align="middle" hover bordered className="rounded-4 overflow-hidden mb-0">
                      <CTableHead color="light">
                        <CTableRow>
                          <CTableHeaderCell>{t('name')}</CTableHeaderCell>
                          <CTableHeaderCell>{t('description')}</CTableHeaderCell>
                          <CTableHeaderCell>{t('start_date')}</CTableHeaderCell>
                          <CTableHeaderCell>{t('end_date')}</CTableHeaderCell>
                          <CTableHeaderCell>{t('position')}</CTableHeaderCell>
                          <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                          <CTableHeaderCell>{t('actions')}</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {filteredList.map((item) => (
                          <CTableRow key={item.id}>
                            <CTableDataCell>{item.name}</CTableDataCell>
                            <CTableDataCell>{item.description}</CTableDataCell>
                            <CTableDataCell>{item.date_start ? new Date(item.date_start).toLocaleString() : ''}</CTableDataCell>
                            <CTableDataCell>{item.date_end ? new Date(item.date_end).toLocaleString() : ''}</CTableDataCell>
                            <CTableDataCell>{getPositionLabel(item.position)}</CTableDataCell>
                            <CTableDataCell>
                              <span>
                                <span className={`badge rounded-pill bg-${item.is_active ? 'success' : 'danger'}`}>{item.is_active ? t('active') : t('inactive')}</span>
                                {item.is_safety && <span className="badge rounded-pill bg-info ms-2">{t('is_safety')}</span>}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton size="sm" color="info" variant="outline" className="me-1" onClick={() => handleShowDetail(item.id)}>
                                {t('view')}
                              </CButton>
                              <CButton size="sm" color="warning" variant="outline" className="me-1" onClick={() => handleOpenUpdate(item)}>
                                {t('update')}
                              </CButton>
                              <CButton size="sm" color="danger" variant="outline" onClick={() => setDeleteId(item.id)}>
                                {t('delete')}
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
              </CCardBody>
            </CCard>

            {/* Modal tạo mới */}
            <CModal visible={showCreate} onClose={() => setShowCreate(false)} alignment="center" backdrop="static">
              <CModalHeader className="bg-success bg-gradient border-0 rounded-top-4 text-white align-items-center">
                <div className="fw-bold fs-4">{t('add')} {t('events')}</div>
              </CModalHeader>
              <CModalBody>
                <CForm className="px-1">
                  <CRow className="g-4">
                    <CCol xs={12}>
                      <CFormLabel className="fw-bold fs-6">{t('name')}</CFormLabel>
                      <CFormInput size="lg" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder={t('name')} />
                    </CCol>
                    <CCol xs={12}>
                      <CFormLabel className="fw-bold fs-6">{t('description')}</CFormLabel>
                      <CFormTextarea size="lg" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} placeholder={t('description')} />
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">{t('start_date')}</CFormLabel>
                      <CFormInput type="date" size="lg" value={form.date_start} onChange={e => setForm(f => ({ ...f, date_start: e.target.value }))} required />
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">{t('end_date')}</CFormLabel>
                      <CFormInput type="date" size="lg" value={form.date_end} onChange={e => setForm(f => ({ ...f, date_end: e.target.value }))} required />
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">{t('position')}</CFormLabel>
                      <CFormSelect size="lg" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} required>
                        <option value="">{t('selectPosition')}</option>
                        {POSITIONS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">Media</CFormLabel>
                      <CFormInput type="file" accept="image/*,video/*" size="lg" onChange={handleMediaFileChange} />
                      {mediaFile && (
                        <div className="mt-2 text-center">
                          {mediaFile.type.startsWith('image') ? (
                            <img src={URL.createObjectURL(mediaFile)} alt="preview" style={{ maxWidth: 160, maxHeight: 120, borderRadius: 10, border: '1px solid #eee', boxShadow: '0 2px 8px #0001' }} />
                          ) : mediaFile.type.startsWith('video') ? (
                            <video src={URL.createObjectURL(mediaFile)} controls style={{ maxWidth: 220, maxHeight: 120, borderRadius: 10, border: '1px solid #eee', boxShadow: '0 2px 8px #0001' }} />
                          ) : null}
                        </div>
                      )}
                    </CCol>
                    <CCol xs={12} className="d-flex align-items-center gap-4 mt-2 mb-1">
                      <CFormSwitch label={<span className="fw-bold text-info">{t('is_safety')}</span>} checked={form.is_safety} onChange={e => setForm(f => ({ ...f, is_safety: e.target.checked }))} />
                      <CFormSwitch label={<span className="fw-bold text-success">{t('is_active')}</span>} checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                    </CCol>
                    {error && <CCol xs={12}><div className="text-danger small text-center">{error}</div></CCol>}
                    <CCol xs={12} className="d-flex justify-content-end gap-2 mt-2">
                      <CButton color="secondary" variant="outline" size="lg" onClick={() => setShowCreate(false)}>
                        {t('cancel')}
                      </CButton>
                      <CButton color="success" size="lg" disabled={creating} onClick={handleCreate}>
                        {creating ? <CSpinner size="sm" /> : t('add')}
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CModalBody>
            </CModal>

            {/* Modal chi tiết */}
            <CModal visible={showDetail} onClose={() => setShowDetail(false)} alignment="center" backdrop="static">
              <CModalHeader className="bg-info bg-gradient border-0 rounded-top-4 text-white align-items-center">
                <div className="fw-bold fs-4">{t('events')} {t('detail') || 'Detail'}</div>
              </CModalHeader>
              <CModalBody>
                {detail ? (
                  <div className="d-flex flex-column align-items-center p-4" style={{ minWidth: 340 }}>
                    <div className="mb-3 text-center" style={{ fontWeight: 700, fontSize: 26, color: '#1a7f37', letterSpacing: 1 }}>{detail.name}</div>
                    <div className="mb-3 w-100 d-flex justify-content-center">
                      <div style={{
                        fontSize: 19,
                        fontWeight: 500,
                        color: '#1a7f37',
                        background: '#f4f7fa',
                        borderRadius: 14,
                        padding: '18px 22px',
                        textAlign: 'center',
                        minWidth: 260,
                        maxWidth: 480,
                        lineHeight: 1.7,
                        boxShadow: '0 2px 8px #1a7f3722',
                        whiteSpace: 'pre-line',
                        margin: '0 auto',
                      }}>{detail.description}</div>
                    </div>
                    <div className="mb-2 d-flex gap-2 align-items-center justify-content-center">
                      <span className="fw-bold" style={{ color: '#1a7f37' }}>{t('start_date')}:</span>
                      <span style={{ fontSize: 17 }}>{detail.date_start ? new Date(detail.date_start).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="mb-2 d-flex gap-2 align-items-center justify-content-center">
                      <span className="fw-bold" style={{ color: '#1a7f37' }}>{t('end_date')}:</span>
                      <span style={{ fontSize: 17 }}>{detail.date_end ? new Date(detail.date_end).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="mb-2 d-flex gap-2 align-items-center justify-content-center">
                      <span className="fw-bold" style={{ color: '#1a7f37' }}>{t('position')}:</span>
                      <span style={{ fontSize: 17 }}>{getPositionLabel(detail.position)}</span>
                    </div>
                    {detail.media && (
                      <div className="mb-3 mt-2 text-center">
                        {detail.media.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={detail.media} controls style={{ maxWidth: 320, maxHeight: 180, borderRadius: 16, border: '1px solid #eee', boxShadow: '0 2px 12px #0001' }} />
                        ) : (
                          <img src={detail.media} alt="media" style={{ maxWidth: 220, maxHeight: 220, borderRadius: 16, border: '1px solid #eee', boxShadow: '0 2px 12px #0001' }} />
                        )}
                      </div>
                    )}
                    <div className="mb-4 d-flex gap-3 align-items-center justify-content-center">
                      <span className={`badge rounded-pill bg-${detail.is_active ? 'success' : 'danger'}`} style={{ fontSize: 17, padding: '10px 22px', borderRadius: 18, letterSpacing: 1 }}>
                        {detail.is_active ? t('active') : t('inactive')}
                      </span>
                      {detail.is_safety && <span className="badge rounded-pill bg-info" style={{ fontSize: 17, padding: '10px 22px', borderRadius: 18, letterSpacing: 1 }}>{t('is_safety')}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4"><CSpinner color="primary" /></div>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="danger" variant="outline" onClick={() => setDeleteId(detail?.id)} disabled={deleting}>
                  {deleting ? <CSpinner size="sm" /> : t('delete')}
                </CButton>
                <CButton color="secondary" onClick={() => setShowDetail(false)}>
                  {t('cancel')}
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Modal update */}
            <CModal visible={showUpdate} onClose={() => setShowUpdate(false)} alignment="center" backdrop="static">
              <CModalHeader className="bg-warning bg-gradient border-0 rounded-top-4 text-white align-items-center">
                <div className="fw-bold fs-4">{t('update')} {t('events')}</div>
              </CModalHeader>
              <CModalBody>
                <CForm className="px-1">
                  <CRow className="g-4">
                    <CCol xs={12}>
                      <CFormLabel className="fw-bold fs-6">{t('name')}</CFormLabel>
                      <CFormInput size="lg" value={updateForm.name} onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))} required placeholder={t('name')} />
                    </CCol>
                    <CCol xs={12}>
                      <CFormLabel className="fw-bold fs-6">{t('description')}</CFormLabel>
                      <CFormTextarea size="lg" value={updateForm.description} onChange={e => setUpdateForm(f => ({ ...f, description: e.target.value }))} required rows={3} placeholder={t('description')} />
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">{t('start_date')}</CFormLabel>
                      <div className="form-control-plaintext ps-2" style={{ fontSize: 17, color: '#555', minHeight: 44, background: '#f8fafc', borderRadius: 10 }}>{updateForm.date_start ? new Date(updateForm.date_start).toLocaleDateString() : '-'}</div>
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">{t('end_date')}</CFormLabel>
                      <div className="form-control-plaintext ps-2" style={{ fontSize: 17, color: '#555', minHeight: 44, background: '#f8fafc', borderRadius: 10 }}>{updateForm.date_end ? new Date(updateForm.date_end).toLocaleDateString() : '-'}</div>
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">{t('position')}</CFormLabel>
                      <div className="form-control-plaintext ps-2" style={{ fontSize: 17, color: '#555', minHeight: 44, background: '#f8fafc', borderRadius: 10 }}>{getPositionLabel(updateForm.position)}</div>
                    </CCol>
                    <CCol xs={12} md={6}>
                      <CFormLabel className="fw-bold fs-6">Media</CFormLabel>
                      {updateForm.media ? (
                        <div className="mt-2 text-center">
                          {updateForm.media.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={updateForm.media} controls style={{ maxWidth: 220, maxHeight: 120, borderRadius: 10, border: '1px solid #eee', boxShadow: '0 2px 8px #0001' }} />
                          ) : (
                            <img src={updateForm.media} alt="media" style={{ maxWidth: 160, maxHeight: 120, borderRadius: 10, border: '1px solid #eee', boxShadow: '0 2px 8px #0001' }} />
                          )}
                        </div>
                      ) : (
                        <div className="form-control-plaintext ps-2" style={{ fontSize: 17, color: '#aaa', minHeight: 44, background: '#f8fafc', borderRadius: 10 }}>-</div>
                      )}
                    </CCol>
                    <CCol xs={12} className="d-flex align-items-center gap-4 mt-2 mb-1">
                      <CFormSwitch label={<span className="fw-bold text-info">{t('is_safety')}</span>} checked={updateForm.is_safety} onChange={e => setUpdateForm(f => ({ ...f, is_safety: e.target.checked }))} />
                      <CFormSwitch label={<span className="fw-bold text-success">{t('is_active')}</span>} checked={updateForm.is_active} onChange={e => setUpdateForm(f => ({ ...f, is_active: e.target.checked }))} />
                    </CCol>
                    {updateError && <CCol xs={12}><div className="text-danger small text-center">{updateError}</div></CCol>}
                    <CCol xs={12} className="d-flex justify-content-end gap-2 mt-2">
                      <CButton color="secondary" variant="outline" size="lg" onClick={() => setShowUpdate(false)}>
                        {t('cancel')}
                      </CButton>
                      <CButton color="warning" size="lg" disabled={updating} onClick={handleUpdate}>
                        {updating ? <CSpinner size="sm" /> : t('update')}
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CModalBody>
            </CModal>

            {/* Modal xác nhận xóa */}
            <CModal visible={!!deleteId} onClose={() => setDeleteId(null)} alignment="center" backdrop="static">
              <CModalHeader>{t('delete')}</CModalHeader>
              <CModalBody>{t('deleteUserConfirm') || 'Bạn có chắc chắn muốn xóa sự kiện này?'}</CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setDeleteId(null)}>
                  {t('cancel')}
                </CButton>
                <CButton color="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <CSpinner size="sm" /> : t('delete')}
                </CButton>
              </CModalFooter>
            </CModal>

            {/* Modal thông báo */}
            <CModal visible={alert.visible} onClose={() => setAlert(a => ({ ...a, visible: false }))} alignment="center">
              <CModalHeader>{alert.type === 'success' ? t('success') : t('error')}</CModalHeader>
              <CModalBody>
                <div className={alert.type === 'success' ? 'text-success' : 'text-danger'} style={{ fontWeight: 600, fontSize: 18 }}>
                  {alert.message}
                </div>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setAlert(a => ({ ...a, visible: false }))}>{t('cancel')}</CButton>
              </CModalFooter>
            </CModal>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminEventManagement; 