import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSwitch,
  CFormTextarea,
  CFormSelect,
  CBadge,
  CSpinner,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react';
import axios from 'axios';
import {
  BASE_URL,
  PORT,
  API,
  VERSION,
  V1,
  INFORMATION,
  CREATE,
  GET_ALL_BY_FIELD,
  UPDATE,
  DELETE_INFORMATION_BY_ID,
  GET_INFOR_BY_ID
} from '../../constants';

const API_BASE = `${BASE_URL}${PORT}${API}${VERSION}${V1}${INFORMATION}`;

const defaultForm = {
  user_id: '',
  title: '',
  content: '',
  date: '',
  position: '',
  media: '',
  is_video: false,
  is_public: true,
  is_event: false,
};

const AdminInformationManagement = () => {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [filter, setFilter] = useState({ position: '', is_public: '' });
  const [isVideo, setIsVideo] = useState(false);
  const [alert, setAlert] = useState({ visible: false, type: 'success', message: '' });
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState(defaultForm);
  const [updateMediaFile, setUpdateMediaFile] = useState(null);
  const [updateIsVideo, setUpdateIsVideo] = useState(false);
  const [updateError, setUpdateError] = useState('');

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

  // Khi là admin, filter mặc định theo position và is_public=true
  useEffect(() => {
    if (userData.role === 'ADMIN' && userData.position) {
      setFilter({ position: userData.position, is_public: 'true' });
    }
    // fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Fetch all information with filter
  const fetchList = async (customFilter) => {
    setLoading(true);
    try {
      let field = {};
      if (customFilter) {
        if (customFilter.position) field.position = customFilter.position;
        if (customFilter.is_public !== '') field.is_public = customFilter.is_public;
      }
      const res = await axios.post(`${API_BASE}${GET_ALL_BY_FIELD}`, { field });
      console.log('data',res.data);
      setList(res.data?.data || []);
    } catch (e) {
      setList([]);
    }
    setLoading(false);
  };

  // Fetch all users for select
  // const fetchUsers = async () => {
  //   try {
  //     const res = await axios.get('http://54.200.248.63:80/api/version/v1/user');
  //     setUsers(res.data?.data || []);
  //   } catch (e) {
  //     setUsers([]);
  //   }
  // };

  useEffect(() => {
    if (filter.position && filter.is_public) {
      fetchList(filter);
    }
    // eslint-disable-next-line
  }, [filter.position, filter.is_public]);

  // Khi chọn file, xác định luôn is_video
  const handleMediaFileChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);
    if (file) {
      setIsVideo(file.type.startsWith('video'));
    } else {
      setIsVideo(false);
    }
  };

  // Create new information
  const handleCreate = async () => {
    // Validate các trường bắt buộc
    if (!form.title || !form.content) {
      setError(t('requiredFields'));
      return;
    }
    setCreating(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('is_event', form.is_event);
      formData.append('is_public', form.is_public);
      formData.append('is_video', isVideo);
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      if (userData && userData.id) {
        formData.append('user_id', userData.id);
      }
      if (userData && userData.position) {
        formData.append('position', userData.position);
      }
      // Thêm ngày đăng là ngày hiện tại (YYYY-MM-DD)
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      formData.append('date', dateStr);
      const res = await axios.post(`${API_BASE}${CREATE}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(res.data);
      if (res.data?.success) {
        setShowCreate(false);
        setForm(defaultForm);
        setMediaFile(null);
        setIsVideo(false);
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

  // Get detail by id
  const handleShowDetail = async (id) => {
    setShowDetail(true);
    setDetail(null);
    try {
      const res = await axios.post(`${API_BASE}${GET_INFOR_BY_ID}`, { id });
      setDetail(res.data?.data || null);
    } catch (e) {
      setDetail(null);
    }
  };

  // Delete by id
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.post(`${API_BASE}${DELETE_INFORMATION_BY_ID}`, { id: deleteId });
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

  // Khi bấm nút update, mở modal và điền dữ liệu
  const handleOpenUpdate = (item) => {
    setUpdateForm({
      ...item,
      user_id: item.user_id || userData.id || '',
      position: item.position || userData.position || '',
      date: item.date || '',
      is_public: !!item.is_public,
      is_event: !!item.is_event,
    });
    setUpdateMediaFile(null);
    setUpdateIsVideo(!!item.is_video);
    setUpdateError('');
    setShowUpdate(true);
  };

  // Khi chọn file mới trong update
  const handleUpdateMediaFileChange = (e) => {
    const file = e.target.files[0];
    setUpdateMediaFile(file);
    if (file) {
      setUpdateIsVideo(file.type.startsWith('video'));
    } else {
      setUpdateIsVideo(false);
    }
  };

  // Gửi API update
  const handleUpdate = async () => {
    if (!updateForm.title || !updateForm.content) {
      setUpdateError(t('requiredFields'));
      return;
    }
    setUpdating(true);
    setUpdateError('');
    try {
      const formData = new FormData();
      formData.append('id', updateForm.id);
      formData.append('title', updateForm.title);
      formData.append('content', updateForm.content);
      formData.append('is_event', updateForm.is_event);
      formData.append('is_public', updateForm.is_public);
      formData.append('is_video', updateIsVideo);
      if (updateMediaFile) {
        formData.append('media', updateMediaFile);
      }
      formData.append('user_id', updateForm.user_id);
      formData.append('position', updateForm.position);
      formData.append('date', updateForm.date);
      const res = await axios.post(`${API_BASE}${UPDATE}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setShowUpdate(false);
        setUpdateForm(defaultForm);
        setUpdateMediaFile(null);
        setUpdateIsVideo(false);
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

  return (
    <div className="bg-light min-vh-100 p-4">
      <h2 className="fw-bold mb-3" style={{ color: '#1a7f37' }}>
        {t('information')}
      </h2>
      <CCard className="shadow-sm rounded-4">
        <CCardHeader className="bg-white border-0 px-4 py-4 rounded-top-4 d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">{t('information')}</h5>
          <CButton color="success" className="fw-bold px-4 py-2 rounded-3" onClick={() => setShowCreate(true)}>
            + {t('add')}
          </CButton>
        </CCardHeader>
        <CCardBody>
          {/* FILTER UI */}
          {/* Ẩn filter khi là admin, chỉ lấy theo quyền */}
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
              <CCol xs={12} md={4} className="d-flex align-items-center gap-2">
                <CFormLabel className="mb-0">{t('status')}</CFormLabel>
                <CFormSwitch
                  label={t('active')}
                  checked={filter.is_public === 'true'}
                  onChange={e => setFilter(f => ({ ...f, is_public: e.target.checked ? 'true' : '' }))}
                />
              </CCol>
              <CCol xs={12} md={4} className="text-end"></CCol>
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
                    <CTableHeaderCell>{t('title')}</CTableHeaderCell>
                    <CTableHeaderCell>{t('content')}</CTableHeaderCell>
                    <CTableHeaderCell>{t('date')}</CTableHeaderCell>
                    <CTableHeaderCell>{t('employee')}</CTableHeaderCell>
                    <CTableHeaderCell>{t('position')}</CTableHeaderCell>
                    <CTableHeaderCell>{t('status')}</CTableHeaderCell>
                    <CTableHeaderCell>Media</CTableHeaderCell>
                    <CTableHeaderCell>{t('actions')}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {list.map((item) => {
                    return (
                      <CTableRow key={item.id}>
                        <CTableDataCell>{item.title}</CTableDataCell>
                        <CTableDataCell>{item.content}</CTableDataCell>
                        <CTableDataCell>{item.date ? new Date(item.date).toLocaleString() : ''}</CTableDataCell>
                        <CTableDataCell>{item.user?.name || ''}</CTableDataCell>
                        <CTableDataCell>{getPositionLabel(item.position)}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={item.is_public ? 'success' : 'secondary'}>
                            {item.is_public ? t('active') : t('inactive')}
                          </CBadge>
                          {item.is_event && <CBadge color="info" className="ms-2">{t('events')}</CBadge>}
                        </CTableDataCell>
                        <CTableDataCell>
                          {item.media ? (
                            item.is_video ? (
                              <a href={item.media} target="_blank" rel="noopener noreferrer">Video</a>
                            ) : (
                              <img src={item.media} alt="media" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                            )
                          ) : (
                            '-'
                          )}
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
                    );
                  })}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal tạo mới */}
      <CModal visible={showCreate} onClose={() => setShowCreate(false)} alignment="center" backdrop="static">
        <CModalHeader>{t('add')} {t('information')}</CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12}>
              <CFormLabel>{t('title')}</CFormLabel>
              <CFormInput value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </CCol>
            <CCol xs={12}>
              <CFormLabel>{t('content')}</CFormLabel>
              <CFormTextarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={3} />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>Media</CFormLabel>
              <CFormInput type="file" accept="image/*,video/*" onChange={handleMediaFileChange} />
              {mediaFile && (
                <div className="mt-2">
                  {mediaFile.type.startsWith('image') ? (
                    <img
                      src={URL.createObjectURL(mediaFile)}
                      alt="preview"
                      style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }}
                    />
                  ) : mediaFile.type.startsWith('video') ? (
                    <video
                      src={URL.createObjectURL(mediaFile)}
                      controls
                      style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }}
                    />
                  ) : null}
                </div>
              )}
            </CCol>
            <CCol xs={12} className="d-flex align-items-center gap-3">
              <CFormSwitch label={t('events')} checked={form.is_event} onChange={e => setForm(f => ({ ...f, is_event: e.target.checked }))} />
              <CFormSwitch label={t('active')} checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} />
            </CCol>
            {error && <CCol xs={12}><div className="text-danger small">{error}</div></CCol>}
            <CCol xs={12} className="d-flex justify-content-end gap-2">
              <CButton color="secondary" variant="outline" onClick={() => setShowCreate(false)}>
                {t('cancel')}
              </CButton>
              <CButton color="success" disabled={creating} onClick={handleCreate}>
                {creating ? <CSpinner size="sm" /> : t('add')}
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Modal chi tiết */}
      <CModal visible={showDetail} onClose={() => setShowDetail(false)} alignment="center" backdrop="static">
        <CModalHeader>
          <span style={{ fontWeight: 700, fontSize: 22, color: '#1a7f37' }}>{t('information')} {t('detail') || 'Detail'}</span>
        </CModalHeader>
        <CModalBody>
          {detail ? (
            <div className="d-flex flex-column align-items-center p-3" style={{ minWidth: 340 }}>
              <div className="mb-3 text-center" style={{ fontWeight: 700, fontSize: 22, color: '#222' }}>{detail.title}</div>
              <div className="mb-3 w-100 text-center text-secondary" style={{ fontSize: 17, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{detail.content}</div>
              <div className="mb-4 d-flex gap-3 align-items-center justify-content-center">
                <CBadge color={detail.is_public ? 'success' : 'secondary'} style={{ fontSize: 16, padding: '10px 22px', borderRadius: 18, letterSpacing: 1 }}>
                  {detail.is_public ? t('active') : t('inactive')}
                </CBadge>
                {detail.is_event && <CBadge color="info" style={{ fontSize: 16, padding: '10px 22px', borderRadius: 18, letterSpacing: 1 }}>{t('events')}</CBadge>}
              </div>
              {detail.media && (
                <div className="mb-2">
                  {detail.is_video ? (
                    <video
                      src={detail.media}
                      controls
                      style={{ maxWidth: 360, maxHeight: 220, borderRadius: 14, border: '1px solid #eee', boxShadow: '0 2px 12px #0001' }}
                    />
                  ) : (
                    <img
                      src={detail.media}
                      alt="media"
                      style={{ maxWidth: 260, maxHeight: 260, borderRadius: 14, border: '1px solid #eee', boxShadow: '0 2px 12px #0001' }}
                    />
                  )}
                </div>
              )}
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

      {/* Modal xác nhận xóa */}
      <CModal visible={!!deleteId} onClose={() => setDeleteId(null)} alignment="center" backdrop="static">
        <CModalHeader>{t('delete')}</CModalHeader>
        <CModalBody>{t('deleteUserConfirm') || 'Bạn có chắc chắn muốn xóa thông báo này?'}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteId(null)}>
            {t('cancel')}
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CSpinner size="sm" /> : t('delete')}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal update */}
      <CModal visible={showUpdate} onClose={() => setShowUpdate(false)} alignment="center" backdrop="static">
        <CModalHeader>{t('update')} {t('information')}</CModalHeader>
        <CModalBody>
          <CRow className="g-3">
            <CCol xs={12}>
              <CFormLabel>{t('title')}</CFormLabel>
              <CFormInput value={updateForm.title} onChange={e => setUpdateForm(f => ({ ...f, title: e.target.value }))} required />
            </CCol>
            <CCol xs={12}>
              <CFormLabel>{t('content')}</CFormLabel>
              <CFormTextarea value={updateForm.content} onChange={e => setUpdateForm(f => ({ ...f, content: e.target.value }))} required rows={3} />
            </CCol>
            <CCol xs={12} md={6}>
              <CFormLabel>Media</CFormLabel>
              <CFormInput type="file" accept="image/*,video/*" onChange={handleUpdateMediaFileChange} />
              {/* Preview media mới nếu có, không thì media cũ */}
              {updateMediaFile ? (
                <div className="mt-2">
                  {updateMediaFile.type.startsWith('image') ? (
                    <img src={URL.createObjectURL(updateMediaFile)} alt="preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} />
                  ) : updateMediaFile.type.startsWith('video') ? (
                    <video src={URL.createObjectURL(updateMediaFile)} controls style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} />
                  ) : null}
                </div>
              ) : updateForm.media ? (
                <div className="mt-2">
                  {updateForm.is_video ? (
                    <video src={updateForm.media} controls style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} />
                  ) : (
                    <img src={updateForm.media} alt="media" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} />
                  )}
                </div>
              ) : null}
            </CCol>
            <CCol xs={12} className="d-flex align-items-center gap-3">
              <CFormSwitch label={t('events')} checked={updateForm.is_event} onChange={e => setUpdateForm(f => ({ ...f, is_event: e.target.checked }))} />
              <CFormSwitch label={t('active')} checked={updateForm.is_public} onChange={e => setUpdateForm(f => ({ ...f, is_public: e.target.checked }))} />
            </CCol>
            {updateError && <CCol xs={12}><div className="text-danger small">{updateError}</div></CCol>}
            <CCol xs={12} className="d-flex justify-content-end gap-2">
              <CButton color="secondary" variant="outline" onClick={() => setShowUpdate(false)}>
                {t('cancel')}
              </CButton>
              <CButton color="warning" disabled={updating} onClick={handleUpdate}>
                {updating ? <CSpinner size="sm" /> : t('update')}
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
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
    </div>
  );
};

export default AdminInformationManagement; 