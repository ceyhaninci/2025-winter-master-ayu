# Next.js Auth + Search (MySQL 8 / Prisma) — Thesis Lab (Secure)

Bu repo, teziniz için **bilerek zafiyet üretmeden**, SQL injection gibi saldırı sınıflarına karşı
**ölçümlenebilir savunmalar** (input validation, parametreli sorgu/ORM, rate limit, hata maskeleme, logging) içeren
örnek bir Next.js (App Router) uygulamasıdır.

> Not: Kasıtlı SQLi zafiyeti içeren “hazır hedef” üretmek, kötüye kullanılabileceği için önerilmez.
> Bu proje, tezinizde **savunma kontrollerini** aç/kapa senaryolarıyla karşılaştırma yapmanıza yardımcı olacak şekilde tasarlanmıştır.

## Özellikler
- Sayfalar:
  - `/auth/register`
  - `/auth/login`
  - `/search` (auth gerektirir)
- API:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/search`
- MySQL 8 (Docker) + Prisma ORM
- Zod ile input validation
- Basit in-memory rate limiting (tez lab için yeterli; production için Redis önerilir)
- Hata maskeleme (DB detayları sızdırmaz)
- Basit JSON logging (console)

## Kurulum

### 1) MySQL’i başlat
```bash
docker compose up -d
```

Adminer: http://localhost:8080  
- System: MySQL
- Server: mysql
- Username: app
- Password: app_password
- Database: appdb

### 2) .env oluştur
```bash
cp .env.example .env
```

Varsayılan `DATABASE_URL` local çalıştırmaya göredir. Docker container içinden bağlanmak isterseniz host name değişebilir.

### 3) Bağımlılıkları kur
```bash
npm install
```

### 4) Prisma migrate
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5) Uygulamayı çalıştır
```bash
npm run dev
```

## Tezde nasıl kıyas yaparsınız?

Bu projeyi “baseline secure” olarak kullanın. Sonra aşağıdaki kontrolleri **konfigürasyonla**
aç/kapa yaparak ölçüm alabilirsiniz:

Bu repoda tüm savunmalar **ENV flag’leriyle** aç/kapa yapılabilir:

```ini
# Data layer: "prisma" (ORM) or "raw" (mysql2 parameterized queries)
DATA_ACCESS="prisma"

# Security controls
SECURITY_VALIDATION="on"
SECURITY_RATE_LIMIT="on"
SECURITY_ERROR_MASKING="on"
```

Örnek deney setleri (tez bölümü için öneri):

1) **Secure baseline**
   - DATA_ACCESS=prisma
   - SECURITY_VALIDATION=on, SECURITY_RATE_LIMIT=on, SECURITY_ERROR_MASKING=on

2) **ORM + zayıf giriş hijyeni** (sadece input validation kapalı)
   - DATA_ACCESS=prisma
   - SECURITY_VALIDATION=off, SECURITY_RATE_LIMIT=on, SECURITY_ERROR_MASKING=on

3) **Raw SQL ama güvenli (placeholder/parametreli)**
   - DATA_ACCESS=raw
   - SECURITY_VALIDATION=on, SECURITY_RATE_LIMIT=on, SECURITY_ERROR_MASKING=on

4) **Raw SQL + zayıf giriş hijyeni** (validation kapalı)
   - DATA_ACCESS=raw
   - SECURITY_VALIDATION=off, SECURITY_RATE_LIMIT=on, SECURITY_ERROR_MASKING=on

> Not: Bu proje **runnable** şekilde SQL injection zafiyeti üretmez.
> Teziniz için “zafiyetli hedef” gerekiyorsa, bunun yerine OWASP Juice Shop / DVWA gibi eğitim amaçlı zafiyetli uygulamaları
> ayrı bir Docker lab içinde kullanmanız önerilir.

## ORM vs Raw SQL nerede?

Uygulamanın davranışı aynı endpoint’lerde kalır; sadece veri erişim katmanı değişir:

- `lib/data.ts` içinde `DATA_ACCESS=prisma` → Prisma ORM
- `lib/data.ts` içinde `DATA_ACCESS=raw` → `mysql2` ile **parametreli** raw sorgular

Bu sayede tezde “ORM mi, parametreli raw mı” karşılaştırmasını aynı UX ile yapabilirsiniz.

## Veri modeli

- `User`: email + passwordHash
- `SearchLog`: kullanıcı bazlı son aramalar

Prisma schema: `prisma/schema.prisma`

## Güvenlik notları
- Şifreler `bcrypt` ile hashlenir.
- Session: `HS256 JWT` + httpOnly cookie.
- Hata mesajları geneldir (user enumeration azaltılır).
