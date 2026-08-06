import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

function fmt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function annuity(principal, annualRatePct, months) {
  if (months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function parseUzbekAmount(text) {
  const re = /(\d+(?:[.,]\d+)?)\s*(mlrd|milliard|mln|million|ming)?\s*so['’ʻʼ]?m/i;
  const m = text.match(re);
  if (!m) return null;
  let n = parseFloat(m[1].replace(',', '.'));
  const unit = (m[2] || '').toLowerCase();
  if (unit.startsWith('mlrd') || unit.startsWith('milliard')) n *= 1e9;
  else if (unit.startsWith('mln') || unit.startsWith('million')) n *= 1e6;
  else if (unit.startsWith('ming')) n *= 1e3;
  return n;
}

function parsePercent(text) {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!m) return null;
  return parseFloat(m[1].replace(',', '.'));
}

function CreditCalculatorPage() {
  const { t } = useTranslation();

  const [loan, setLoan] = useState(100000000);
  const [loanMax, setLoanMax] = useState(1000000000);
  const [rate, setRate] = useState(24);
  const [subsidy, setSubsidy] = useState(10);
  const [term, setTerm] = useState(36);

  const [aiText, setAiText] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null); // { type: 'ok'|'err', ... }

  const effSubsidy = Math.min(subsidy, rate);
  const effRate = rate - effSubsidy;

  const fullMonthly = useMemo(() => annuity(loan, rate, term), [loan, rate, term]);
  const effMonthly = useMemo(() => annuity(loan, effRate, term), [loan, effRate, term]);
  const monthlySubsidy = fullMonthly - effMonthly;
  const totalPaidBorrower = effMonthly * term;
  const totalSubsidy = monthlySubsidy * term;
  const totalInterestBorrower = Math.max(totalPaidBorrower - loan, 0);

  const borrowerPct = fullMonthly > 0 ? (effMonthly / fullMonthly) * 100 : 100;
  const subsidyPct = 100 - borrowerPct;

  useEffect(() => {
    if (subsidy > rate) setSubsidy(rate);
  }, [rate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoanInputChange = (val) => {
    const v = parseFloat(val) || 0;
    setLoan(v);
    if (v > loanMax) setLoanMax(Math.ceil((v * 1.1) / 1000000) * 1000000);
  };

  const runAIParse = () => {
    const text = aiText.trim();
    const budget = parseUzbekAmount(text);
    const percent = parsePercent(text);

    if (!text) {
      setAiFeedback({ type: 'err', message: t('calculator.aiEmptyError') });
      return;
    }

    if (budget === null || percent === null) {
      const missing = [];
      if (budget === null) missing.push(t('calculator.aiMissingBudget'));
      if (percent === null) missing.push(t('calculator.aiMissingPercent'));
      setAiFeedback({ type: 'err', message: `${t('calculator.aiParseError')} ${missing.join(', ')}.` });
      return;
    }

    const downPayment = budget * (percent / 100);
    const loanAmount = budget - downPayment;
    const neededMax = Math.ceil((loanAmount * 1.2) / 1000000) * 1000000;

    if (neededMax > loanMax) setLoanMax(neededMax);
    setLoan(Math.round(loanAmount));

    setAiFeedback({
      type: 'ok',
      budget,
      downPayment,
      loanAmount,
      percent,
    });
  };

  return (
    <div className="page-container calc-page fade-up">
      <header className="calc-header">
        <div className="calc-eyebrow">{t('calculator.eyebrow')}</div>
        <h1>{t('calculator.title')}</h1>
        <p>{t('calculator.subtitle')}</p>
      </header>

      {/* AI orqali to'ldirish */}
      <div className="calc-card calc-ai-card">
        <div className="calc-ai-badge">⚡ {t('calculator.aiBadge')}</div>
        <textarea
          className="calc-ai-textarea"
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          placeholder={t('calculator.aiPlaceholder')}
        />
        <div className="calc-ai-controls">
          <div className="calc-ai-hint">{t('calculator.aiHint')}</div>
          <button className="btn btn-primary" onClick={runAIParse}>
            {t('calculator.aiButton')}
          </button>
        </div>
        {aiFeedback && (
          <div className={`calc-ai-feedback ${aiFeedback.type === 'ok' ? 'ok' : 'err'}`}>
            {aiFeedback.type === 'err' ? (
              aiFeedback.message
            ) : (
              <>
                ✓ {t('calculator.aiSuccess')}
                <div className="calc-pill-row">
                  <span className="calc-pill">🏠 {t('calculator.aiHomePrice')}: {fmt(aiFeedback.budget)} {t('calculator.som')}</span>
                  <span className="calc-pill">💳 {t('calculator.aiDownPayment')}: {fmt(aiFeedback.downPayment)} {t('calculator.som')} ({aiFeedback.percent}%)</span>
                  <span className="calc-pill">🏦 {t('calculator.aiLoanAmount')}: {fmt(aiFeedback.loanAmount)} {t('calculator.som')}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="calc-grid">
        {/* Parametrlar */}
        <div className="calc-card">
          <h2>{t('calculator.parameters')}</h2>

          <div className="calc-field">
            <label>
              {t('calculator.loanAmount')}
              <span className="calc-val">{fmt(loan)} {t('calculator.som')}</span>
            </label>
            <input
              type="range"
              min="1000000"
              max={loanMax}
              step="1000000"
              value={loan}
              onChange={(e) => setLoan(parseFloat(e.target.value))}
              className="calc-range"
            />
            <input
              type="number"
              value={loan}
              onChange={(e) => handleLoanInputChange(e.target.value)}
              style={{ marginTop: '12px' }}
            />
          </div>

          <div className="calc-field">
            <label>
              {t('calculator.annualRate')}
              <span className="calc-val">{rate}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="40"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="calc-range"
            />
          </div>

          <div className="calc-field">
            <label>
              {t('calculator.subsidyRate')}
              <span className="calc-val">{effSubsidy}%</span>
            </label>
            <input
              type="range"
              min="0"
              max={rate}
              step="0.5"
              value={effSubsidy}
              onChange={(e) => setSubsidy(parseFloat(e.target.value))}
              className="calc-range"
            />
            <div className="calc-subrow">
              <span>{t('calculator.yourRate')}</span>
              <span>{effRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="calc-field">
            <label>
              {t('calculator.term')}
              <span className="calc-val">{term} {t('calculator.months')}</span>
            </label>
            <input
              type="range"
              min="3"
              max="120"
              step="1"
              value={term}
              onChange={(e) => setTerm(parseInt(e.target.value))}
              className="calc-range"
            />
          </div>
        </div>

        {/* Natija */}
        <div className="calc-card">
          <h2>{t('calculator.result')}</h2>

          <div className="calc-hero-number">
            <div className="calc-label">{t('calculator.monthlyPayment')}</div>
            <div className="calc-amount">
              {fmt(effMonthly)} <small>{t('calculator.som')}</small>
            </div>
          </div>

          <div className="calc-split-label">
            <span><span className="calc-dot gold" /> {t('calculator.youPay')}</span>
            <span><span className="calc-dot silver" /> {t('calculator.statePays')}</span>
          </div>
          <div className="calc-split-bar">
            <div className="calc-seg borrower" style={{ flexBasis: `${borrowerPct}%` }}>
              {effSubsidy > 0 ? `${borrowerPct.toFixed(0)}%` : '100%'}
            </div>
            <div className="calc-seg subsidy" style={{ flexBasis: `${subsidyPct}%` }}>
              {subsidyPct > 4 ? `${subsidyPct.toFixed(0)}%` : ''}
            </div>
          </div>

          <div className="calc-rows">
            <div className="calc-rowitem">
              <span className="k">{t('calculator.fullPayment')}</span>
              <span className="v">{fmt(fullMonthly)} {t('calculator.som')}</span>
            </div>
            <div className="calc-rowitem">
              <span className="k">{t('calculator.monthlySubsidy')}</span>
              <span className="v silver">{fmt(monthlySubsidy)} {t('calculator.som')}</span>
            </div>
            <div className="calc-rowitem">
              <span className="k">{t('calculator.totalPaid')}</span>
              <span className="v">{fmt(totalPaidBorrower)} {t('calculator.som')}</span>
            </div>
            <div className="calc-rowitem">
              <span className="k">{t('calculator.totalSubsidy')}</span>
              <span className="v silver">{fmt(totalSubsidy)} {t('calculator.som')}</span>
            </div>
            <div className="calc-rowitem">
              <span className="k">{t('calculator.totalInterest')}</span>
              <span className="v gold">{fmt(totalInterestBorrower)} {t('calculator.som')}</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="calc-footer">{t('calculator.footerNote')}</footer>
    </div>
  );
}

export default CreditCalculatorPage;