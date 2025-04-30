import './App.css';
import React, { useState, useEffect } from 'react';
import LoginPanel from './components/LoginPanel';
import AdayPanel from './components/AdayPanel';
import Basvurularim from './components/Basvurularim';
import AdminPanel from './components/AdminPanel';
import { jwtDecode } from 'jwt-decode';
import JuriPanel from './components/JuriPanel';
import YoneticiPanel from './components/YoneticiPanel';
import IlanEkleFormu from './components/IlanEkleFormu';

function App() {
  const [rol, setRol] = useState(localStorage.getItem('rol') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [adSoyad, setAdSoyad] = useState('');
  const [ilanlar, setIlanlar] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIlanlar = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ilanlar');
      const data = await res.json();
      setIlanlar(Array.isArray(data) ? data : []);
    } catch {
      setIlanlar([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIlanlar();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setRol('');
    setToken('');
    setAdSoyad('');
  };

  const ekleIlan = async (baslik, aciklama, kategori, belgeler, baslangicTarihi, bitisTarihi) => {
    const res = await fetch('http://localhost:5000/api/ilanlar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ baslik, aciklama, kategori, gerekliBelgeler: belgeler, baslangicTarihi, bitisTarihi }),
    });

    if (res.ok) {
      fetchIlanlar();
    } else {
      alert('İlan eklenemedi!');
    }
  };

  const silIlan = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/ilanlar/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      fetchIlanlar();
    } catch {
      alert('İlan silinemedi.');
    }
  };

  const handleBasvuruIptal = async (ilanId) => {
    if (!window.confirm('Başvurunuzu iptal etmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/aday/basvuru-iptal/${ilanId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert('Başvuru iptal edildi.');
        window.location.reload();
      } else {
        alert(data.mesaj || 'İptal işlemi başarısız.');
      }
    } catch (err) {
      alert('Sunucu hatası!');
      console.error(err);
    }
  };

  const handlePdfDownload = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/aday/pdf', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('PDF alınamadı');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'basvuru_ozeti.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF indirilemedi!');
      console.error(err);
    }
  };

  if (!token || !rol) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <LoginPanel
          onLogin={(ad, gelenToken) => {
            const decoded = jwtDecode(gelenToken);
            setAdSoyad(decoded.adSoyad || ad);
            setToken(gelenToken);
            setRol(decoded.rol || 'aday');
            localStorage.setItem('token', gelenToken);
            localStorage.setItem('rol', decoded.rol || 'aday');
          }}
        />
      </div>
    );
  }

  if (rol === 'admin') {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2>🛡️ Hoş geldiniz Admin!</h2>
        <button onClick={handleLogout}>Çıkış Yap</button>
        <hr />
        <IlanEkleFormu ekleIlan={ekleIlan} />
        <h3>📢 Mevcut İlanlar</h3>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : ilanlar.length === 0 ? (
          <p>İlan bulunamadı.</p>
        ) : (
          <ul>
            {ilanlar.map((ilan) => (
              <li key={ilan._id} style={{ marginBottom: '20px' }}>
                <strong>{ilan.baslik}</strong> ({ilan.kategori})<br />
                📅 Başlangıç: {ilan.baslangicTarihi ? new Date(ilan.baslangicTarihi).toLocaleDateString() : 'Belirtilmedi'}<br />
                📅 Bitiş: {ilan.bitisTarihi ? new Date(ilan.bitisTarihi).toLocaleDateString() : 'Belirtilmedi'}<br />
                {ilan.aciklama}
                <br />
                <button onClick={() => silIlan(ilan._id)} style={{ marginTop: '5px', backgroundColor: 'lightcoral' }}>
                  ❌ Sil
                </button>
              </li>
            ))}
          </ul>
        )}
        <hr />
        <AdminPanel token={token} />
      </div>
    );
  }

  if (rol === 'yonetici') {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2>📈 Yönetici Paneli</h2>
        <p>({adSoyad} olarak giriş yaptınız.)</p>
        <button onClick={handleLogout}>Çıkış Yap</button>
        <hr />
        <YoneticiPanel token={token} />
      </div>
    );
  }

  if (rol === 'juri') {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2>🧑‍⚖️ Jüri Paneli</h2>
        <p>({adSoyad} olarak giriş yaptınız.)</p>
        <button onClick={handleLogout}>Çıkış Yap</button>
        <hr />
        <JuriPanel token={token} />
      </div>
    );
  }

  if (rol === 'aday') {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <h2>🎓 Hoş geldin {adSoyad}!</h2>
        <button onClick={handleLogout}>Çıkış Yap</button>
        <hr />
        <AdayPanel token={token} handleBasvuruIptal={handleBasvuruIptal} />
        <hr />
        <Basvurularim token={token} />
        <hr />
        <button onClick={handlePdfDownload}>📄 Başvuru Özeti PDF İndir</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2>Hoş geldin {adSoyad}!</h2>
      <p>({rol} olarak giriş yaptınız.)</p>
      <button onClick={handleLogout}>Çıkış Yap</button>
    </div>
  );
}

export default App;
