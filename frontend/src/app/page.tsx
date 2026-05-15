'use client';
import React from 'react';

import styles from './page.module.css';
import Link from 'next/link';

import { translations, Language } from '@/lib/translations';

export default function Home() {
  const [lang, setLang] = React.useState<Language>('uz');
  const [packages, setPackages] = React.useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const t = translations[lang];

  React.useEffect(() => {
    fetch(`${apiUrl}/api/packages`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((pkg: any) => ({
          ...pkg,
          features: JSON.parse(pkg.features),
          displayPrice: pkg.price.toLocaleString('ru-RU') + " so'm"
        }));
        setPackages(formatted);
      })
      .catch(err => console.error("Error fetching packages:", err));
  }, [apiUrl]);

  return (
    <main className={styles.main}>
      {/* Language Switcher */}
      <div className={styles.langSwitcher}>
        {(['uz', 'ru', 'en'] as Language[]).map(l => (
          <button 
            key={l} 
            className={`${styles.langBtn} ${lang === l ? styles.activeLang : ''}`}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
          <div className={styles.heroButtons}>
            <Link href={`/booking?lang=${lang}`} className={`btn btn-primary`}>{t.bookNow}</Link>
            <Link href={`/check-booking?lang=${lang}`} className={`btn btn-secondary`}>{t.checkBooking}</Link>
            <Link href="#packages" className={`btn btn-secondary`} style={{ border: 'none' }}>{t.details}</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🛡️</div>
          <h3>{t.safety}</h3>
          <p>{t.safetyDesc}</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>👨‍✈️</div>
          <h3>{t.team}</h3>
          <p>{t.teamDesc}</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🎈</div>
          <h3>{t.premium}</h3>
          <p>{t.premiumDesc}</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📸</div>
          <h3>{t.moments}</h3>
          <p>{t.momentsDesc}</p>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className={styles.packagesSection}>
        <h2 className={styles.sectionTitle}>{t.packagesTitle}</h2>
        <div className={styles.packagesGrid} style={{ display: 'flex', justifyContent: 'center' }}>
          {packages.map(pkg => (
            <div key={pkg.id} className={styles.packageCard} style={{ maxWidth: '400px', width: '100%' }}>
              {pkg.isPremium && <div className={styles.premiumBadge}>{t.popular}</div>}
              <div className={styles.packageImage} style={{ backgroundImage: `url(${pkg.image})` }}></div>
              <div className={styles.packageContent}>
                <h3 className={styles.packageTitle}>{pkg.name}</h3>
                <p>🕒 {pkg.duration}</p>
                <ul className={styles.packageFeatures}>
                  {pkg.features.map((f: string, i: number) => <li key={i}>✓ {f}</li>)}
                </ul>
                <div className={styles.packagePrice}>{pkg.displayPrice}</div>
                <Link href={`/booking?package=${pkg.id}&lang=${lang}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>{t.select}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
