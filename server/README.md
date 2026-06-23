# Authentication Server

Coolify Dashboard için JWT tabanlı kimlik doğrulama sunucusu.

## Kurulum

```bash
npm install
```

## Çalıştırma

```bash
npm run dev
```

## Gerekli Environment Variables

```
PORT=5000
JWT_SECRET=güçlü_bir_secret_key
ADMIN_USERNAME=kullanıcı_adınız
ADMIN_PASSWORD=şifreniz
```

## API Endpoints

**POST** `/api/auth/login` - Giriş yap, JWT token al  
**GET** `/api/auth/verify` - Token doğrula  
**GET** `/api/auth/me` - Kullanıcı bilgisi al
