
# Akademik Personel Başvuru Sistemi

Bu proje, akademik personel (Dr. Öğr. Üyesi, Doçent, Profesör) başvurularını yönetmek için React.js ve Node.js (Express + MongoDB) tabanlı bir tam işlevsel web uygulamasıdır.

---

## 📁 Proje Yapısı

```
ilan-api/
├── ilan-backend/         # Node.js + Express backend
│   ├── models/           # Mongoose modelleri (Aday, Ilan)
│   ├── routes/           # API route dosyaları (aday, juri, yonetici)
│   ├── uploads/          # Yüklenen dosyalar
│   └── index.js          # Ana backend dosyası
├── ilan-frontend/        # React tabanlı kullanıcı arayüzü
│   └── src/
│       └── components/   # AdayPanel, AdminPanel, JuriPanel, YoneticiPanel
```

---

## 🚀 Başlatma Adımları

### 1. Backend (Node.js)

```bash
cd ilan-backend
npm install
node index.js
```

> MongoDB `localhost:27017` bağlantısı ile çalışır.

### 2. Frontend (React)

```bash
cd ilan-frontend
npm install
npm start
```

---

## 🔐 Giriş Bilgileri

| Rol        | Kullanıcı Adı | Şifre  |
|------------|----------------|--------|
| Aday       | Kayıt ile      | -      |
| Admin      | admin          | 1234   |
| Jüri       | juri1, juri2   | abcd   |
| Yönetici   | yonetici       | 1234   |

---

## 🛠️ Kullanılan Teknolojiler

- React.js
- Node.js & Express
- MongoDB & Mongoose
- Multer (dosya yükleme)
- JWT (giriş sistemi)
- PDFKit (başvuru özeti PDF)

---

## 📄 Özellikler

- Aday başvurusu (belge yüklemeli)
- Admin ilan ekleme / silme
- Yönetici puan ortalaması, jüri raporu, başvuru sonucu
- Jüri değerlendirme paneli
- PDF oluşturma
