package com.example.demo.DTO;

import com.example.demo.Entity.Booking;
import com.example.demo.Entity.Vehicle;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;
    private Long vehicleId;
    private String vehicleTitle;
    private Vehicle.VehicleType vehicleType;
    private Long renterId;
    private Booking.BookingStatus status;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private BigDecimal dailyPriceSnapshot;
    private BigDecimal totalAmount;
    private String currency;
    private String notes;
    private String pickupType;
    private String deliveryAddress;

    public static BookingResponse fromEntity(Booking booking) {
        BookingResponse r = new BookingResponse();
        r.id = booking.getId();
        r.vehicleId = booking.getVehicle().getId();
        r.vehicleTitle = booking.getVehicle().getTitle();
        r.vehicleType = booking.getVehicle().getVehicleType();
        r.renterId = booking.getRenter().getId();
        r.status = booking.getStatus();
        r.startAt = booking.getStartAt();
        r.endAt = booking.getEndAt();
        r.dailyPriceSnapshot = booking.getDailyPriceSnapshot();
        r.totalAmount = booking.getTotalAmount();
        r.currency = booking.getCurrency();
        r.notes = booking.getNotes();
        r.pickupType = booking.getPickupType() != null ? booking.getPickupType().name() : "PICKUP";
        r.deliveryAddress = booking.getDeliveryAddress();
        return r;
    }

    public Long getId() { return id; }
    public Long getVehicleId() { return vehicleId; }
    public String getVehicleTitle() { return vehicleTitle; }
    public Vehicle.VehicleType getVehicleType() { return vehicleType; }
    public Long getRenterId() { return renterId; }
    public Booking.BookingStatus getStatus() { return status; }
    public LocalDateTime getStartAt() { return startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public BigDecimal getDailyPriceSnapshot() { return dailyPriceSnapshot; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getCurrency() { return currency; }
    public String getNotes() { return notes; }
    public String getPickupType() { return pickupType; }
    public String getDeliveryAddress() { return deliveryAddress; }
}


