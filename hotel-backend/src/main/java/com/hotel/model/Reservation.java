package com.hotel.model;

import java.util.Date;

public class Reservation {

    private int    id;
    private int    clientId;
    private int    roomId;
    private Date   checkIn;
    private Date   checkOut;
    private String status;   // confirmed | cancelled | checked_in | checked_out

    // للعرض في الـ API (JOIN مع الجداول الأخرى)
    private String clientName;
    private String roomNumber;
    private double roomPrice;

    public Reservation() {}

    // Getters & Setters
    public int    getId()                   { return id; }
    public void   setId(int id)             { this.id = id; }

    public int    getClientId()             { return clientId; }
    public void   setClientId(int c)        { this.clientId = c; }

    public int    getRoomId()               { return roomId; }
    public void   setRoomId(int r)          { this.roomId = r; }

    public Date   getCheckIn()              { return checkIn; }
    public void   setCheckIn(Date d)        { this.checkIn = d; }

    public Date   getCheckOut()             { return checkOut; }
    public void   setCheckOut(Date d)       { this.checkOut = d; }

    public String getStatus()               { return status; }
    public void   setStatus(String s)       { this.status = s; }

    public String getClientName()           { return clientName; }
    public void   setClientName(String n)   { this.clientName = n; }

    public String getRoomNumber()           { return roomNumber; }
    public void   setRoomNumber(String n)   { this.roomNumber = n; }

    public double getRoomPrice()            { return roomPrice; }
    public void   setRoomPrice(double p)    { this.roomPrice = p; }
}
