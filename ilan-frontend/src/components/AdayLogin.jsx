import React, { useState } from 'react';

function AdayLogin({ onLogin }) {
    const [tc, setTc] = useState('');
    const [sifre, setSifre] = useState('');

    const handleLogin = async () => {
        const res = await fetch('http://localhost:5000/api/aday/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tc, sifre })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('adayToken', data.token);
            onLogin(data.adSoyad); // giriş sonrası ana ekrana yönlendirme
        } else {
            alert(data.mesaj || 'Giriş başarısız!');
        }
    };

    return (
        <div className="container">
            <h2>Aday Girişi</h2>
            <input
                type="text"
                placeholder="TC Kimlik No"
                value={tc}
                onChange={(e) => setTc(e.target.value)}
            />
            <input
                type="password"
                placeholder="Şifre"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
            />
            <button onClick={handleLogin}>Giriş Yap</button>
        </div>
    );
}

export default AdayLogin;
