import React, { useEffect, useState } from 'react';

const AdminPanel = ({ token }) => {
    const [basvurular, setBasvurular] = useState([]);
    const [hata, setHata] = useState('');

    const fetchBasvurular = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/aday/tum-basvurular', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setHata(data.mesaj || 'Bir hata oluştu');
                return;
            }

            if (!Array.isArray(data)) {
                setHata('Beklenmeyen veri yapısı geldi');
                return;
            }

            setBasvurular(data);
        } catch (err) {
            console.error(err);
            setHata('Sunucuya ulaşılamadı');
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
                alert(`${tc} → ${yeniDurum}`);
                fetchBasvurular(); // Güncellenmiş verileri çek
            } else {
                alert(data.mesaj);
            }
        } catch (err) {
            alert('Durum güncellenemedi');
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Başvurular (Admin Panel)</h2>

            {hata ? (
                <p style={{ color: 'red' }}>⚠️ {hata}</p>
            ) : (
                basvurular.map((aday, i) => (
                    <div key={i} style={{ marginBottom: '30px', borderBottom: '1px solid #ccc' }}>
                        <h3>{aday.adSoyad} ({aday.tc})</h3>
                        {aday.basvurular.map((b, j) => (
                            <div key={j} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                                <p>📌 İlan ID: {b.ilanId}</p>
                                <p>📄 Durum: <strong>{b.durum || 'Beklemede'}</strong></p>
                                <div>
                                    {b.belgeler.map((belge, k) => (
                                        <a
                                            key={k}
                                            href={`http://localhost:5000/${belge.replace('\\', '/')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📎 Belge {k + 1}
                                        </a>
                                    ))}
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <button
                                        style={{ marginRight: 10, backgroundColor: 'lightgreen' }}
                                        onClick={() => durumGuncelle(aday.tc, b.ilanId, 'Kabul Edildi')}
                                    >
                                        ✅ Kabul Et
                                    </button>
                                    <button
                                        style={{ backgroundColor: 'lightcoral' }}
                                        onClick={() => durumGuncelle(aday.tc, b.ilanId, 'Reddedildi')}
                                    >
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

export default AdminPanel;
