import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Oddiy (360° bo'lmagan) rasmlar uchun - hotspot kerak emas,
// shunchaki oldinga/orqaga o'tish orqali barcha rasmlarni ko'rish
function RoomCarousel({ rooms }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  if (!rooms || rooms.length === 0) return null;

  const room = rooms[index];
  const goPrev = () => setIndex((i) => (i === 0 ? rooms.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === rooms.length - 1 ? 0 : i + 1));

  return (
    <div className="detail-section fade-up">
      <h4>{t('listingDetail.photosTitle')}</h4>
      <div className="room-carousel">
        <div className="room-carousel-frame">
          <img src={room.panorama_image} alt={room.name} />
          {rooms.length > 1 && (
            <>
              <button className="carousel-nav prev" onClick={goPrev} aria-label="Previous photo">‹</button>
              <button className="carousel-nav next" onClick={goNext} aria-label="Next photo">›</button>
              <span className="carousel-counter">{index + 1} / {rooms.length}</span>
            </>
          )}
        </div>
        <p className="room-carousel-name">{room.name}</p>
        {rooms.length > 1 && (
          <div className="room-carousel-dots">
            {rooms.map((r, i) => (
              <button
                key={r.id}
                className={`room-carousel-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomCarousel;