# 🏨 Hotel Management System

## Tech Stack
- **Backend:** Jakarta EE 10 (Servlets) + JDBC + MySQL
- **Frontend:** React 18 + React Router + Recharts
- **Build:** Maven (backend) / npm (frontend)

---

## ⚡ إعداد المشروع

### 1. قاعدة البيانات
```bash
mysql -u root -p < hotel_db.sql
```

### 2. Backend
```bash
cd hotel-backend

# عدّل كلمة المرور في:
# src/main/java/com/hotel/util/DBConnection.java
# السطر: private static final String PASSWORD = "your_password";

mvn clean package
# انسخ الـ WAR إلى WildFly أو Tomcat
cp target/hotel-backend-1.0-SNAPSHOT.war $WILDFLY_HOME/standalone/deployments/
```

### 3. Frontend
```bash
cd hotel-frontend
npm install
npm start
# يفتح على http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET    | /api/rooms | كل الغرف |
| GET    | /api/rooms/available | الغرف المتاحة |
| POST   | /api/rooms | إضافة غرفة |
| PUT    | /api/rooms/{id} | تعديل غرفة |
| DELETE | /api/rooms/{id} | حذف غرفة |
| GET    | /api/clients | كل العملاء |
| GET    | /api/clients?q=name | بحث |
| POST   | /api/clients | إضافة عميل |
| PUT    | /api/clients/{id} | تعديل عميل |
| DELETE | /api/clients/{id} | حذف عميل |
| GET    | /api/reservations | كل الحجوزات |
| GET    | /api/reservations/today | حجوزات اليوم |
| POST   | /api/reservations | حجز جديد |
| POST   | /api/reservations/{id}/cancel | إلغاء |
| POST   | /api/reservations/{id}/checkin | تسجيل دخول |
| POST   | /api/reservations/{id}/checkout | تسجيل خروج |
| GET    | /api/dashboard | إحصائيات |

---

## 📁 هيكل المشروع

```
hotel-management/
├── hotel-backend/
│   ├── pom.xml
│   ├── hotel_db.sql
│   └── src/main/java/com/hotel/
│       ├── model/        Room, Client, Reservation
│       ├── dao/          RoomDAO, ClientDAO, ReservationDAO, DashboardDAO
│       ├── servlet/      RoomServlet, ClientServlet, ReservationServlet, DashboardServlet
│       ├── filter/       CorsFilter
│       └── util/         DBConnection, JsonUtil
│
└── hotel-frontend/
    └── src/
        ├── services/     api.js
        ├── styles/       global.css
        └── components/
            ├── shared/   Sidebar
            ├── Dashboard/
            ├── Rooms/
            ├── Clients/
            └── Reservations/
```
