# 🎓 AI Career Coach

AI destekli kariyer koçluk platformu - Hedeflerinizi netleştirin, yol haritanızı oluşturun, mülakata hazırlanın.

## ⚡ Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
copy .env.example .env

# .env dosyasına Gemini API anahtarını ekle
# GEMINI_API_KEY=your-key-here

# Uygulamayı başlat (otomatik DB kurulumu)
npm run dev
```

Tarayıcıda `http://localhost:3000` açın - **Hepsi bu kadar!** 🎉

## ✨ Özellikler

- 🎯 **Kişisel Kariyer Yol Haritası**: AI ile özel planınız
- 💡 **Yetenek Analizi**: Becerilerinizi takip edin
- 🎤 **Mülakat Simülasyonu**: AI ile pratik yapın ve feedback alın
- 🔒 **Güvenli**: JWT auth, XSS koruması, rate limiting

## 🛠️ Teknoloji

- **Backend**: Node.js + Express + SQLite + Prisma
- **AI**: Google Gemini API
- **Frontend**: Vanilla JavaScript (XSS-safe)
- **Security**: JWT, bcrypt, Helmet, CORS

## 📖 Dokümantasyon

Detaylı kurulum ve kullanım için [SETUP.md](SETUP.md) dosyasına bakın.

## 🔐 Güvenlik

- ✅ JWT authentication (access + refresh tokens)
- ✅ Bcrypt password hashing (12 salt rounds)
- ✅ XSS prevention (textContent only)
- ✅ Rate limiting on all endpoints
- ✅ Input validation & sanitization
- ✅ CORS protection

## 📝 Lisans

MIT

---

**Not**: Geliştirme için SQLite kullanılıyor. Production için PostgreSQL'e geçiş önerilir.