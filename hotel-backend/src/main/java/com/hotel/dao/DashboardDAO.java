package com.hotel.dao;

import com.hotel.util.DBConnection;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class DashboardDAO {

    public Map<String, Object> getStats() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        Map<String, Object> stats = new HashMap<>();

        // إجمالي الغرف
        stats.put("totalRooms",       count("SELECT COUNT(*) FROM rooms"));
        // الغرف المتاحة
        stats.put("availableRooms",   count("SELECT COUNT(*) FROM rooms WHERE status='available'"));
        // الغرف المشغولة
        stats.put("occupiedRooms",    count("SELECT COUNT(*) FROM rooms WHERE status='occupied'"));
        // إجمالي العملاء
        stats.put("totalClients",     count("SELECT COUNT(*) FROM clients"));
        // حجوزات اليوم
        stats.put("todayReservations",count("SELECT COUNT(*) FROM reservations WHERE check_in=CURDATE() AND status='confirmed'"));
        // إجمالي الحجوزات النشطة
        stats.put("activeReservations",count("SELECT COUNT(*) FROM reservations WHERE status IN ('confirmed','checked_in')"));
        // إيرادات الشهر الحالي
        stats.put("monthlyRevenue",   revenue());
        // نسبة الإشغال
        int total = (int) stats.get("totalRooms");
        int occupied = (int) stats.get("occupiedRooms");
        stats.put("occupancyRate", total > 0 ? Math.round((occupied * 100.0) / total) : 0);

        return stats;
    }

    private int count(String sql) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    private double revenue() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = """
            SELECT COALESCE(SUM(ro.price * DATEDIFF(r.check_out, r.check_in)), 0)
            FROM reservations r
            JOIN rooms ro ON r.room_id = ro.id
            WHERE MONTH(r.check_in) = MONTH(CURDATE())
              AND YEAR(r.check_in)  = YEAR(CURDATE())
              AND r.status != 'cancelled'
        """;
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getDouble(1) : 0.0;
        }
    }
}
