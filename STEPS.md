# 📋 خطوات استخراج وتجهيز مشروع Real-Time Chat ورفعه إلى GitHub

يوثق هذا الملف كافة الخطوات الهندسية والتقنية التي تم تنفيذها لفصل نظام المحادثات الفورية (Chat) من مشروع العيادة (Frontend + Backend) وتحويله إلى مشروع مستقل بالكامل (Full-Stack Real-Time Chat Application) ورفعه على مستودع GitHub:
👉 **[mohame04d/Real-Time-Chat](https://github.com/mohame04d/Real-Time-Chat)**

---

## 📑 جدول المحتويات
1. [تحليل وفحص ملفات الشات الأصلية](#1-تحليل-وفحص-ملفات-الشات-الأصلية)
2. [استنساخ المستودع الهدف وتنظيفه](#2-استنساخ-المستودع-الهدف-وتنظيفه)
3. [إعادة بناء وتجريد الباك إند (Backend - server/)](#3-إعادة-بناء-وتجريد-الباك-إند-backend---server)
4. [إعادة بناء وتطوير الفرونت إند (Frontend - client/)](#4-إعادة-بناء-وتطوير-الفرونت-إند-frontend---client)
5. [توثيق المشروع (README.md)](#5-توثيق-المشروع-readmemd)
6. [الفحص والتحقق من سلامة الأكواد (Code Verification)](#6-الفحص-والتحقق-من-سلامة-الأكواد-code-verification)
7. [الحفظ والرفع إلى GitHub (Git Commit & Push)](#7-الحفظ-والرفع-إلى-github-git-commit--push)
8. [طريقة تشغيل المشروع محلياً](#8-طريقة-تشغيل-المشروع-محلياً)

---

## 1. تحليل وفحص ملفات الشات الأصلية
تم فحص الكود المصدري في مشروعي العيادة لاستخراج كل ما يتعلق بالـ Real-Time Chat:

* **من مشروع الباك إند (`Backend_dental`):**
  * `server.js` (تهيئة خادم HTTP و Socket.io)
  * `src/config/socket.js` (أحداث الـ Socket مثل joinChat, leaveChat, typing)
  * `src/models/Chat.js` & `Message.js` (مخططات قاعدة البيانات للغرف والرسائل)
  * `src/controllers/chat.controller.js` & `message.controller.js` (منطق إرسال وتعديل وحذف الرسائل)
  * `src/routes/chat.routes.js` & `message.routes.js` (مسارات الـ API المحمية)

* **من مشروع الفرونت إند (`fronted_dental`):**
  * `Chat1PagePatient.jsx` & `Chat1PageDoctor.jsx` (واجهات الشات، كود الاتصال بـ Socket.io-client، وخوارزمية ضغط الصور عبر Canvas API)
  * `Chat1PageDoctor.css` & `Chat1PagePatient.css` (أنماط CSS الخاصة بتصميم المحادثة)

---

## 2. استنساخ المستودع الهدف وتنظيفه
1. تم استنساخ المستودع من GitHub:
   ```bash
   git clone https://github.com/mohame04d/Real-Time-Chat "d:\New folder\Real-Time-Chat"
   ```
2. تم فحص محتوى المستودع القديم، حيث كان يحتوي على مشروع تجريبي قديم يعتمد على EJS فقط.
3. تم تنظيف المجلد وحذف الملفات القديمة بالكامل مع الحفاظ التام على مجلد الإعدادات التاريخية لـ Git (`.git/`).

---

## 3. إعادة بناء وتجريد الباك إند (Backend - `server/`)
تم إنشاء خادم متكامل مبني على **Node.js, Express, Socket.io, MongoDB** مع **تجريد كامل من أي مصطلحات تخص العيادة أو الأطباء**:

1. **تجريد العلاقات:**
   * استبدال حقول `doctorId` و `patientId` بحقل ديناميكي عام:
     ```javascript
     participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
     ```
2. **الموديلز (Models):**
   * `User.js`: الاسم، البريد، كلمة المرور المشفرة بـ bcryptjs، الصورة الرمزية، الحالة، وحالة الاتصال أونلاين/أوفلاين ووقت آخر ظهور.
   * `Chat.js`: غرف الشات 1-on-1، آخر رسالة، وقتها، وعداد الرسائل غير المقروءة (`unreadCounts`).
   * `Message.js`: محتوى الرسالة، المرفقات (Base64)، نوع الملف، وحالة التعديل `isEdited` وحالة القراءة `isRead`.
3. **أحداث الـ Real-Time Socket (`src/config/socket.js`):**
   * حماية اتصال السوكيت بالـ JWT Middleware.
   * إدارة المستخدمين المتصلين لحظياً وبث قائمتهم عبر حدث `getOnlineUsers`.
   * الانضمام والخروج من الغرف (`joinChat`, `leaveChat`).
   * مؤشر جاري الكتابة الحي (`typing` / `userTyping`).
   * مزامنة القراءة اللحظية (`messagesSeen`).
4. **المتحكمات والمسارات (Controllers & Routes):**
   * `auth`: تسجيل حساب جديد، تسجيل دخول، جلب بيانات المستخدم، وتحديث الملف الشخصي.
   * `users`: بحث حي عن أي مستخدم مسجل بالاسم أو الإيميل لبدء محادثة فورية معه.
   * `chats`: جلب قائمة المحادثات، إنشاء محادثة جديدة، وتحديث القراءة.
   * `messages`: إرسال رسالة مع ملف/صورة، جلب الرسائل السابقة، تعديل رسالة، وحذف رسالة.

---

## 4. إعادة بناء وتطوير الفرونت إند (Frontend - `client/`)
تم بناء تطبيق React 18 عصري وسريع بالكامل باستخدام **Vite**:

1. **إدارة الحالة العامة (State Management):**
   * `AuthContext.jsx`: لإدارة تسجيل الدخول، التوكن في `localStorage`، وبيانات الحساب.
   * `SocketContext.jsx`: لربط الـ Socket.io بالتوكن والاستماع اللحظي للمتصلين.
2. **الصفحات (Pages):**
   * `LoginPage.jsx` & `RegisterPage.jsx`: واجهات تسجيل دخول وإنشاء حساب بتصميم Glassmorphism جذاب.
   * `ChatPage.jsx`: الواجهة الرئيسية للشات التي تدير المحادثة النشطة وقائمة الرسائل.
3. **المكونات (Components):**
   * `Sidebar.jsx`: معلومات المستخدم، زر تسجيل الخروج، حقل البحث، زر إنشاء محادثة جديدة (`+ New Chat`)، وقائمة المحادثات مع علامة الأونلاين الخضراء وعداد الرسائل غير المقروءة.
   * `ChatArea.jsx`: ترويسة المحادثة، حالة الطرف الآخر (متصل/غير متصل/يكتب الآن)، قائمة الرسائل مع علامات الصح المزدوجة الزرقاء (✓✓)، وخيارات تعديل وحذف الرسائل.
   * `MessageInput.jsx`: شريط الكتابة، زر إرفاق الملفات مع **ضغط الصور تلقائياً (HTML5 Canvas Compression)** لسرعة النقل، شريط معاينة المرفق أو وضع التعديل، وزر الإرسال.
   * `NewChatModal.jsx`: نافذة منبثقة للبحث عن المستخدمين وبدء محادثة جديدة مع أي شخص بضغطة واحدة.
4. **التصميم العام (`styles/App.css`):**
   * نظام ألوان Dark Mode مريح للعين مبني على درجات الـ Slate والـ Deep Blue.
   * تجاوب كامل مع الهواتف الذكية (Mobile Responsive).

---

## 5. توثيق المشروع (`README.md`)
تم إنشاء ملف `README.md` احترافي باللغة الإنجليزية في المستودع يشمل:
* مميزات المشروع (Key Features).
* البنية البرمجية والتقنيات المستخدمة (Architecture & Tech Stack).
* هيكل المجلدات والملفات (Project Structure).
* دليل التثبيت والتشغيل السريع خطوة بخطوة (Quick Start Guide).
* جدول شامل لجميع أحداث الـ Socket.io وتفاصيلها.

---

## 6. الفحص والتحقق من سلامة الأكواد (Code Verification)
تم إجراء فحص برمجي صارم على جميع ملفات الخادم للتأكد من خلوها تماماً من أي أخطاء لغوية أو نحوية:
```bash
node --check server/server.js
node --check server/src/app.js
node --check server/src/config/socket.js
node --check server/src/models/User.js
node --check server/src/models/Chat.js
node --check server/src/models/Message.js
node --check server/src/controllers/auth.controller.js
node --check server/src/controllers/chat.controller.js
node --check server/src/controllers/message.controller.js
node --check server/src/controllers/user.controller.js
```
✅ **النتيجة:** تم اجتياز الفحص بنجاح بدون أي أخطاء (Exit code: 0).

---

## 7. الحفظ والرفع إلى GitHub (Git Commit & Push)
تم تسجيل التغييرات ورفعها مباشرة إلى المستودع البعيد:
1. إضافة جميع الملفات:
   ```bash
   git add -A
   ```
2. إنشاء الـ Commit:
   ```bash
   git commit -m "feat: complete full-stack real-time chat application (React, Node.js, Socket.io, MongoDB)"
   ```
3. الرفع على الفرع الرئيسي:
   ```bash
   git push origin main
   ```
✅ **النتيجة:** تم الرفع بنجاح `c3548dd..e0860f2 main -> main`.

---

## 8. طريقة تشغيل المشروع محلياً

إذا أردت تجربة المشروع على جهازك في أي وقت:

1. **تثبيت الحزم للطرفين:**
   ```bash
   # من مجلد server
   cd "d:\New folder\Real-Time-Chat\server"
   npm install

   # من مجلد client
   cd "d:\New folder\Real-Time-Chat\client"
   npm install
   ```

2. **تشغيل الخادم (Backend):**
   ```bash
   cd "d:\New folder\Real-Time-Chat\server"
   npm run dev
   ```
   *يعمل على المنفذ: `http://localhost:5000`*

3. **تشغيل واجهة المستخدم (Frontend):**
   ```bash
   cd "d:\New folder\Real-Time-Chat\client"
   npm run dev
   ```
   *يعمل على المنفذ: `http://localhost:5173`*
