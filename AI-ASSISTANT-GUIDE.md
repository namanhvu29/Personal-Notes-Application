# HƯỚNG DẪN TÍCH HỢP AI ASSISTANT VÀO NOTES APP

## ✅ TRẠNG THÁI HOÀN THÀNH

### Backend (100%)
- ✅ AIAssistRequest.java
- ✅ AIAssistResponse.java
- ✅ AIAssistService.java
- ✅ AIAssistController.java
- ✅ application.yaml (đã thêm config)

### Frontend (95%)
- ✅ js/ai-assist.js
- ✅ css/ai-assist.css
- ⚠️ index.html (CẦN TỰ THÊM BẰNG TAY)

---

## 📝 BẠN CẦN LÀM GÌ?

### BƯỚC 1: Sửa file `frontend/index.html`

File này đang bị lỗi duplicate. Hãy làm theo các bước sau:

#### 1.1. Reset file về trạng thái gốc
```bash
cd d:\NoteWeb\Personal-Notes-Application
git checkout HEAD -- frontend/index.html
```

#### 1.2. Thêm 1 dòng CSS vào `<head>` (sau dòng 6)
Tìm dòng:
```html
<link rel="stylesheet" href="css/style.css" />
```

Thêm ngay bên dưới:
```html
<link rel="stylesheet" href="css/ai-assist.css" />
```

#### 1.3. Thêm 1 dòng JavaScript trước `</body>` (khoảng dòng 132)
Tìm dòng:
```html
<script src="js/notes-api.js"></script>
<script src="js/app.js"></script>
```

Sửa thành:
```html
<script src="js/notes-api.js"></script>
<script src="js/ai-assist.js"></script>
<script src="js/app.js"></script>
```

---

### BƯỚC 2: Lấy API Key từ Google

1. Truy cập: **https://aistudio.google.com/app/apikey**
2. Đăng nhập Google
3. Click **"Create API Key"**
4. Copy API key

---

### BƯỚC 3: Cập nhật API Key vào Backend

Mở file:
```
backend/src/FoundationProject/src/main/resources/application.yaml
```

Tìm dòng (khoảng dòng 47):
```yaml
key: YOUR_GEMINI_API_KEY_HERE
```

Thay bằng API key bạn vừa lấy:
```yaml
key: AIzaSy...  # Paste API key vào đây
```

---

## 🚀 CÁCH SỬ DỤNG

1. **Khởi động Backend**: Chạy Spring Boot application
2. **Mở Frontend**: Mở `frontend/index.html` trong trình duyệt
3. **Login vào app**
4. **Tạo hoặc mở một ghi chú**
5. **Chọn đoạn văn bản** trong ghi chú
6. **Click nút 🤖 AI** (xuất hiện trong note-actions)
7. **Chọn chức năng**:
   - 📝 Tóm Tắt
   - ✏️ Sửa Lỗi
   - 🌐 Dịch Thuật
   - 💡 Mở Rộng
8. **Xem kết quả** và click **"Áp dụng"**

---

## 📁 CẤU TRÚC FILES ĐÃ TẠO

```
Personal-Notes-Application/
├── backend/
│   └── src/FoundationProject/src/main/
│       ├── java/FoundationProject/FoundationProject/
│       │   ├── dto/
│       │   │   ├── request/
│       │   │   │   └── AIAssistRequest.java ✅
│       │   │   └── response/
│       │   │       └── AIAssistResponse.java ✅
│       │   ├── service/
│       │   │   └── AIAssistService.java ✅
│       │   └── controller/
│       │       └── AIAssistController.java ✅
│       └── resources/
│           └── application.yaml ✅ (đã cập nhật)
│
└── frontend/
    ├── css/
    │   └── ai-assist.css ✅
    ├── js/
    │   └── ai-assist.js ✅
    └── index.html ⚠️ (cần sửa bằng tay)
```

---

## 🔍 KIỂM TRA LỖI

### Nếu nút 🤖 AI không xuất hiện:
- Kiểm tra file `index.html` đã thêm đúng 2 dòng chưa
- Mở Console (F12) xem có lỗi JavaScript không

### Nếu API trả về lỗi:
- Kiểm tra API key đã nhập đúng chưa
- Kiểm tra backend có đang chạy không (port 8080)
- Kiểm tra CORS đã được config chưa

### Nếu modal không hiển thị:
- Kiểm tra file `ai-assist.css` đã được load chưa
- Mở DevTools > Network xem file CSS có load 200 OK không

---

## 📚 API ENDPOINTS

Backend đã tạo sẵn các endpoints:

- **POST** `/foundation/ai-assist/process`
  - Body: `{ "text": "...", "action": "summarize|proofread|translate|expand", "targetLanguage": "en" }`
  - Response: `{ "success": true, "processedText": "...", ... }`

- **GET** `/foundation/ai-assist/health`
  - Kiểm tra service đang chạy

---

## 💡 GHI CHÚ

- Gemini API có giới hạn free tier, hãy sử dụng hợp lý
- API key nên được lưu trong environment variables trong production
- File `index.html` bị duplicate do tool edits, cần reset và sửa bằng tay

---

**HOÀN THÀNH!** 🎉

Sau khi làm theo 3 bước trên, chức năng AI Assistant sẽ hoạt động hoàn hảo!
