# Ургийн салгалт - Системийн өөрчлөлтүүд

## Асуудал
Өмнө нь системийн бүх хүмүүс нэг ургийн гишүүн болж харагдаж байсан. Энэ асуудлыг шийдэхийн тулд бүр ургыг өөрийн `familyId` дээр үндэслэн салгав.

## Шийдэл: familyId систем

### 1. **API өөрчлөлтүүд** (`/api/persons.js`)
- **GET**: `familyId` query параметрээс авч, зөвхөн тухайн ургийн хүмүүсийг авах
  - URL: `/api/persons?familyId=family_1234567890`
- **POST**: Шинэ хүн бүртгэхдээ body дээр `familyId` хаяж хадгалх
- **PUT**: Мэдээлэл засахдээ `familyId` шалгалт хийх (зөвхөн өөрийн ургийн гишүүнийг л засах)
- **DELETE**: Мэдээлэл устгахдээ `familyId` шалгалт хийх

### 2. **Database өөрчлөлтүүд**
- **users collection**: `familyId` нэмэх
- **persons collection**: `familyId` нэмэх (шинээр бүртгэгдэх хүмүүсийн хувьд)

### 3. **Authentication өөрчлөлтүүд**
- **Signup** (`SignUp.jsx`):
  - Ургийн нэр оруулах талбар нэмэх
  - `familyId` үүсгэх: `family_${Date.now()}_${random}`
  - User бүртгэлэхдээ `familyId` хадгалах

- **Login** (`Login.jsx`):
  - JWT token-д `familyId` нэмэх
  - Response-т `familyId` авах
  - localStorage-д `familyId` сохранять

### 4. **Frontend өөрчлөлтүүд**
- **LandingPage.jsx**:
  - localStorage-аас `familyId` авч, GET запросыг дүүргэх
  - `familyId` validation: зөвхөн alphanumeric + underscore/hyphen зөвшөөр
  - Хүчин төгөлдөр биш `familyId`-ний үед localStorage цэвэрлэн дахин нэвтрэх шаардлага

- **RegisterForm.jsx**:
  - Шинэ хүн нэмэхдээ `familyId` body-д оруулах
  - Ургийн гишүүдсийг авахдээ query параметр ашиглах

- **ProfileCard.jsx**:
  - Хүн устгахдээ `familyId` body-д оруулах

### 5. **Encoding сэргэлүүлэх**
- HTTP headers дээр non-ISO-8859-1 үсгүүд байж болохгүй
- Шийдэл:
  - `familyId`-г query параметр ба body дээр ашиглаж headers-д ашигалахгүй
  - Новые `familyId` үүсгэхдээ зөвхөн англи үсгүүд ашиглах

## Миграциона хэрэгтэй зүйлс
1. Хүмүүс монгол үсэгтэй familyId өөрийн хувьд шинэ accounts үүсгэх хэрэгтэй
2. Эсвэл: Хуучин данн дээрх persons collection дээр migration script ажилуулах

## Файлүүд өөрчлөгдсөн
- [ ] `/src/pages/api/signup.js`
- [ ] `/src/pages/api/login.js`
- [ ] `/src/pages/api/persons.js`
- [ ] `/src/pages/components/SignUp.jsx`
- [ ] `/src/pages/components/Login.jsx`
- [ ] `/src/pages/components/LandingPage.jsx`
- [ ] `/src/pages/components/RegisterForm.jsx`
- [ ] `/src/pages/components/ProfileCard.jsx`
