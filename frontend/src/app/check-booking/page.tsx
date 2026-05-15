'use client';

import React, { useState } from 'react';
import { apiRequest } from '@/lib/api';
import styles from './page.module.css';

export default function CheckBookingPage() {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSearched(true);
    try {
      const data = await apiRequest(`/api/bookings/check?phone=${encodeURIComponent(phone)}`);
      setBookings(data);
    } catch (err) {
      alert("Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Buyurtmani tekshirish</h1>
        <p className={styles.subtitle}>Telefon raqamingizni kiriting va buyurtmangiz holatini ko'ring</p>
        
        <form onSubmit={handleSearch} className={styles.form}>
          <input 
            type="tel" 
            placeholder="+998 90 123 45 67" 
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" className={styles.btn} disabled={isLoading}>
            {isLoading ? 'Qidirilmoqda...' : 'Qidirish'}
          </button>
        </form>

        {searched && (
          <div className={styles.results}>
            {bookings.length === 0 ? (
              <p className={styles.noResults}>Hech qanday buyurtma topilmadi.</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <span className={styles.bookingId}>ID: {b.id.substring(0,8)}</span>
                    <span className={`${styles.status} ${styles[b.status]}`}>
                      {b.status === 'pending' ? 'Kutilmoqda' : b.status === 'confirmed' ? 'Tasdiqlangan' : 'Bekor qilingan'}
                    </span>
                  </div>
                  <div className={styles.bookingBody}>
                    <p><strong>Xizmat:</strong> {b.package?.name}</p>
                    <p><strong>Sana:</strong> {new Date(b.date).toLocaleDateString('uz-UZ')}</p>
                    <p><strong>Kishi soni:</strong> {b.passengerCount} ta</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
