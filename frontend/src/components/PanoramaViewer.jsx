import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'pannellum/build/pannellum.css';
import 'pannellum/build/pannellum.js';

function PanoramaViewer({ imageUrl, hotspots = [], onHotspotClick, editMode = false, onPanoramaClick, height = '500px', roomNames = {} }) {
  const viewerRef = useRef(null);
  const wrapperRef = useRef(null);
  const containerId = 'panorama-container';
  const { t } = useTranslation();
  const [showRotateHint, setShowRotateHint] = useState(false);

  // Fullscreen 360 rejimida (height==='100vh'), mobil qurilmada ekranni
  // avtomatik gorizontalga aylantirishga harakat qilamiz. Bu faqat ba'zi
  // Android brauzerlarda ishlaydi (iOS Safari bunga ruxsat bermaydi),
  // shuning uchun ishlamasa ham xatoga uchramaydi va foydalanuvchiga
  // "telefonni aylantiring" degan maslahat ko'rsatamiz.
  useEffect(() => {
    const isFullscreenMode = height === '100vh';
    const isPortraitMobile = window.matchMedia('(max-width: 900px) and (orientation: portrait)').matches;

    if (isFullscreenMode && isPortraitMobile) {
      setShowRotateHint(true);
      const hintTimer = setTimeout(() => setShowRotateHint(false), 3500);

      const tryLockLandscape = async () => {
        try {
          if (wrapperRef.current?.requestFullscreen) {
            await wrapperRef.current.requestFullscreen();
          }
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
          }
        } catch (e) {
          // Qo'llab-quvvatlanmasa (masalan iOS) - jimgina o'tkazib yuboramiz
        }
      };
      tryLockLandscape();

      return () => {
        clearTimeout(hintTimer);
        if (screen.orientation && screen.orientation.unlock) {
          try { screen.orientation.unlock(); } catch (e) { /* ignore */ }
        }
      };
    }
  }, [height]);

  useEffect(() => {
    if (!imageUrl) return;

    const pannellumHotspots = hotspots.map((h) => ({
      id: `hotspot-${h.id}`,
      pitch: h.pitch,
      yaw: h.yaw,
      type: 'custom',
      cssClass: 'custom-hotspot',
      createTooltipFunc: (hotSpotDiv) => {
        const displayLabel = h.label || roomNames[h.target_room] || '';
        hotSpotDiv.style.cursor = 'pointer';
        hotSpotDiv.style.display = 'flex';
        hotSpotDiv.style.flexDirection = 'column';
        hotSpotDiv.style.alignItems = 'center';
        hotSpotDiv.innerHTML = `
          <div class="hotspot-marker">➜</div>
          ${displayLabel ? `<div class="hotspot-label">${displayLabel}</div>` : ''}
        `;
        hotSpotDiv.onclick = (e) => {
          e.stopPropagation();
          onHotspotClick && onHotspotClick(h.target_room);
        };
      },
    }));

    viewerRef.current = window.pannellum.viewer(containerId, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      crossOrigin: 'anonymous',
      hotSpots: pannellumHotspots,
    });

    // Mobil brauzerda manzil paneli chiqib/kirib turgani sababli, ekran
    // o'lchami o'zgarganda pannellumga o'zini qayta o'lchashni aytamiz
    const handleResize = () => {
      if (viewerRef.current) {
        viewerRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (editMode && onPanoramaClick) {
      let downX = 0;
      let downY = 0;
      let downEvent = null;

      const handleMouseDown = (e) => {
        downX = e.clientX;
        downY = e.clientY;
        downEvent = e;
      };

      const handleMouseUp = (e) => {
        if (!downEvent) return;
        const movedDistance = Math.hypot(e.clientX - downX, e.clientY - downY);
        if (movedDistance < 5) {
          const coords = viewerRef.current.mouseEventToCoords(downEvent);
          onPanoramaClick({ pitch: coords[0], yaw: coords[1] });
        }
        downEvent = null;
      };

      const container = document.getElementById(containerId);
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseup', handleMouseUp);

      viewerRef.current._cleanupClickHandlers = () => {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
      };
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (viewerRef.current) {
        if (viewerRef.current._cleanupClickHandlers) {
          viewerRef.current._cleanupClickHandlers();
        }
        viewerRef.current.destroy();
      }
    };
  }, [imageUrl, hotspots, onHotspotClick, editMode, onPanoramaClick, roomNames]);

 const mobileSafeHeight = height === '100vh' ? '100dvh' : height;

  return (
    <div ref={wrapperRef}>
      {editMode && (
        <p className="hotspot-hint">
          {t('hotspots.editModeHint')}
        </p>
      )}
      {showRotateHint && (
        <div className="rotate-hint">
          🔄 {t('panorama.rotateHint')}
        </div>
      )}
      <div id={containerId} style={{ width: '100%', height: mobileSafeHeight }} />
    </div>
  );
}

export default PanoramaViewer;