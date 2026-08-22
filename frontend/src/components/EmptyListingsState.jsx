import { useTranslation } from 'react-i18next';

const SOCIAL_LINKS = [
  {
    name: 'Telegram',
    url: 'https://t.me/makon360_online',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.9 4.7L18.6 20.3c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.3-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6.3 13.1l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.5 3.5c.9-.3 1.7.2 1.4 1.2z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/makon360.online?igsi=a3d4cXlxYTZ2d2M0',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61592937963333&locale=ru_RU',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.2-1.5 1.5-1.5H16.5V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.5H8V13.5h2.3V21h3.2z" />
      </svg>
    ),
  },
//   {
//     name: 'LinkedIn',
//     url: '#',
//     icon: (
//       <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//         <path d="M6.94 5a2 2 0 11-4-.002 2 2 0 014 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-3.96 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.68-2.91V8.48z" />
//       </svg>
//     ),
//   },
];

function EmptyListingsState() {
  const { t } = useTranslation();

  return (
    <div className="empty-listings">
      <div className="empty-listings-icon">🏠</div>

      <h3>{t('home.emptyTitle')}</h3>

      <p>{t('home.emptySubtitle')}</p>

      <div className="empty-social-row">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="empty-social-btn"
            aria-label={s.name}
            title={s.name}
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

export default EmptyListingsState;