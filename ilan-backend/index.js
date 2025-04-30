const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Ilan = require('./models/Ilan');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET = 'monster_super_secret';

app.use(cors());
app.use(express.json());

// 📁 Belgeler klasörünü public hale getir
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📁 Routes
const adayRoutes = require('./routes/adayRoutes');
const juriRoutes = require('./routes/juriRoutes');
const yoneticiRoutes = require('./routes/yoneticiRoutes');

app.use('/api/aday', adayRoutes);
app.use('/api/juri', juriRoutes);
app.use('/api/yonetici', yoneticiRoutes);

// 🔌 MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/ilan-db')
    .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
    .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));

// 🛡️ Yetki kontrol middleware
function authMiddleware(req, res, next) {
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
}

// 📋 İlanları listele
app.get('/api/ilanlar', async (req, res) => {
    try {
        const ilanlar = await Ilan.find().sort({ createdAt: -1 });
        res.json(ilanlar);
    } catch (err) {
        res.status(500).json({ mesaj: 'Veriler alınamadı' });
    }
});

// ➕ Yeni ilan ekle
app.post('/api/ilanlar', authMiddleware, async (req, res) => {
    const { baslik, aciklama, kategori, gerekliBelgeler, baslangicTarihi, bitisTarihi } = req.body;

    if (!baslik || !aciklama || !kategori || !baslangicTarihi || !bitisTarihi) {
        return res.status(400).json({ mesaj: 'Tüm alanlar zorunludur' });
    }

    try {
        const yeniIlan = new Ilan({
            baslik,
            aciklama,
            kategori,
            gerekliBelgeler,
            baslangicTarihi: new Date(baslangicTarihi),
            bitisTarihi: new Date(bitisTarihi)
        });

        await yeniIlan.save();
        res.status(201).json(yeniIlan);
    } catch (err) {
        res.status(500).json({ mesaj: 'Kayıt başarısız', hata: err.message });
    }
});

// ❌ İlan sil
app.delete('/api/ilanlar/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await Ilan.findByIdAndDelete(id);
        res.json({ mesaj: 'Silindi', id });
    } catch (err) {
        res.status(500).json({ mesaj: 'Silme işlemi başarısız' });
    }
});

// 🔐 Admin login
const adminUser = { username: 'admin', password: '1234' };
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminUser.username && password === adminUser.password) {
        const token = jwt.sign(
            { username, rol: 'admin', adSoyad: 'Admin Yetkili' },
            SECRET, { expiresIn: '2h' }
        );
        return res.json({ token });
    }
    res.status(401).json({ mesaj: 'Geçersiz giriş bilgisi' });
});

// 🔐 Jüri login
const juriUsers = [
    { username: 'juri1', password: 'abcd', adSoyad: 'Jüri Üyesi 1' },
    { username: 'juri2', password: 'abcd', adSoyad: 'Jüri Üyesi 2' },
    { username: 'juri3', password: 'abcd', adSoyad: 'Jüri Üyesi 3' }
];
app.post('/api/juri/login', (req, res) => {
    const { username, password } = req.body;
    const juri = juriUsers.find(j => j.username === username && j.password === password);
    if (juri) {
        const token = jwt.sign(
            { username: juri.username, rol: 'juri', adSoyad: juri.adSoyad },
            SECRET, { expiresIn: '2h' }
        );
        return res.json({ token });
    }
    res.status(401).json({ mesaj: 'Geçersiz jüri giriş bilgisi' });
});

// 🔐 Yönetici login
const yoneticiUser = { username: 'yonetici', password: '1234' };
app.post('/api/yonetici/login', (req, res) => {
    const { username, password } = req.body;
    if (username === yoneticiUser.username && password === yoneticiUser.password) {
        const token = jwt.sign(
            { username, rol: 'yonetici', adSoyad: 'Yönetici' },
            SECRET, { expiresIn: '2h' }
        );
        return res.json({ token });
    }
    res.status(401).json({ mesaj: 'Geçersiz yönetici bilgisi' });
});

// 🚀 Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});
