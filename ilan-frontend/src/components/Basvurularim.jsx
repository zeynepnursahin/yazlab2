import React, { useEffect, useState } from 'react';

const Basvurularim = ({ token }) => {
    const [basvurular, setBasvurular] = useState([]);
    const [hata, setHata] = useState('');

    useEffect(() => {
        const fetchBasvurular = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/aday/basvurularim', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (!res.ok) {
                    setHata(data.mesaj || 'Veri alınamadı');
                    return;
                }
                setBasvurular(data);
            } catch (err) {
                console.error(err);
                setHata('Sunucu hatası');
            }
        };

        fetchBasvurular();
    }, [token]);

    const hesaplaOrtalama = (degerlendirmeler) => {
        if (!degerlendirmeler || degerlendirmeler.length === 0) return null;
        const toplam = degerlendirmeler.reduce((sum, j) => sum + (j.puan || 0), 0);
        return (toplam / degerlendirmeler.length).toFixed(2);
    };

    return (
        <div>
            <h2>📁 Başvurularım</h2>

            {hata ? (
                <p style={{ color: 'red' }}>{hata}</p>
            ) : basvurular.length === 0 ? (
                <p>Henüz başvuru yapılmamış.</p>
            ) : (
                basvurular.map((b, i) => (
                    <div key={i} style={{ marginBottom: '25px', borderBottom: '1px solid #ccc', paddingBottom: 15 }}>
                        <p>📌 <strong>İlan ID:</strong> {b.ilanId}</p>
                        <p>📄 <strong>Durum:</strong> {b.durum}</p>

                        {/* Eğer yönetici karar verdiyse ortalama notu göster */}
                        {b.durum !== 'Beklemede' && b.juriDegerlendirmeleri?.length > 0 && (
                            <p>🏅 <strong>Ortalama Jüri Notu:</strong> {hesaplaOrtalama(b.juriDegerlendirmeleri)}</p>
                        )}

                        {/* Yüklenen belgeler */}
                        <div>
                            <strong>📎 Belgeler:</strong>
                            {b.belgeler && b.belgeler.length > 0 ? (
                                b.belgeler.map((belge, j) => (
                                    <div key={j}>
                                        <a
                                            href={`http://localhost:5000/${belge.replace(/\\/g, '/')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📄 Belge {j + 1}
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p>Belge yüklenmemiş.</p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Basvurularim;
