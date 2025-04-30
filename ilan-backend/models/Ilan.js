const mongoose = require('mongoose');

const belgeSchema = new mongoose.Schema({
    ad: String,
    aciklama: String,
    zorunlu: Boolean
});

const ilanSchema = new mongoose.Schema({
    baslik: String,
    aciklama: String,
    kategori: String, // Dr, Doçent, Profesör
    gerekliBelgeler: [belgeSchema],
    baslangicTarihi: Date,
    bitisTarihi: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ilan', ilanSchema);
