package com.hotel.servlet;

import com.hotel.dao.DashboardDAO;
import com.hotel.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/dashboard")
public class DashboardServlet extends HttpServlet {

    private final DashboardDAO dao = new DashboardDAO();

    // GET /api/dashboard → إحصائيات عامة
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            JsonUtil.sendResponse(res, dao.getStats());
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }
}
