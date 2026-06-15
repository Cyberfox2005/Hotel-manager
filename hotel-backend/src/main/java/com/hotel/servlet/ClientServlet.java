package com.hotel.servlet;

import com.hotel.dao.ClientDAO;
import com.hotel.model.Client;
import com.hotel.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/clients/*")
public class ClientServlet extends HttpServlet {

    private final ClientDAO dao = new ClientDAO();

    // GET /api/clients          → كل العملاء
    // GET /api/clients?q=name   → بحث
    // GET /api/clients/{id}     → عميل واحد
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String path    = req.getPathInfo();
        String keyword = req.getParameter("q");
        try {
            if (keyword != null && !keyword.isBlank()) {
                JsonUtil.sendResponse(res, dao.search(keyword));
            } else if (path == null || path.equals("/")) {
                JsonUtil.sendResponse(res, dao.findAll());
            } else {
                int id = Integer.parseInt(path.substring(1));
                Client client = dao.findById(id);
                if (client != null) JsonUtil.sendResponse(res, client);
                else JsonUtil.sendError(res, 404, "Client not found");
            }
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // POST /api/clients → إضافة عميل
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            Client client = JsonUtil.fromJson(JsonUtil.readBody(req), Client.class);
            JsonUtil.sendResponse(res, dao.create(client));
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // PUT /api/clients/{id} → تعديل عميل
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            int id = Integer.parseInt(req.getPathInfo().substring(1));
            Client client = JsonUtil.fromJson(JsonUtil.readBody(req), Client.class);
            client.setId(id);
            if (dao.update(client)) JsonUtil.sendResponse(res, client);
            else JsonUtil.sendError(res, 404, "Client not found");
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }

    // DELETE /api/clients/{id} → حذف عميل
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            int id = Integer.parseInt(req.getPathInfo().substring(1));
            if (dao.delete(id)) JsonUtil.sendResponse(res, "{\"message\":\"Client deleted\"}");
            else JsonUtil.sendError(res, 404, "Client not found");
        } catch (SQLException e) {
            JsonUtil.sendError(res, 500, e.getMessage());
        }
    }
}
