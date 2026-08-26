import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function GetStartedCarousel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const slides = [
    { icon: '🔭', title: t('getStarted.slide1Title'), text: t('getStarted.slide1Text') },
    { icon: '🧮', title: t('getStarted.slide2Title'), text: t('getStarted.slide2Text') },
    { icon: '🌐', title: t('getStarted.slide3Title'), text: t('getStarted.slide3Text') },
    { icon: '⚡', title: t('getStarted.slide4Title'), text: t('getStarted.slide4Text') },
  ];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  const goTo = (i) => {
    clearInterval(timerRef.current);
    setIndex(i);
  };

  return (
    <div className="get-started-block">
      <div className="get-started-carousel">
        <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s, i) => (
            <div className="carousel-slide" key={i}>
              <div className="carousel-slide-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === index ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="get-started-cta">
        <h2>{t('getStarted.ctaTitle')}</h2>
        <p>{t('getStarted.ctaSubtitle')}</p>
        <button className="btn btn-primary get-started-btn" onClick={() => navigate('/create-listing')}>
          {t('getStarted.ctaButton')} →
        </button>
      </div>
    </div>
  );
}

export default GetStartedCarousel;