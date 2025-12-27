# CareerFlow AI — MVP (Offline Demo)

Bu klasördeki MVP sürüm **backend gerektirmez**. Her şey tarayıcıda çalışır.

## Çalıştırma

- `index.html` dosyasını çift tıklayıp tarayıcıda aç.

> Alternatif: VS Code kullanıyorsan Live Server eklentisiyle de açabilirsin.

## Modüller

- ATS Skoru: CV + Job Description metinlerinden **uyum skoru** üretir, eksik anahtar kelimeleri listeler.
- Skill Gap: Eksik terimlere göre **2 kurs önerisi** üretir.
- Maaş & Pazarlık: Rol/şehir/deneyim/beceri üzerinden **maaş aralığı** ve "maaş beklentisi" cevabı verir.
- Networking: Hedef şirket/rol için **cold message** taslakları.
- Portfolyo Denetimi: Checklist tabanlı hızlı geri bildirim.
- Burnout Takibi: Aylık check-in kayıtlarını tarayıcıda (localStorage) tutar.

## Test senaryosu (30 sn)

1. `ATS Skoru` sekmesine gir.
2. `Örnek Yükle` butonuna bas.
3. `Analiz Et` → skor ve öneriler gelmeli.
4. `Raporu PDF Olarak Kaydet` → tarayıcı yazdır ekranı açılmalı.

## Notlar

- Bu MVP, gerçek bir ATS motorunu birebir simüle etmez; **heuristic** (kural tabanlı) bir "job match" skorudur.
- Sonraki adım: kullanıcı hesabı + gerçek LLM entegrasyonu + video mülakat analizi.
a