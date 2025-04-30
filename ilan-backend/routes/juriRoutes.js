const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Aday = require('../models/Aday');
const SECRET = 'monster_super_secret';

// 🔧 Multer: Rapor yükleme için
const upload = multer({
    dest: 'uploads/raporlar/',
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ✅ Jüri değerlendirmesi gönderme (rapor, puan, karar)
router.post('/degerlendir', upload.single('rapor'), async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ mesaj: 'Token eksik' });

    try {
        const decoded = jwt.verify(token, SECRET);
        if (decoded.rol !== 'juri') {
            return res.status(403).json({ mesaj: 'Yetkisiz erişim' });
        }

        const { tc, ilanId, puan, karar } = req.body;
        const raporYolu = req.file?.path;

        const aday = await Aday.findOne({ tc });
        if (!aday) return res.status(404).json({ mesaj: 'Aday bulunamadı' });

        const basvuru = aday.basvurular.find(b => b.ilanId === ilanId);
        if (!basvuru) return res.status(404).json({ mesaj: 'İlan başvurusu bulunamadı' });

        if (!basvuru.juriDegerlendirmeleri) {
            basvuru.juriDegerlendirmeleri = [];
        }

        // Aynı jüriden varsa güncelle, yoksa ekle
        const mevcut = basvuru.juriDegerlendirmeleri.find(j => j.juriUsername === decoded.username);
        if (mevcut) {
            mevcut.puan = parseInt(puan);
            mevcut.karar = karar;
            mevcut.raporDosyasi = raporYolu;
        } else {
            basvuru.juriDegerlendirmeleri.push({
                juriUsername: decoded.username,
                puan: parseInt(puan),
                karar,
                raporDosyasi: raporYolu,
            });
        }

        await aday.save();
        res.json({ mesaj: 'Değerlendirme kaydedildi' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

module.exports = router;
