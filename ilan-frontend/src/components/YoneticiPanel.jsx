import React, { useEffect, useState } from 'react';

const YoneticiPanel = ({ token }) => {
    const [basvurular, setBasvurular] = useState([]);
    const [hata, setHata] = useState('');

    const fetchBasvurular = async () => {
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
    };

    useEffect(() => {
        fetchBasvurular();
    }, [token]);

    const durumGuncelle = async (tc, ilanId, yeniDurum) => {
        try {
            const res = await fetch('http://localhost:5000/api/aday/durum-guncelle', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tc, ilanId, yeniDurum }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Başvuru durumu güncellendi!');
                fetchBasvurular();
            } else {
                alert(data.mesaj);
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası');
        }
    };

    const ortalamaHesapla = (juriDegerlendirmeleri = []) => {
        if (juriDegerlendirmeleri.length === 0) return null;
        const toplam = juriDegerlendirmeleri.reduce((acc, j) => acc + (j.puan || 0), 0);
        return (toplam / juriDegerlendirmeleri.length).toFixed(2);
    };

    return (
        <div>
            <h2>👨‍💼 Yönetici Paneli</h2>

            {hata ? (
                <p style={{ color: 'red' }}>{hata}</p>
            ) : (
                basvurular.map((aday, i) => (
                    <div key={i} style={{ border: '1px dashed #aaa', marginBottom: '30px', padding: '15px' }}>
                        <h3>{aday.adSoyad} - <span style={{ fontWeight: 'normal' }}>{aday.tc}</span></h3>
                        {aday.basvurular.map((b, j) => (
                            <div key={j} style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                <p>📌 <strong>İlan ID:</strong> {b.ilanId}</p>
                                <p>📄 <strong>Durum:</strong> {b.durum}</p>

                                {b.juriDegerlendirmeleri?.length > 0 && (
                                    <>
                                        <p>🏅 <strong>Ortalama Jüri Notu:</strong> {ortalamaHesapla(b.juriDegerlendirmeleri)}</p>
                                        <div style={{ marginBottom: '10px' }}>
                                            <strong>📋 Jüri Değerlendirmeleri:</strong>
                                            <ul>
                                                {b.juriDegerlendirmeleri.map((juri, index) => (
                                                    <li key={index}>
                                                        {juri.juriUsername} → {juri.puan} puan | {juri.karar}
                                                        {juri.raporDosyasi && (
                                                            <> - <a href={`http://localhost:5000/${juri.raporDosyasi.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer">Raporu Görüntüle</a></>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}

                                <div style={{ marginBottom: '10px' }}>
                                    <strong>📎 Belgeler:</strong>
                                    <ul>
                                        {b.belgeler?.map((belge, k) => (
                                            <li key={k}>
                                                <a href={`http://localhost:5000/${belge.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer">Belge {k + 1}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={{ marginTop: '10px' }}>
                                    <button style={{ marginRight: 10, backgroundColor: 'lightgreen' }} onClick={() => durumGuncelle(aday.tc, b.ilanId, 'Kabul Edildi')}>
                                        ✅ Kabul Et
                                    </button>
                                    <button style={{ backgroundColor: 'lightcoral' }} onClick={() => durumGuncelle(aday.tc, b.ilanId, 'Reddedildi')}>
                                        ❌ Reddet
                                    </button>
                                </div>
                                <hr />
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
};

export default YoneticiPanel;
