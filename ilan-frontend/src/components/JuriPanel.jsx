import React, { useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const JuriPanel = ({ token }) => {
    const [basvurular, setBasvurular] = useState([]);
    const [hata, setHata] = useState('');
    const [formlar, setFormlar] = useState({}); // ilanId -> { puan, karar, rapor }
    const [juriUsername, setJuriUsername] = useState('');

    const fetchBasvurular = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/aday/tum-basvurular', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                setHata(data.mesaj || 'Bir hata oluştu');
                return;
            }
            setBasvurular(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setHata('Sunucu hatası');
        }
    }, [token]);

    useEffect(() => {
        // Token'dan juri adını çek
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setJuriUsername(decoded.username || '');
            } catch (err) {
                console.error('Token çözümleme hatası:', err);
            }
        }
        fetchBasvurular();
    }, [token, fetchBasvurular]);

    const handleInputChange = (ilanId, field, value) => {
        setFormlar((prev) => ({
            ...prev,
            [ilanId]: {
                ...prev[ilanId],
                [field]: value,
            },
        }));
    };

    const handleDegerlendir = async (tc, ilanId) => {
        const form = formlar[ilanId];
        if (!form || !form.puan || !form.karar || !form.rapor) {
            alert('Tüm alanları doldurmalısınız.');
            return;
        }

        const formData = new FormData();
        formData.append('tc', tc);
        formData.append('ilanId', ilanId);
        formData.append('puan', form.puan);
        formData.append('karar', form.karar);
        formData.append('rapor', form.rapor);

        try {
            const res = await fetch('http://localhost:5000/api/juri/degerlendir', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                alert('Değerlendirme kaydedildi!');
                fetchBasvurular();
            } else {
                alert(data.mesaj);
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası');
        }
    };

    return (
        <div>
            <h2>🧑‍⚖️ Jüri Paneli</h2>

            {hata ? (
                <p style={{ color: 'red' }}>{hata}</p>
            ) : (
                basvurular.map((aday, i) => (
                    <div key={i} style={{ borderBottom: '1px solid #ccc', marginBottom: 30, paddingBottom: 20 }}>
                        <h4>{aday.adSoyad} - {aday.tc}</h4>
                        {aday.basvurular.map((b, j) => (
                            <div key={j} style={{ marginLeft: 20, marginBottom: 20 }}>
                                <p>📌 İlan ID: {b.ilanId}</p>
                                <p>📄 Durum: {b.durum || 'Beklemede'}</p>

                                <div>
                                    <strong>Belgeler:</strong>
                                    {b.belgeler.map((belge, k) => (
                                        <div key={k}>
                                            <a href={`http://localhost:5000/${belge.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer">
                                                📎 Belge {k + 1}
                                            </a>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 10 }}>
                                    <label>🎯 Not: </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formlar[b.ilanId]?.puan || ''}
                                        onChange={(e) => handleInputChange(b.ilanId, 'puan', e.target.value)}
                                    />

                                    <label style={{ marginLeft: 10 }}>🗳️ Karar: </label>
                                    <select
                                        value={formlar[b.ilanId]?.karar || ''}
                                        onChange={(e) => handleInputChange(b.ilanId, 'karar', e.target.value)}
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Olumlu">Olumlu</option>
                                        <option value="Olumsuz">Olumsuz</option>
                                    </select>

                                    <label style={{ marginLeft: 10 }}>📎 Rapor Yükle:</label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleInputChange(b.ilanId, 'rapor', e.target.files[0])}
                                    />

                                    <br />
                                    <button style={{ marginTop: 10 }} onClick={() => handleDegerlendir(aday.tc, b.ilanId)}>
                                        ✅ Değerlendir ve Kaydet
                                    </button>
                                </div>

                                {/* Sadece kendi değerlendirmesini göster */}
                                {b.juriDegerlendirmeleri?.filter(j => j.juriUsername === juriUsername).length > 0 && (
                                    <div style={{ marginTop: 10 }}>
                                        <strong>📊 Senin Önceki Değerlendirmen:</strong>
                                        {b.juriDegerlendirmeleri
                                            .filter(j => j.juriUsername === juriUsername)
                                            .map((j, index) => (
                                                <div key={index}>
                                                    {j.puan} puan | {j.karar}
                                                    <br />
                                                    {j.raporDosyasi && (
                                                        <a href={`http://localhost:5000/${j.raporDosyasi.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer">
                                                            📄 Raporu Gör
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default JuriPanel;
