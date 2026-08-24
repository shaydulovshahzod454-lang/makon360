import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PanoramaViewer from '../components/PanoramaViewer';
import { useTranslation } from 'react-i18next';
import PageSpinner from '../components/PageSpinner';

function ManageHotspotsPage() {
  const { id } = useParams(); // listing id
  const { t } = useTranslation();
  const [listing, setListing] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [pendingCoords, setPendingCoords] = useState(null); // {pitch, yaw}
  const [targetRoomId, setTargetRoomId] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadListing = () => {
    api.get(`/listings/${id}/`).then((res) => {
      setListing(res.data);
      if (!currentRoomId) {
        const panoramaRooms = res.data.rooms.filter((r) => r.is_panorama !== false);
        const entryRoom = panoramaRooms.find((r) => r.is_entry_point) || panoramaRooms[0];
        setCurrentRoomId(entryRoom?.id);
      }
    });
  };

  const handlePanoramaClick = useCallback((coords) => {
    setPendingCoords(coords);
    setError('');
  }, []);

  useEffect(() => {
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!listing) return <PageSpinner />;

  const panoramaRooms = listing.rooms.filter((r) => r.is_panorama !== false);
  const currentRoom = panoramaRooms.find((r) => r.id === currentRoomId);
  const otherRooms = panoramaRooms.filter((r) => r.id !== currentRoomId);
  const roomNames = Object.fromEntries(listing.rooms.map((r) => [r.id, r.name]));
  const regularPhotoCount = listing.rooms.length - panoramaRooms.length;

  const handleCreateHotspot = async (e) => {
    e.preventDefault();
    if (!pendingCoords || !targetRoomId) {
      setError(t('hotspots.selectPointError'));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/hotspots/', {
        room: currentRoomId,
        target_room: targetRoomId,
        pitch: pendingCoords.pitch,
        yaw: pendingCoords.yaw,
        label: label,
      });
      setPendingCoords(null);
      setTargetRoomId('');
      setLabel('');
      loadListing(); // yangilangan hotspotlar ro'yxatini olish
    } catch (err) {
      console.error(err);
      setError(t('hotspots.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHotspot = async (hotspotId) => {
    setIsSubmitting(true);
    try {
      await api.delete(`/hotspots/${hotspotId}/`);
      loadListing();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container hotspots-page fade-up" style={{ paddingTop: '32px' }}>
      <h2>{listing.title} — {t('hotspots.title')}</h2>

      {regularPhotoCount > 0 && (
        <p className="hotspot-hint" style={{ marginBottom: '16px' }}>
          ℹ️ {t('hotspots.regularPhotosNote', { count: regularPhotoCount })}
        </p>
      )}

      {panoramaRooms.length === 0 ? (
        <p>{t('hotspots.noPanoramaRooms')}</p>
      ) : (
      <>
      <div className="room-selector">
        <label className="field-label" style={{ marginBottom: 0 }}>{t('hotspots.currentRoom')}:</label>
        <select value={currentRoomId || ''} onChange={(e) => { setCurrentRoomId(Number(e.target.value)); setPendingCoords(null); }} aria-label="Room">
          {panoramaRooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {currentRoom && (
        <div className="panorama-frame">
          <PanoramaViewer
            imageUrl={currentRoom.panorama_image}
            hotspots={currentRoom.hotspots}
            editMode={true}
            onPanoramaClick={handlePanoramaClick}
            roomNames={roomNames}
          />
        </div>
      )}

      {pendingCoords && (
        <form onSubmit={handleCreateHotspot} className="hotspot-form">
          <p style={{ fontSize: '14px' }}>{t('hotspots.markedPoint')}: pitch={pendingCoords.pitch.toFixed(2)}, yaw={pendingCoords.yaw.toFixed(2)}</p>
          <div className="form-field">
            <label className="field-label">{t('hotspots.targetRoom')}</label>
                        <select value={targetRoomId} onChange={(e) => setTargetRoomId(e.target.value)} required aria-label="Target room">
              <option value="">{t('hotspots.chooseRoom')}</option>
              {otherRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="field-label">{t('hotspots.label')}</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting && <span className="btn-spinner" />}
            {t('hotspots.createButton')}
          </button>
        </form>
      )}

      <div style={{ marginTop: '28px' }}>
        <label className="field-label">{t('hotspots.existingHotspots')}</label>
        {currentRoom?.hotspots.length === 0 && <p>{t('hotspots.noHotspots')}</p>}
        <ul className="hotspot-list">
          {currentRoom?.hotspots.map((h) => (
            <li key={h.id}>
              <span>
                {listing.rooms.find((r) => r.id === h.target_room)?.name || t('hotspots.unknownRoom')}
                {' '}<span style={{ color: 'var(--text-muted)' }}>(pitch: {h.pitch.toFixed(1)}, yaw: {h.yaw.toFixed(1)})</span>
              </span>
              <button className="btn btn-danger" onClick={() => handleDeleteHotspot(h.id)}>{t('hotspots.delete')}</button>
            </li>
          ))}
        </ul>
      </div>
      </>
      )}

      <Link to={`/listing/${id}`} className="btn btn-secondary done-link">
        {t('hotspots.done')}
      </Link>
    </div>
  );
}

export default ManageHotspotsPage;