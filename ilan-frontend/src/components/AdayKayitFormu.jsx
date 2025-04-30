import React, { useState } from 'react';

const AdayKayitFormu = ({ onKapat }) => {
    const [tc, setTc] = useState('');
    const [sifre, setSifre] = useState('');
    const [adSoyad, setAdSoyad] = useState('');

    const handleRegister = async () => {
        if (!tc || !sifre || !adSoyad) return alert("Lütfen tüm alanları doldurun!");

        const res = await fetch('http://localhost:5000/api/aday/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tc, sifre, adSoyad }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Kayıt başarılı! Giriş yapabilirsiniz.");
            onKapat();
        } else {
            alert(data.mesaj || "Kayıt başarısız!");
        }
    };

    return (
        <div style={{ marginTop: 20 }}>
            <h3>Aday Kayıt</h3>
            <input
                type="text"
                placeholder="TC Kimlik No"
                value={tc}
                onChange={(e) => setTc(e.target.value)}
            />
            <input
                type="text"
                placeholder="Ad Soyad"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
            />
            <input
                type="password"
                placeholder="Şifre"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
            />
            <button onClick={handleRegister}>Kaydol</button>
            <button onClick={onKapat} style={{ marginLeft: 10 }}>İptal</button>
        </div>
    );
};

export default AdayKayitFormu;
