# AI Career Coach - Kurulum Rehberi

## 🚀 Hızlı Başlangıç

**HİÇBİR VERITABANI KURULUMU GEREKMİYOR!** SQLite kullanıyoruz, her şey otomatik.

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarla

`.env.example` dosyasını `.env` olarak kopyala:

```bash
copy .env.example .env
```

Düzenle ve **sadece Gemini API anahtarını** ekle:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Gemini API Anahtarı Nasıl Alınır:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine git
2. "Create API Key" butonuna tıkla
3. Anahtarı kopyala ve `.env` dosyasına yapıştır

### 3. Uygulamayı Başlat

```bash
npm run dev
```

**İşte bu kadar!** 🎉

- Veritabanı otomatik oluşturulur (`prisma/dev.db`)
- Tablolar otomatik kurulur
- Örnek beceriler (skills) otomatik eklenir
- Uygulama `http://localhost:3000` adresinde çalışmaya başlar

## 📋 Kullanım

1. Tarayıcıda `http://localhost:3000` aç
2. "Kayıt Ol" ile hesap oluştur
3. Dashboard'da kariyer profilini doldur
4. AI ile yol haritası oluştur
5. Mülakat simülasyonu yap

## 🛠️ Veritabanı Yönetimi

Veritabanını görsel olarak yönetmek için:

```bash
npm run prisma:studio
```

Tarayıcıda `http://localhost:5555` açılacak.

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenile
- `POST /api/auth/logout` - Çıkış

### Profil & Beceriler
- `GET /api/users/profile` - Kullanıcı profili
- `GET /api/users/career-profile` - Kariyer profili
- `PUT /api/users/career-profile` - Kariyer profili güncelle
- `GET /api/users/skills` - Beceriler
- `POST /api/users/skills` - Beceri ekle

### Yol Haritası (AI)
- `GET /api/roadmaps` - Yol haritaları
- `POST /api/roadmaps/generate` - AI ile oluştur (rate limited)

### Mülakat (AI)
- `POST /api/interviews/start` - Mülakat başlat (rate limited)
- `POST /api/interviews/:id/answer` - Cevap gönder (rate limited)
- `GET /api/interviews` - Mülakatlar

## 🔒 Güvenlik

✅ JWT (access + refresh tokens)  
✅ Bcrypt (12 salt rounds)  
✅ XSS önleme (sadece textContent)  
✅ Rate limiting (auth: 5/15dk, AI: 20/saat)  
✅ Helmet.js güvenlik başlıkları  
✅ CORS koruması  
✅ Input validation (express-validator)

## ❗ Sorun Giderme

### Port 3000 kullanımda

`.env` dosyasında değiştir:
```env
PORT=3001
```

### Gemini API hatası

- API anahtarını kontrol et
- İnternet bağlantısını kontrol et
- API kotasını kontrol et

### Veritabanı sıfırla

```bash
del prisma\dev.db
npm run dev
```

Yeni, temiz bir veritabanı oluşur.

## 📦 Production

```bash
# NODE_ENV=production ayarla
# Güçlü JWT secrets kullan
# HTTPS kullan
npm start
```

## 🧠 Teknoloji

- **Backend:** Node.js + Express
- **Database:** SQLite + Prisma ORM
- **AI:** Google Gemini API
- **Auth:** JWT + bcrypt
- **Security:** Helmet, CORS, rate-limit
- **Frontend:** Vanilla JS (XSS-safe)

**Not:** Production için PostgreSQL'e geçiş önerilir ama SQLite development için mükemmel!
