package com.hotel.dao;

import com.hotel.model.Reservation;
import com.hotel.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReservationDAO {

    private final Connection conn = DBConnection.getInstance().getConnection();

    // جلب كل الحجوزات مع اسم العميل ورقم الغرفة (JOIN)
    public List<Reservation> findAll() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Reservation> list = new ArrayList<>();
        String sql = """
                    SELECT r.*, c.full_name AS client_name,
                    ro.number AS room_number, ro.price AS room_price
                    FROM reservations r
                    JOIN clients c  ON r.client_id = c.id
                    JOIN rooms   ro ON r.room_id   = ro.id
                    ORDER BY r.check_in DESC
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next())
                list.add(mapRow(rs));
        }
        return list;
    }

    // حجوزات اليوم
    public List<Reservation> findToday() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Reservation> list = new ArrayList<>();
        String sql = """
                    SELECT r.*, c.full_name AS client_name,
                    ro.number AS room_number, ro.price AS room_price
                    FROM reservations r
                    JOIN clients c  ON r.client_id = c.id
                    JOIN rooms   ro ON r.room_id   = ro.id
                    WHERE r.check_in = CURDATE() AND r.status = 'confirmed'
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            while (rs.next())
                list.add(mapRow(rs));
        }
        return list;
    }

    // ⚠️ التحقق من تعارض الحجوزات — المنطق الأساسي
    public boolean hasConflict(int roomId, Date checkIn, Date checkOut, int excludeId) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = """
                    SELECT COUNT(*) FROM reservations
                    WHERE room_id = ?
                    AND id != ?
                    AND status != 'cancelled'
                    AND check_in  < ?
                    AND check_out > ?
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, roomId);
            ps.setInt(2, excludeId);
            ps.setDate(3, checkOut);
            ps.setDate(4, checkIn);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        }
    }

    public Reservation create(Reservation res) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        // التحقق من التعارض قبل الإنشاء
        if (hasConflict(res.getRoomId(),
                new Date(res.getCheckIn().getTime()),
                new Date(res.getCheckOut().getTime()), 0)) {
            throw new SQLException("CONFLICT: Room is already reserved for these dates");
        }

        String sql = "INSERT INTO reservations (client_id, room_id, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, res.getClientId());
            ps.setInt(2, res.getRoomId());
            ps.setDate(3, new Date(res.getCheckIn().getTime()));
            ps.setDate(4, new Date(res.getCheckOut().getTime()));
            ps.setString(5, "confirmed");
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next())
                    res.setId(keys.getInt(1));
            }
        }

        return res;
    }

    // إلغاء حجز
    public boolean cancel(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        // جلب الحجز لمعرفة الغرفة
        Reservation res = findById(id);
        if (res == null)
            return false;

        String sql = "UPDATE reservations SET status = 'cancelled' WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            boolean ok = ps.executeUpdate() > 0;
            if (ok)
                updateRoomStatus(res.getRoomId(), "available");
            return ok;
        }
    }

    // Check-in
    public boolean checkIn(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        Reservation res = findById(id);
        if (res == null)
            return false;

        String sql = "UPDATE reservations SET status = 'checked_in' WHERE id = ? AND status = 'confirmed'";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            boolean ok = ps.executeUpdate() > 0;
            if (ok)
                updateRoomStatus(res.getRoomId(), "occupied");
            return ok;
        }
    }

    // Check-out
    public boolean checkOut(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        Reservation res = findById(id);
        if (res == null)
            return false;

        String sql = "UPDATE reservations SET status = 'checked_out' WHERE id = ? AND status = 'checked_in'";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            boolean ok = ps.executeUpdate() > 0;
            if (ok)
                updateRoomStatus(res.getRoomId(), "available");
            return ok;
        }
    }

    private Reservation findById(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = """
                    SELECT r.*, c.full_name AS client_name,
                    ro.number AS room_number, ro.price AS room_price
                    FROM reservations r
                    JOIN clients c  ON r.client_id = c.id
                    JOIN rooms   ro ON r.room_id   = ro.id
                    WHERE r.id = ?
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next())
                    return mapRow(rs);
            }
        }
        return null;
    }

    private void updateRoomStatus(int roomId, String status) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "UPDATE rooms SET status = ? WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, roomId);
            ps.executeUpdate();
        }
    }

    private Reservation mapRow(ResultSet rs) throws SQLException {
        Reservation r = new Reservation();
        r.setId(rs.getInt("id"));
        r.setClientId(rs.getInt("client_id"));
        r.setRoomId(rs.getInt("room_id"));
        r.setCheckIn(rs.getDate("check_in"));
        r.setCheckOut(rs.getDate("check_out"));
        r.setStatus(rs.getString("status"));
        r.setClientName(rs.getString("client_name"));
        r.setRoomNumber(rs.getString("room_number"));
        r.setRoomPrice(rs.getDouble("room_price"));
        return r;
    }
}
