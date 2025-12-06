package com.example.demo.DTO;

import com.example.demo.Entity.Payment;
import jakarta.validation.constraints.NotNull;

public class PaymentCreateRequest {
    
    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;
    
    @NotNull(message = "Phương thức thanh toán không được để trống")
    private Payment.PaymentMethod method;

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Payment.PaymentMethod getMethod() { return method; }
    public void setMethod(Payment.PaymentMethod method) { this.method = method; }
}
