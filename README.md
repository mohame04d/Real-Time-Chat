# 💬 Real-Time Chat Application

تطبيق شات جماعي فوري (Real-time Chat) مبني باستخدام **Socket.io** و **Node.js** + **Express**.

### المميزات الرئيسية

- شات جماعي (Group Chat) في الوقت الفعلي
- إشعار صوتي عند وصول رسالة جديدة
- عرض اسم المستخدم عند دخول أو خروج شخص من الشات
- تصميم بسيط و responsive
- دعم إرسال الرسائل بالضغط على زر "Send" أو Enter (يمكن إضافته لاحقًا)
- فصل واضح بين الـ Frontend والـ Backend

---

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js**
- **Express.js**
- **Socket.io** (للـ Real-time communication)

### Frontend
- **HTML5 + CSS3**
- **Vanilla JavaScript**
- **Socket.io Client**

---

## 📁 هيكل المشروع

chat-app/
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── views/
│   └── index.ejs
├── server.js
├── package.json
└── README.md
text---

## 🚀 طريقة التشغيل

### 1. Clone المشروع
```bash
git clone https://github.com/yourusername/real-time-chat-socketio.git
cd real-time-chat-socketio
2. تنصيب الـ Dependencies
Bashnpm install
3. تشغيل السيرفر
Bashnode server.js
أو إذا كنت تستخدم nodemon (موصى به أثناء التطوير):
Bashnpm run dev
4. افتح المتصفح
اذهب إلى: http://localhost:3000
ادخل اسمك عندما يطلب منك، وابدأ الدردشة مع أي شخص آخر مفتوح على نفس الصفحة.
