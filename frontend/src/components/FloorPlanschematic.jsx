import { useTranslation } from 'react-i18next';

// Xona sonini taxminiy "qator x ustun" panjarasiga taqsimlaydi,
// masalan 3 xona -> 2 ustun, 2 qator (oxirgisi yarim bo'sh qoladi)
function computeGrid(count) {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

function FloorPlanSchematic({ roomCount, area }) {
  const { t } = useTranslation();

  if (!roomCount || !area) return null;

  const { cols, rows } = computeGrid(roomCount);
  const areaPerRoom = (area / roomCount).toFixed(1);

  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const gap = 2.5;

  const cells = [];
  for (let i = 0; i < roomCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    cells.push({
      x: col * cellW + gap / 2,
      y: row * cellH + gap / 2,
      w: cellW - gap,
      h: cellH - gap,
      label: `${i + 1}`,
    });
  }

  return (
    <div className="detail-section fade-up">
      <h4>{t('listingDetail.floorPlanTitle')}</h4>
      <div className="floor-plan-wrap">
        <svg viewBox="0 0 100 100" className="floor-plan-svg" preserveAspectRatio="none">
          {cells.map((c, i) => (
            <g key={i}>
              <rect
                x={c.x} y={c.y} width={c.w} height={c.h}
                rx="1.2"
                className="floor-plan-cell"
              />
              <text x={c.x + c.w / 2} y={c.y + c.h / 2} className="floor-plan-cell-label">
                {c.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="floor-plan-caption">
        {t('listingDetail.floorPlanCaption')} {t('listingDetail.area')}: {area} m².
        {' '}({t('listingDetail.floorPlanPerRoom')}: ~{areaPerRoom} m²)
      </p>
    </div>
  );
}

export default FloorPlanSchematic;