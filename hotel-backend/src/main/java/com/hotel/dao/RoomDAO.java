package com.hotel.dao;

import com.hotel.model.Room;
import com.hotel.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {

    // جلب كل الغرف
    public List<Room> findAll() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT * FROM rooms ORDER BY number";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                rooms.add(mapRow(rs));
            }
        }
        return rooms;
    }

    // جلب غرفة بالـ ID
    public Room findById(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "SELECT * FROM rooms WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    // جلب الغرف المتاحة فقط
    public List<Room> findAvailable() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT * FROM rooms WHERE status = 'available' ORDER BY number";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) rooms.add(mapRow(rs));
        }
        return rooms;
    }

    // غرف متاحة لنطاق تاريخ (بدون صيانة وبدون تعارض حجز)
    public List<Room> findAvailableForDates(Date checkIn, Date checkOut) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Room> rooms = new ArrayList<>();
        String sql = """
                SELECT ro.* FROM rooms ro
                WHERE ro.status != 'maintenance'
                AND ro.id NOT IN (
                    SELECT DISTINCT room_id FROM reservations
                    WHERE status != 'cancelled'
                    AND check_in < ? AND check_out > ?
                )
                ORDER BY ro.number
            """;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, checkOut);
            ps.setDate(2, checkIn);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) rooms.add(mapRow(rs));
            }
        }
        return rooms;
    }

    // إضافة غرفة جديدة
    public Room create(Room room) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "INSERT INTO rooms (number, type, price, status) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, room.getNumber());
            ps.setString(2, room.getType());
            ps.setDouble(3, room.getPrice());
            ps.setString(4, room.getStatus() != null ? room.getStatus() : "available");
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) room.setId(keys.getInt(1));
            }
        }
        return room;
    }

    // تعديل غرفة
    public boolean update(Room room) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "UPDATE rooms SET number=?, type=?, price=?, status=? WHERE id=?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, room.getNumber());
            ps.setString(2, room.getType());
            ps.setDouble(3, room.getPrice());
            ps.setString(4, room.getStatus());
            ps.setInt(5, room.getId());
            return ps.executeUpdate() > 0;
        }
    }

    // حذف غرفة
    public boolean delete(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "DELETE FROM rooms WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    // تحويل ResultSet إلى Room object
    private Room mapRow(ResultSet rs) throws SQLException {
        return new Room(
            rs.getInt("id"),
            rs.getString("number"),
            rs.getString("type"),
            rs.getDouble("price"),
            rs.getString("status")
        );
    }
}
