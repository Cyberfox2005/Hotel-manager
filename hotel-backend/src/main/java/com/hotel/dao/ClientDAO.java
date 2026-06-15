package com.hotel.dao;

import com.hotel.model.Client;
import com.hotel.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ClientDAO {

    public List<Client> findAll() throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Client> clients = new ArrayList<>();
        String sql = "SELECT * FROM clients ORDER BY full_name";
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) clients.add(mapRow(rs));
        }
        return clients;
    }

    public Client findById(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "SELECT * FROM clients WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    // بحث بالاسم أو الإيميل
    public List<Client> search(String keyword) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        List<Client> clients = new ArrayList<>();
        String sql = "SELECT * FROM clients WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            String pattern = "%" + keyword + "%";
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            ps.setString(3, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) clients.add(mapRow(rs));
            }
        }
        return clients;
    }

    public Client create(Client client) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "INSERT INTO clients (full_name, email, phone) VALUES (?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, client.getFullName());
            ps.setString(2, client.getEmail());
            ps.setString(3, client.getPhone());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) client.setId(keys.getInt(1));
            }
        }
        return client;
    }

    public boolean update(Client client) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "UPDATE clients SET full_name=?, email=?, phone=? WHERE id=?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, client.getFullName());
            ps.setString(2, client.getEmail());
            ps.setString(3, client.getPhone());
            ps.setInt(4, client.getId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean delete(int id) throws SQLException {
        Connection conn = DBConnection.getInstance().getConnection();
        String sql = "DELETE FROM clients WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private Client mapRow(ResultSet rs) throws SQLException {
        return new Client(
            rs.getInt("id"),
            rs.getString("full_name"),
            rs.getString("email"),
            rs.getString("phone")
        );
    }
}
