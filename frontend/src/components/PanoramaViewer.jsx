import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import 'pannellum/build/pannellum.css';
import 'pannellum/build/pannellum.js';

function PanoramaViewer({ imageUrl, hotspots = [], onHotspotClick, editMode = false, onPanoramaClick, height = '500px', roomNames = {} }) {
  const viewerRef = useRef(null);
  const containerId = 'panorama-container';
  const { t } = useTranslation();

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
      hotSpots: pannellumHotspots,
    });

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
      if (viewerRef.current) {
        if (viewerRef.current._cleanupClickHandlers) {
          viewerRef.current._cleanupClickHandlers();
        }
        viewerRef.current.destroy();
      }
    };
  }, [imageUrl, hotspots, onHotspotClick, editMode, onPanoramaClick, roomNames]);

  return (
    <div>
      {editMode && (
        <p className="hotspot-hint">
          {t('hotspots.editModeHint')}
        </p>
      )}
      <div id={containerId} style={{ width: '100%', height }} />
    </div>
  );
}

export default PanoramaViewer;