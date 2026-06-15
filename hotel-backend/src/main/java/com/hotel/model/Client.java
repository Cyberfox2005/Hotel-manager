package com.hotel.model;

public class Client {

    private int    id;
    private String fullName;
    private String email;
    private String phone;

    public Client() {}

    public Client(int id, String fullName, String email, String phone) {
        this.id       = id;
        this.fullName = fullName;
        this.email    = email;
        this.phone    = phone;
    }

    // Getters & Setters
    public int    getId()               { return id; }
    public void   setId(int id)         { this.id = id; }

    public String getFullName()             { return fullName; }
    public void   setFullName(String n)     { this.fullName = n; }

    public String getEmail()                { return email; }
    public void   setEmail(String e)        { this.email = e; }

    public String getPhone()                { return phone; }
    public void   setPhone(String p)        { this.phone = p; }
}
