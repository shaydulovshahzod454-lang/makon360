import { useTranslation } from 'react-i18next';

function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: '🔭', title: t('features.f1Title'), text: t('features.f1Text') },
    { icon: '🧮', title: t('features.f2Title'), text: t('features.f2Text') },
    { icon: '🌐', title: t('features.f3Title'), text: t('features.f3Text') },
    { icon: '✅', title: t('features.f4Title'), text: t('features.f4Text') },
    { icon: '📱', title: t('features.f5Title'), text: t('features.f5Text') },
    { icon: '⚡', title: t('features.f6Title'), text: t('features.f6Text') },
  ];

  const steps = [
    { num: '01', title: t('features.step1Title'), text: t('features.step1Text') },
    { num: '02', title: t('features.step2Title'), text: t('features.step2Text') },
    { num: '03', title: t('features.step3Title'), text: t('features.step3Text') },
  ];

  return (
    <section className="features-section">
      <div className="features-intro">
        <h2>{t('features.introTitle')}</h2>
        <p>{t('features.introText')}</p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>

      <div className="features-steps">
        <h2>{t('features.stepsTitle')}</h2>
        <div className="steps-row">
          {steps.map((s) => (
            <div className="step-item" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;