package com.hotel.servlet;

import com.hotel.dao.ReservationDAO;
import com.hotel.model.Reservation;
import com.hotel.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/reservations/*")
public class ReservationServlet extends HttpServlet {

    private final ReservationDAO dao = new ReservationDAO();

    // GET /api/reservations        → كل الحجوزات
    // GET /api/reservations/today  → حجوزات اليوم
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        try {
            if (path == null || path.equals("/")) {
                JsonUtil.sendResponse(res, dao.findAll());
            } else if (path.equals("/today")) {
                JsonUtil.sendResponse(res, dao.findToday());
            } else {
                JsonUtil.sendError(res, 404, "Endpoint not found");
            }
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // POST /api/reservations           → حجز جديد
    // POST /api/reservations/{id}/cancel    → إلغاء
    // POST /api/reservations/{id}/checkin   → check-in
    // POST /api/reservations/{id}/checkout  → check-out
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        try {
            if (path == null || path.equals("/")) {
                Reservation r = JsonUtil.fromJson(JsonUtil.readBody(req), Reservation.class);
                JsonUtil.sendResponse(res, dao.create(r));
            } else {
                String[] parts = path.split("/");
                // parts: ["", "id", "action"]
                int id     = Integer.parseInt(parts[1]);
                String action = parts.length > 2 ? parts[2] : "";

                boolean ok = switch (action) {
                    case "cancel"   -> dao.cancel(id);
                    case "checkin"  -> dao.checkIn(id);
                    case "checkout" -> dao.checkOut(id);
                    default -> throw new IllegalArgumentException("Unknown action: " + action);
                };

                if (ok) JsonUtil.sendResponse(res, "{\"message\":\"Action '" + action + "' done\"}");
                else    JsonUtil.sendError(res, 400, "Action failed or reservation not found");
            }
        } catch (SQLException e) {
            // تعارض حجز
            if (e.getMessage().startsWith("CONFLICT")) {
                JsonUtil.sendError(res, 409, "Room is already reserved for these dates");
            } else {
                JsonUtil.sendError(res, 500, e.getMessage());
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(res, 400, e.getMessage());
        }
    }
}
