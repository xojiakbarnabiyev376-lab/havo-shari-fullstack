'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [filter, setFilter] = useState('all'); // all, daily, weekly, monthly
  const [searchTerm, setSearchTerm] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchBookings(savedToken, filter);
    }
  }, [filter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      fetchBookings(data.token, filter);
    } else {
      alert('Xato login yoki parol');
    }
  };

  const fetchBookings = async (authToken: string, currentFilter: string) => {
    const res = await fetch(`${apiUrl}/api/bookings?filter=${currentFilter}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      setBookings(await res.json());
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`${apiUrl}/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchBookings(token!, filter);
  };

  const downloadExcel = () => {
    fetch(`${apiUrl}/api/stats/export?filter=${filter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HavoShari_${filter}_Hisobot.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  const sendToTelegram = async () => {
    const res = await fetch(`${apiUrl}/api/stats/telegram?filter=${filter}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      alert('Hisobot Telegramga yuborildi!');
    } else {
      alert(data.error || 'Xatolik yuz berdi');
    }
  };

  const clearBookings = async () => {
    if (window.confirm("Barcha hisobot va buyurtmalarni butunlay o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi!")) {
      const res = await fetch(`${apiUrl}/api/bookings/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Barcha ma'lumotlar tozalandi!");
        fetchBookings(token!, filter);
      } else {
        alert("Xatolik yuz berdi");
      }
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <form className={styles.loginCard} onSubmit={handleLogin}>
          <h1 className={styles.title}>Admin Panel</h1>
          <div className={styles.formGroup}>
            <input className={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <input className={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className={styles.btn} type="submit">Kirish</button>
        </form>
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => 
    (b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     b.phone.includes(searchTerm) || 
     b.id.includes(searchTerm))
  );

  const totalSum = filteredBookings.reduce((acc, b) => acc + (b.passengerCount * (b.package?.price || 0)), 0);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Buyurtmalar soni',
        data: last7Days.map(date => bookings.filter(b => new Date(b.createdAt).toISOString().startsWith(date)).length),
        backgroundColor: '#f97316',
      }
    ]
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1>Barcha Buyurtmalar</h1>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Qidirish (Ism, Tel, ID)..." 
              className={styles.input} 
              style={{ width: '250px', margin: 0, padding: '0.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              className={styles.select} 
              style={{ width: '150px', margin: 0, padding: '0.5rem' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Barcha vaqt</option>
              <option value="daily">Bugun</option>
              <option value="weekly">Shu hafta</option>
              <option value="monthly">Shu oy</option>
            </select>

            <button className={styles.btn} style={{width: 'auto', background: '#3b82f6'}} onClick={sendToTelegram}>
              📤 Telegramga
            </button>
            <button className={styles.btn} style={{width: 'auto', background: '#16a34a'}} onClick={downloadExcel}>
              📊 Excelga
            </button>
            <button className={styles.btn} style={{width: 'auto', background: '#ef4444'}} onClick={clearBookings}>
              🗑️ Tozalash
            </button>
            <button className={styles.btn} style={{width: 'auto', background: '#64748b'}} onClick={() => {
              localStorage.removeItem('token');
              setToken(null);
            }}>Chiqish</button>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Oxirgi 7 kunlik faollik</h3>
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '10px', color: 'white' }}>
            <h3>Jami buyurtmalar</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{filteredBookings.length} ta</p>
          </div>
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '10px', color: 'white' }}>
            <h3>Jami tushum</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>{totalSum.toLocaleString('ru-RU')} so'm</p>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ism</th>
              <th>Sana</th>
              <th>Telefon</th>
              <th>Xizmat</th>
              <th>Summa</th>
              <th>Chek</th>
              <th>Holati</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id}>
                <td>{b.id.substring(0,8)}</td>
                <td>{b.name || 'Noma\'lum'}</td>
                <td>{new Date(b.date).toLocaleDateString('uz-UZ')}</td>
                <td>{b.phone}</td>
                <td>{b.package?.name} ({b.passengerCount} kishi)</td>
                <td>{(b.passengerCount * (b.package?.price || 0)).toLocaleString('ru-RU')} so'm</td>
                <td>
                  {b.receiptUrl ? (
                    <a href={`${apiUrl}${b.receiptUrl}`} target="_blank" rel="noreferrer" style={{color: 'blue', textDecoration: 'underline'}}>
                      Ko'rish
                    </a>
                  ) : (
                    <span style={{color: '#94a3b8'}}>Yuklanmagan</span>
                  )}
                </td>
                <td>
                  <span className={`${styles.status} ${styles[b.status]}`}>
                    {b.status === 'pending' ? 'Kutilmoqda' : b.status === 'confirmed' ? 'Tasdiqlangan' : 'Bekor qilingan'}
                  </span>
                </td>
                <td>
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(b.id, 'confirmed')} style={{marginRight: 5, color: 'green', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold'}}>Tasdiqlash</button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} style={{color: 'red', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 'bold'}}>Bekor qilish</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
