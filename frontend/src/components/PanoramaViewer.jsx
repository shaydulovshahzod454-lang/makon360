import { useEffect, useRef, useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
// pannellum endi bu yerda emas, effect ichida DINAMIK import() orqali
// yuklanadi - shunda uning kodi faqat komponent haqiqatan ekranga
// chiqqanda (masalan e'lon sahifasi ochilganda) yuklab olinadi.

function PanoramaViewer({ imageUrl, hotspots = [], onHotspotClick, editMode = false, onPanoramaClick, height = '500px', roomNames = {} }) {
  const viewerRef = useRef(null);
  const reactId = useId();
  const containerId = `panorama-container-${reactId.replace(/:/g, '')}`;
  const { t } = useTranslation();
  const [showRotateHint, setShowRotateHint] = useState(false);

  // Fullscreen 360 rejimida (height==='100vh'), mobil-portret holatda
  // foydalanuvchiga "telefonni aylantiring" maslahatini ko'rsatamiz.
  // Haqiqiy fullscreen+orientation so'rovi endi ListingDetailPage'da,
  // .fullscreen-360 konteyneri darajasida amalga oshiriladi (shunda
  // yopish tugmasi ham fullscreen ichida qolib, yo'qolib ketmaydi).
  useEffect(() => {
    const isFullscreenMode = height === '100vh';
    const isPortraitMobile = window.matchMedia('(max-width: 900px) and (orientation: portrait)').matches;

    if (isFullscreenMode && isPortraitMobile) {
      setShowRotateHint(true);
      const hintTimer = setTimeout(() => setShowRotateHint(false), 3500);
      return () => clearTimeout(hintTimer);
    }
  }, [height]);

  useEffect(() => {
    if (!imageUrl) return;

    let cancelled = false;
    let handleResize = null;
    let handleMouseDown = null;
    let handleMouseUp = null;
    let container = null;

    async function init() {
      // Pannellum kutubxonasi (JS + CSS) shu yerda, kerak bo'lgandagina yuklanadi
      await Promise.all([
        import('pannellum/build/pannellum.css'),
        import('pannellum/build/pannellum.js'),
      ]);

      if (cancelled) return; // Komponent ulgurmasdan unmount bo'lib qolgan bo'lsa - to'xtatamiz

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
      handleResize = () => {
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

        handleMouseDown = (e) => {
          downX = e.clientX;
          downY = e.clientY;
          downEvent = e;
        };

        handleMouseUp = (e) => {
          if (!downEvent) return;
          const movedDistance = Math.hypot(e.clientX - downX, e.clientY - downY);
          if (movedDistance < 5) {
            const coords = viewerRef.current.mouseEventToCoords(downEvent);
            onPanoramaClick({ pitch: coords[0], yaw: coords[1] });
          }
          downEvent = null;
        };

        container = document.getElementById(containerId);
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mouseup', handleMouseUp);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      }
      if (container && handleMouseDown && handleMouseUp) {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseup', handleMouseUp);
      }
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [imageUrl, hotspots, onHotspotClick, editMode, onPanoramaClick, roomNames]);

 const mobileSafeHeight = height === '100vh' ? '100dvh' : height;

  return (
    <div>
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