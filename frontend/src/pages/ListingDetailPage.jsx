import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PanoramaViewer from '../components/PanoramaViewer';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authenticated, user } = useAuth();
  const { t } = useTranslation();
  const [listing, setListing] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [show360, setShow360] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}/`).then((res) => {
      setListing(res.data);
      const entryRoom = res.data.rooms.find((r) => r.is_entry_point) || res.data.rooms[0];
      setCurrentRoomId(entryRoom?.id);
    });
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(t('listingDetail.confirmDelete'));
    if (!confirmed) return;

    try {
      await api.delete(`/listings/${id}/`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setDeleteError(t('listingDetail.deleteError'));
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const res = await api.post(`/listings/${id}/toggle_favorite/`);
      setListing((prev) => ({ ...prev, is_favorited: res.data.is_favorited }));
    } catch (err) {
      console.error(err);
    }
  };

  if (!listing) return <p>{t('home.loading')}</p>;

  const currentRoom = listing.rooms.find((r) => r.id === currentRoomId);
  const canManage = user?.is_agent && listing.created_by === user?.id;
  const roomNames = Object.fromEntries(listing.rooms.map((r) => [r.id, r.name]));

  return (
    <div className="page-container" style={{ paddingTop: '32px' }}>
      <div className="detail-header fade-up">
        <div>
          <h1>{listing.title}</h1>
          <p className="address" style={{ margin: 0 }}>{listing.address}</p>
        </div>
        {authenticated && (
          <button
            className="favorite-btn-large"
            onClick={handleToggleFavorite}
            title={listing.is_favorited ? t('home.removeFromFavorites') : t('home.addToFavorites')}
          >
            {listing.is_favorited ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <div className="detail-meta fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="meta-item">
          <div className="label">{t('listingDetail.price')}</div>
          <div className="value price">${listing.price}</div>
        </div>
        <div className="meta-item">
          <div className="label">{t('listingDetail.contact')}</div>
          <div className="value">{listing.contact_phone}</div>
        </div>
      </div>

      <h4 className="fade-up" style={{ animationDelay: '0.13s', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {t('listingDetail.aboutTitle')}
      </h4>
      <p className="fade-up" style={{ animationDelay: '0.15s', fontSize: '16px', maxWidth: '640px' }}>
        {listing.description}
      </p>

      <div className="fade-up" style={{ animationDelay: '0.2s', marginTop: '20px' }}>
        {currentRoom && (
          authenticated ? (
            <div className="panorama-preview">
              <img src={currentRoom.panorama_image} alt={currentRoom.name} />
              <button className="view-360-btn" onClick={() => setShow360(true)}>
                🔄 {t('listingDetail.view360')}
              </button>
            </div>
          ) : (
            <div className="login-gate">
              <p>{t('listingDetail.loginPrompt')}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/register" className="btn btn-primary">{t('listingDetail.register')}</Link>
                <Link to="/login" className="btn btn-secondary" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
                  {t('listingDetail.login')}
                </Link>
              </div>
            </div>
          )
        )}
      </div>

      {listing.amenities.length > 0 && (
        <div className="detail-section fade-up">
          <h4>{t('listingDetail.amenitiesTitle')}</h4>
          <div className="amenity-tags">
            {listing.amenities.map((a) => (
              <span key={a.id} className="amenity-tag">{a.name}</span>
            ))}
          </div>
        </div>
      )}

      {(listing.floor || listing.total_floors || listing.year_built || listing.has_documents || listing.has_gas || listing.has_electricity || listing.has_internet) && (
        <div className="detail-section fade-up">
          <h4>{t('listingDetail.additionalInfoTitle')}</h4>
          <div className="info-grid">
            {(listing.floor || listing.total_floors) && (
              <div className="info-item">
                <div className="label">{t('listingDetail.floor')}</div>
                <div className="value">{listing.floor || '—'}/{listing.total_floors || '—'}</div>
              </div>
            )}
            {listing.year_built && (
              <div className="info-item">
                <div className="label">{t('listingDetail.yearBuilt')}</div>
                <div className="value">{listing.year_built}</div>
              </div>
            )}
            {listing.has_documents && (
              <div className="info-item">
                <div className="label">{t('listingDetail.documentsReady')}</div>
                <div className="value">✓</div>
              </div>
            )}
          </div>
          <div className="utility-tags">
            {listing.has_gas && <span className="utility-tag">{t('listingDetail.gas')}</span>}
            {listing.has_electricity && <span className="utility-tag">{t('listingDetail.electricity')}</span>}
            {listing.has_internet && <span className="utility-tag">{t('listingDetail.internet')}</span>}
          </div>
        </div>
      )}

      {show360 && currentRoom && (
        <div className="fullscreen-360">
          <button className="close-btn" onClick={() => setShow360(false)}>✕</button>
          <PanoramaViewer
            imageUrl={currentRoom.panorama_image}
            hotspots={currentRoom.hotspots}
            onHotspotClick={(targetRoomId) => setCurrentRoomId(targetRoomId)}
            height="100vh"
            roomNames={roomNames}
          />
        </div>
      )}

      {deleteError && <p className="error-text">{deleteError}</p>}

      {canManage && (
        <div className="detail-actions">
          <button className="btn btn-secondary" onClick={() => navigate(`/listing/${id}/edit`)}>
            {t('listingDetail.edit')}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            {t('listingDetail.delete')}
          </button>
        </div>
      )}
    </div>
  );
}

export default ListingDetailPage;