package com.hotel.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

public class JsonUtil {

    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd")
            .create();

    // إرسال استجابة JSON ناجحة
    public static void sendResponse(HttpServletResponse res, Object data) throws IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.setStatus(HttpServletResponse.SC_OK);
        PrintWriter out = res.getWriter();
        out.print(gson.toJson(data));
        out.flush();
    }

    // إرسال رسالة خطأ
    public static void sendError(HttpServletResponse res, int status, String message) throws IOException {
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.setStatus(status);
        PrintWriter out = res.getWriter();
        out.print("{\"error\": \"" + message + "\"}");
        out.flush();
    }

    // تحويل JSON String القادم من React إلى Object
    public static <T> T fromJson(String json, Class<T> clazz) {
        return gson.fromJson(json, clazz);
    }

    // قراءة body الطلب
    public static String readBody(jakarta.servlet.http.HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = req.getReader().readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }
}
