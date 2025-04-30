import React, { useState } from 'react';

const IlanEkleFormu = ({ ekleIlan }) => {
    const [baslik, setBaslik] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [kategori, setKategori] = useState('Dr');
    const [baslangicTarihi, setBaslangicTarihi] = useState('');
    const [bitisTarihi, setBitisTarihi] = useState('');
    const [belgeler, setBelgeler] = useState([]);
    const [yeniBelge, setYeniBelge] = useState({ ad: '', aciklama: '' });

    const belgeEkle = () => {
        if (!yeniBelge.ad.trim()) {
            alert('Belge adı boş olamaz!');
            return;
        }
        setBelgeler([...belgeler, { ...yeniBelge, zorunlu: true }]); // Artık her belge zorunlu
        setYeniBelge({ ad: '', aciklama: '' });
    };

    const belgeSil = (index) => {
        const guncel = [...belgeler];
        guncel.splice(index, 1);
        setBelgeler(guncel);
    };

    const formuGonder = () => {
        if (!baslik || !aciklama || !baslangicTarihi || !bitisTarihi) {
            alert('Tüm alanları doldurmalısınız.');
            return;
        }

        ekleIlan(baslik, aciklama, kategori, belgeler, baslangicTarihi, bitisTarihi);
        setBaslik('');
        setAciklama('');
        setKategori('Dr');
        setBelgeler([]);
        setBaslangicTarihi('');
        setBitisTarihi('');
    };

    return (
        <div style={{ marginBottom: '30px' }}>
            <h2>📢 İlan Ekle (Admin)</h2>

            <input
                type="text"
                placeholder="Başlık"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                style={{ display: 'block', marginBottom: 10, width: '100%' }}
            />

            <textarea
                placeholder="Açıklama"
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                style={{ display: 'block', marginBottom: 10, width: '100%' }}
            />

            <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                <option value="Dr">Dr</option>
                <option value="Doçent">Doçent</option>
                <option value="Profesör">Profesör</option>
            </select>

            <h4>📅 Başlangıç Tarihi:</h4>
            <input
                type="date"
                value={baslangicTarihi}
                onChange={(e) => setBaslangicTarihi(e.target.value)}
                style={{ marginBottom: 10 }}
            />

            <h4>📅 Bitiş Tarihi:</h4>
            <input
                type="date"
                value={bitisTarihi}
                onChange={(e) => setBitisTarihi(e.target.value)}
                style={{ marginBottom: 20 }}
            />

            <h3>📎 Gerekli Belgeler</h3>

            <input
                type="text"
                placeholder="Belge Adı"
                value={yeniBelge.ad}
                onChange={(e) => setYeniBelge(prev => ({ ...prev, ad: e.target.value }))}
                style={{ marginRight: 10 }}
            />
            <input
                type="text"
                placeholder="Belge Açıklaması"
                value={yeniBelge.aciklama}
                onChange={(e) => setYeniBelge(prev => ({ ...prev, aciklama: e.target.value }))}
                style={{ marginRight: 10 }}
            />
            <button onClick={belgeEkle}>➕ Belge Ekle</button>

            <ul>
                {belgeler.map((belge, i) => (
                    <li key={i}>
                        {belge.ad} - {belge.aciklama}
                        <button onClick={() => belgeSil(i)} style={{ marginLeft: 10 }}>❌ Sil</button>
                    </li>
                ))}
            </ul>

            <button onClick={formuGonder} style={{ marginTop: 20 }}>📤 İlanı Kaydet</button>
        </div>
    );
};

export default IlanEkleFormu;
