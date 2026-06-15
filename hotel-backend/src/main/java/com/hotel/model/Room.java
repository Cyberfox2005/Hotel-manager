package com.hotel.model;

public class Room {

    private int    id;
    private String number;
    private String type;    // single | double | suite
    private double price;
    private String status;  // available | occupied | maintenance

    public Room() {}

    public Room(int id, String number, String type, double price, String status) {
        this.id     = id;
        this.number = number;
        this.type   = type;
        this.price  = price;
        this.status = status;
    }

    // Getters & Setters
    public int    getId()     { return id; }
    public void   setId(int id) { this.id = id; }

    public String getNumber()           { return number; }
    public void   setNumber(String n)   { this.number = n; }

    public String getType()             { return type; }
    public void   setType(String t)     { this.type = t; }

    public double getPrice()            { return price; }
    public void   setPrice(double p)    { this.price = p; }

    public String getStatus()           { return status; }
    public void   setStatus(String s)   { this.status = s; }
}
