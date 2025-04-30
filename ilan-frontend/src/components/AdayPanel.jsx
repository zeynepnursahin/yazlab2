import React, { useEffect, useState } from 'react';

const AdayPanel = ({ token }) => {
    const [ilanlar, setIlanlar] = useState([]);
    const [yuklenecekBelgeler, setYuklenecekBelgeler] = useState({});
    const [basvurdugumIlanlar, setBasvurdugumIlanlar] = useState([]);
    const [hata, setHata] = useState('');

    const fetchIlanlar = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/ilanlar');
            const data = await res.json();
            setIlanlar(Array.isArray(data) ? data : []);
        } catch (err) {
            setHata('İlanlar getirilemedi');
        }
    };

    const fetchBasvurularim = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/aday/basvurularim', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const idList = data.map(b => b.ilanId);
            setBasvurdugumIlanlar(idList);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchIlanlar();
        fetchBasvurularim();
    }, [token]);

    const handleFileChange = (ilanId, belgeAd, file) => {
        setYuklenecekBelgeler(prev => ({
            ...prev,
            [ilanId]: {
                ...prev[ilanId],
                [belgeAd]: file,
            },
        }));
    };

    const handleBasvuru = async (ilanId, belgelerListesi) => {
        const formData = new FormData();
        for (const belge of belgelerListesi) {
            const file = yuklenecekBelgeler[ilanId]?.[belge.ad];
            if (belge.zorunlu && !file) {
                alert(`Zorunlu belge eksik: ${belge.ad}`);
                return;
            }
            if (file) {
                formData.append('belgeler', file);
            }
        }

        try {
            const res = await fetch(`http://localhost:5000/api/aday/basvuru/${ilanId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                alert('Başvuru başarılı!');
                fetchBasvurularim();
            } else {
                alert(data.mesaj || 'Başvuru başarısız');
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası');
        }
    };

    const handleBasvuruIptal = async (ilanId) => {
        if (!window.confirm('Bu başvuruyu iptal etmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/aday/basvuru-iptal/${ilanId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                alert('Başvuru iptal edildi.');
                fetchBasvurularim();
            } else {
                alert(data.mesaj || 'İptal işlemi başarısız.');
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası');
        }
    };

    const handleBasvuruGuncelle = async (ilanId) => {
        if (!window.confirm('Bu başvuruyu güncellemek istediğinize emin misiniz?')) return;

        const formData = new FormData();
        const belgelerListesi = ilanlar.find(i => i._id === ilanId)?.gerekliBelgeler || [];

        belgelerListesi.forEach((belge) => {
            const file = yuklenecekBelgeler[ilanId]?.[belge.ad];
            if (file) {
                formData.append('belgeler', file);
            }
        });

        try {
            const res = await fetch(`http://localhost:5000/api/aday/basvuru-guncelle/${ilanId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                alert('Başvuru güncellendi.');
                fetchBasvurularim();
            } else {
                alert(data.mesaj || 'Güncelleme başarısız.');
            }
        } catch (err) {
            console.error(err);
            alert('Sunucu hatası');
        }
    };

    return (
        <div>
            <h2>📢 Açık İlanlar</h2>
            {hata && <p style={{ color: 'red' }}>{hata}</p>}
            {ilanlar.length === 0 ? (
                <p>Hiç ilan bulunamadı.</p>
            ) : (
                ilanlar.map((ilan) => {
                    const zatenBasvurdu = basvurdugumIlanlar.includes(ilan._id);
                    return (
                        <div key={ilan._id} style={{ border: '1px solid #ddd', padding: 15, marginBottom: 20 }}>
                            <h3>{ilan.baslik} ({ilan.kategori})</h3>
                            <p>{ilan.aciklama}</p>
                            <p>📅 Başlangıç: {ilan.baslangicTarihi ? new Date(ilan.baslangicTarihi).toLocaleDateString() : 'Yok'}</p>
                            <p>📅 Bitiş: {ilan.bitisTarihi ? new Date(ilan.bitisTarihi).toLocaleDateString() : 'Yok'}</p>

                            {zatenBasvurdu ? (
                                <>
                                    <p style={{ color: 'green' }}>✅ Bu ilana başvurdunuz.</p>

                                    <button
                                        style={{ marginTop: 5, marginRight: 10, backgroundColor: 'lightblue' }}
                                        onClick={() => handleBasvuruGuncelle(ilan._id)}
                                    >
                                        🔄 Başvuruyu Güncelle
                                    </button>
                                    <button
                                        style={{ marginTop: 5, backgroundColor: 'lightcoral' }}
                                        onClick={() => handleBasvuruIptal(ilan._id)}
                                    >
                                        ❌ Başvuruyu İptal Et
                                    </button>

                                    <h4 style={{ marginTop: 10 }}>📎 Güncellenecek Belgeler:</h4>
                                    {ilan.gerekliBelgeler?.map((belge, i) => (
                                        <div key={i} style={{ marginBottom: 10 }}>
                                            <label>{belge.ad}:</label><br />
                                            <small style={{ color: '#777' }}>{belge.aciklama}</small><br />
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.jpg,.png"
                                                onChange={(e) => handleFileChange(ilan._id, belge.ad, e.target.files[0])}
                                            />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <h4>📎 Gerekli Belgeler:</h4>
                                    {ilan.gerekliBelgeler?.map((belge, i) => (
                                        <div key={i} style={{ marginBottom: 10 }}>
                                            <label>{belge.ad} {belge.zorunlu ? '(zorunlu)' : '(opsiyonel)'}:</label><br />
                                            <small style={{ color: '#777' }}>{belge.aciklama}</small><br />
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.jpg,.png"
                                                onChange={(e) => handleFileChange(ilan._id, belge.ad, e.target.files[0])}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        style={{ marginTop: 10 }}
                                        onClick={() => handleBasvuru(ilan._id, ilan.gerekliBelgeler)}
                                    >
                                        📤 Başvuruyu Tamamla
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default AdayPanel;
