// models/Aday.js
const mongoose = require('mongoose');

const AdaySchema = new mongoose.Schema({
    tc: {
        type: String,
        required: true,
        unique: true,
        length: 11
    },
    sifre: {
        type: String,
        required: true
    },
    adSoyad: {
        type: String,
        required: true
    },
    basvurular: [
        {
            ilanId: String,
            durum: { type: String, default: 'Beklemede' },
            belgeler: [String],
            juriPuani: { type: Number }, // 🆕 Jüri notu (ortalama gibi kullanılabilir)
            juriDegerlendirmeleri: [     // 🆕 Her jüri üyesinin detaylı raporu
                {
                    juriUsername: String,
                    puan: Number,
                    karar: String,
                    raporDosyasi: String
                }
            ]
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Aday', AdaySchema);
