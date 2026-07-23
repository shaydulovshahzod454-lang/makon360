import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

function AddRoomPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [isEntryPoint, setIsEntryPoint] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!image) {
      setError(t('addRoom.imageRequired'));
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('listing', id);
    formData.append('name', name);
    formData.append('panorama_image', image);
    formData.append('is_entry_point', isEntryPoint);

    try {
      const res = await api.post('/rooms/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRooms([...rooms, res.data]);
      setName('');
      setImage(null);
      setIsEntryPoint(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(err);
      setError(t('addRoom.uploadError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page wide fade-up">
      <div className="form-card">
        <h2>{t('addRoom.title')}</h2>
        <p className="subtitle">{t('addRoom.subtitle')}</p>

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div className="form-field">
            <label className="field-label">{t('addRoom.roomName')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label className="field-label">{t('addRoom.panoramaImage')}</label>
            <label className="file-upload" htmlFor="panorama-file">
              <span className="file-upload-btn">📁 {t('addRoom.chooseFile')}</span>
              <span className="file-upload-name">
                {image ? image.name : t('addRoom.noFileChosen')}
              </span>
            </label>
            <input
              id="panorama-file"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setImage(e.target.files[0])}
              className="file-upload-input"
            />
          </div>
          <div className="form-field checkbox-row">
            <input type="checkbox" id="entry-point" checked={isEntryPoint} onChange={(e) => setIsEntryPoint(e.target.checked)} />
            <label htmlFor="entry-point">{t('addRoom.entryPoint')}</label>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting && <span className="btn-spinner" />}
            {t('addRoom.addRoomButton')}
          </button>
        </form>

        {rooms.length > 0 && (
          <>
            <label className="field-label">{t('addRoom.addedRooms')}</label>
            <ul className="added-rooms-list">
              {rooms.map((r) => (
                <li key={r.id}>{r.name} {r.is_entry_point && `· ${t('addRoom.entryPoint')}`}</li>
              ))}
            </ul>
          </>
        )}

        <button onClick={() => navigate(`/listing/${id}/hotspots`)} className="btn btn-secondary" style={{ width: '100%' }} >
          {t('addRoom.nextStep')}
        </button>
      </div>
    </div>
  );
}

export default AddRoomPage;