import React, { useState } from 'react';
import AdayKayitFormu from './AdayKayitFormu';
import { jwtDecode } from 'jwt-decode';


const LoginPanel = ({ onLogin }) => {
    const [rol, setRol] = useState('aday');
    const [tc, setTc] = useState('');
    const [kullanici, setKullanici] = useState('');
    const [sifre, setSifre] = useState('');
    const [kayitGoster, setKayitGoster] = useState(false);

    const handleLogin = async () => {
        console.log("🟢 Giriş butonuna tıklandı");

        let url = '';
        let body = {};

        if (rol === 'aday') {
            url = 'http://localhost:5000/api/aday/login';
            body = { tc, sifre };
        } else if (rol === 'admin') {
            url = 'http://localhost:5000/api/login';
            body = { username: kullanici, password: sifre };

        } else if (rol === 'juri') {
            url = 'http://localhost:5000/api/juri/login';
            body = { username: kullanici, password: sifre };
        }
        else if (rol === 'yonetici') {
            url = 'http://localhost:5000/api/yonetici/login';
            body = { username: kullanici, password: sifre };
        }

        else {
            alert('Bu rol henüz aktif değil!');
            return;
        }


        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('rol', rol);

                const decoded = jwtDecode(data.token);
                onLogin(decoded.adSoyad || kullanici, data.token, decoded.rol);

            } else {
                alert(data.mesaj || 'Giriş başarısız!');
            }
        } catch (err) {
            console.error('Giriş hatası:', err);
            alert('Sunucuya ulaşılamıyor.');
        }
    };

    return (
        <div className="container">
            <h2>Giriş Paneli</h2>

            <label>Rol Seç:</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="aday">Aday</option>
                <option value="admin">Admin</option>
                <option value="juri">Jüri</option>
                <option value="yonetici">Yönetici</option>
            </select>

            {rol === 'aday' ? (
                <input
                    type="text"
                    placeholder="TC Kimlik No"
                    value={tc}
                    onChange={(e) => setTc(e.target.value)}
                />
            ) : (
                <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={kullanici}
                    onChange={(e) => setKullanici(e.target.value)}
                />
            )}

            <input
                type="password"
                placeholder="Şifre"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
            />
            <button onClick={handleLogin}>Giriş Yap</button>

            {rol === 'aday' && !kayitGoster && (
                <p>
                    Hesabınız yok mu?{' '}
                    <button onClick={() => setKayitGoster(true)}>Kayıt Ol</button>
                </p>
            )}

            {kayitGoster && <AdayKayitFormu onKapat={() => setKayitGoster(false)} />}
        </div>
    );
};

export default LoginPanel;
