package com.hotel.servlet;

import com.hotel.dao.RoomDAO;
import com.hotel.model.Room;
import com.hotel.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/rooms/*")
public class RoomServlet extends HttpServlet {

    private final RoomDAO dao = new RoomDAO();

    // GET /api/rooms        → كل الغرف
    // GET /api/rooms/available → الغرف المتاحة
    // GET /api/rooms/{id}   → غرفة واحدة
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path = req.getPathInfo();
        try {
            if (path == null || path.equals("/")) {
                JsonUtil.sendResponse(res, dao.findAll());
            } else if (path.equals("/available")) {
                String checkIn  = req.getParameter("checkIn");
                String checkOut = req.getParameter("checkOut");
                if (checkIn != null && checkOut != null && !checkIn.isEmpty() && !checkOut.isEmpty()) {
                    JsonUtil.sendResponse(res, dao.findAvailableForDates(
                        java.sql.Date.valueOf(checkIn),
                        java.sql.Date.valueOf(checkOut)
                    ));
                } else {
                    JsonUtil.sendResponse(res, dao.findAvailable());
                }
            } else {
                int id = Integer.parseInt(path.substring(1));
                Room room = dao.findById(id);
                if (room != null) JsonUtil.sendResponse(res, room);
                else JsonUtil.sendError(res, 404, "Room not found");
            }
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // POST /api/rooms → إضافة غرفة
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            Room room = JsonUtil.fromJson(JsonUtil.readBody(req), Room.class);
            JsonUtil.sendResponse(res, dao.create(room));
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // PUT /api/rooms/{id} → تعديل غرفة
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            String path = req.getPathInfo();
            int id = Integer.parseInt(path.substring(1));
            Room room = JsonUtil.fromJson(JsonUtil.readBody(req), Room.class);
            room.setId(id);
            if (dao.update(room)) JsonUtil.sendResponse(res, room);
            else JsonUtil.sendError(res, 404, "Room not found");
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // DELETE /api/rooms/{id} → حذف غرفة
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            int id = Integer.parseInt(req.getPathInfo().substring(1));
            if (dao.delete(id)) JsonUtil.sendResponse(res, "{\"message\":\"Room deleted\"}");
            else JsonUtil.sendError(res, 404, "Room not found");
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }
}
