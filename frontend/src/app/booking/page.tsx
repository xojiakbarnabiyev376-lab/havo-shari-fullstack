'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

import { translations, Language } from '@/lib/translations';

function BookingForm() {
  const searchParams = useSearchParams();
  const defaultPackageId = searchParams?.get('package') || '1';
  const currentLang = (searchParams?.get('lang') || 'uz') as Language;
  const t = translations[currentLang];

  const [packages, setPackages] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ cardNumber: '', cardHolderInfo: '' });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    passengerCount: '1',
    phone: '',
    packageId: defaultPackageId
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/packages`)
      .then(res => res.json())
      .then(data => setPackages(data));
    
    fetch(`${apiUrl}/api/auth/config`)
      .then(res => res.json())
      .then(data => setConfig(data));
  }, [apiUrl]);

  const selectedPackage = packages.find(p => p.id === formData.packageId);
  const pricePerPerson = selectedPackage ? selectedPackage.price : 300000;
  const totalAmount = parseInt(formData.passengerCount) * pricePerPerson;
  const cardNumber = config.cardNumber || "8600 3004 7788 4762";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    alert(t.copy + "!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert(t.uploadRequired);
      return;
    }

    const phoneRegex = /^\+998\d{9}$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert(t.phoneFormat);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('date', formData.date);
    data.append('passengerCount', formData.passengerCount);
    data.append('phone', formData.phone);
    data.append('packageId', formData.packageId);
    data.append('receipt', file);

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        alert(t.success);
        window.location.href = '/';
      } else {
        alert(t.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      alert(t.serverError);
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.container}>
      <form className={styles.bookingForm} onSubmit={handleSubmit}>
        <h1 className={styles.title}>{t.bookingTitle}</h1>
        
        <div className={styles.formGroup}>
          <label>{t.fullName}</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder={t.fullName}
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t.serviceType}</label>
          <select 
            className={styles.select}
            value={formData.packageId}
            onChange={(e) => setFormData({...formData, packageId: e.target.value})}
          >
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.price.toLocaleString('ru-RU')} so'm)</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>{t.date}</label>
          <input 
            type="date" 
            className={styles.input} 
            required 
            min={today}
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t.passengers}</label>
          <select 
            className={styles.select}
            value={formData.passengerCount}
            onChange={(e) => setFormData({...formData, passengerCount: e.target.value})}
          >
            {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} {t.person}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>{t.phone}</label>
          <input 
            type="tel" 
            className={styles.input} 
            placeholder="+998 90 123 45 67" 
            required 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div className={styles.paymentCard}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
            {t.amount}: <strong style={{ color: 'var(--accent-orange)' }}>{totalAmount.toLocaleString('ru-RU')} so'm</strong>
          </p>
          <div className={styles.cardNumberBox}>
            <span style={{ fontSize: '1.25rem', letterSpacing: '2px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>{cardNumber}</span>
            <button type="button" onClick={copyToClipboard} style={{ background: 'var(--accent-orange)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {t.copy}
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#a8a29e' }}>{config.cardHolderInfo}</p>
        </div>

        <div className={styles.formGroup} style={{ marginTop: '2rem' }}>
          <label>{t.uploadReceipt}</label>
          <div style={{ border: '1px dashed #cbd5e1', padding: '1rem', borderRadius: '10px', background: '#f8fafc' }}>
            <input 
              type="file" 
              accept="image/*,.pdf" 
              required 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className={`btn btn-primary ${styles.submitBtn}`}>
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
