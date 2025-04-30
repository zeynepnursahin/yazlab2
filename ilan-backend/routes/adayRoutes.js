const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const Aday = require('../models/Aday');
const SECRET = 'monster_super_secret';

// 📌 authMiddleware tanımı
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ mesaj: 'Token eksik' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ mesaj: 'Token geçersiz' });
    }
};

//  Dosya yükleme (multer)
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

//  Aday Kayıt
router.post('/register', async (req, res) => {
    const { tc, sifre, adSoyad } = req.body;
    if (!tc || !sifre || !adSoyad) {
        return res.status(400).json({ mesaj: 'TC, şifre ve ad soyad gerekli' });
    }

    try {
        const varMi = await Aday.findOne({ tc });
        if (varMi) return res.status(409).json({ mesaj: 'Bu TC ile kayıt zaten var' });

        const yeniAday = new Aday({ tc, sifre, adSoyad });
        await yeniAday.save();
        res.status(201).json({ mesaj: 'Kayıt başarılı' });
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

// Aday Giriş
router.post('/login', async (req, res) => {
    const { tc, sifre } = req.body;
    if (!tc || !sifre) return res.status(400).json({ mesaj: 'TC ve şifre gerekli' });

    try {
        const aday = await Aday.findOne({ tc });
        if (!aday || aday.sifre !== sifre) {
            return res.status(401).json({ mesaj: 'Geçersiz TC veya şifre' });
        }
        const token = jwt.sign({ tc: aday.tc, adSoyad: aday.adSoyad }, SECRET, { expiresIn: '2h' });
        res.json({ token, adSoyad: aday.adSoyad });
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

//  Başvuru Yap
router.post('/basvuru/:ilanId', authMiddleware, upload.array('belgeler'), async (req, res) => {
    const { ilanId } = req.params;
    try {
        const aday = await Aday.findOne({ tc: req.user.tc });
        if (!aday) return res.status(404).json({ mesaj: 'Aday bulunamadı' });

        const belgeler = req.files.map(file => file.path);
        aday.basvurular.push({ ilanId, belgeler, durum: "Beklemede" });
        await aday.save();
        res.json({ mesaj: 'Başvuru başarılı', belgeler });
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

//  routes/adayRoutes.js
router.get('/tum-basvurular', authMiddleware, async (req, res) => {
    try {
        const adaylar = await Aday.find({}, { sifre: 0 }); // şifreyi dışarıda bırak
        res.json(adaylar);
    } catch (err) {
        res.status(500).json({ mesaj: 'Başvurular getirilemedi', hata: err.message });
    }
});


//  Başvuru Güncelle
router.put('/basvuru-guncelle/:ilanId', authMiddleware, upload.array('belgeler'), async (req, res) => {
    const { ilanId } = req.params;
    try {
        const aday = await Aday.findOne({ tc: req.user.tc });
        if (!aday) return res.status(404).json({ mesaj: 'Aday bulunamadı' });

        const basvuru = aday.basvurular.find(b => b.ilanId === ilanId);
        if (!basvuru) return res.status(404).json({ mesaj: 'Başvuru bulunamadı' });

        if (req.files && req.files.length > 0) {
            basvuru.belgeler = req.files.map(file => file.path);
        }

        await aday.save();
        res.json({ mesaj: 'Başvuru güncellendi' });
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

//  Başvuru İptal
router.delete('/basvuru-iptal/:ilanId', authMiddleware, async (req, res) => {
    const { ilanId } = req.params;
    try {
        const aday = await Aday.findOne({ tc: req.user.tc });
        if (!aday) return res.status(404).json({ mesaj: 'Aday bulunamadı' });

        aday.basvurular = aday.basvurular.filter(b => b.ilanId !== ilanId);
        await aday.save();
        res.json({ mesaj: 'Başvuru iptal edildi' });
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

//  Başvurularımı Listele
router.get('/basvurularim', authMiddleware, async (req, res) => {
    try {
        const aday = await Aday.findOne({ tc: req.user.tc });
        if (!aday) return res.status(404).json({ mesaj: 'Aday bulunamadı' });

        res.json(aday.basvurular);
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

//  PDF Başvuru Özeti
router.get('/pdf', authMiddleware, async (req, res) => {
    try {
        const aday = await Aday.findOne({ tc: req.user.tc });
        if (!aday) return res.status(404).json({ mesaj: 'Aday bulunamadı' });

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=basvuru_ozeti.pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Aday Başvuru Özeti', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Ad Soyad: ${aday.adSoyad}`);
        doc.text(`TC: ${aday.tc}`);
        doc.moveDown();

        aday.basvurular.forEach((b, i) => {
            doc.fontSize(13).text(`${i + 1}. Başvuru`, { underline: true });
            doc.fontSize(12).text(`- İlan ID: ${b.ilanId}`);
            doc.text(`- Durum: ${b.durum}`);
            if (b.belgeler.length > 0) {
                doc.text(`- Belgeler:`);
                b.belgeler.forEach((belge, j) => {
                    doc.text(`   • Belge ${j + 1}: ${belge}`);
                });
            }
            doc.moveDown();
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ mesaj: 'PDF oluşturulamadı', hata: err.message });
    }
});

module.exports = router;
