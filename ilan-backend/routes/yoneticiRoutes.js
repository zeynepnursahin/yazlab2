const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Aday = require('../models/Aday');

const SECRET = 'monster_super_secret';

//  Middleware
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

//  Tüm aday başvurularını getir
router.get('/tum-basvurular', authMiddleware, async (req, res) => {
    try {
        const adaylar = await Aday.find();
        res.json(adaylar);
    } catch (err) {
        res.status(500).json({ mesaj: 'Sunucu hatası', hata: err.message });
    }
});

module.exports = router;
