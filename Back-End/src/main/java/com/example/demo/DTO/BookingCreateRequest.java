package com.example.demo.DTO;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class BookingCreateRequest {

    @NotNull
    private Long vehicleId;

    @NotNull
    private LocalDateTime startAt;

    @NotNull
    private LocalDateTime endAt;

    private String notes;

    // Phương thức nhận xe: PICKUP (tại gara) hoặc DELIVERY (giao tại địa chỉ)
    private String pickupType = "PICKUP";

    // Địa chỉ giao xe (bắt buộc nếu pickupType = DELIVERY)
    private String deliveryAddress;

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPickupType() {
        return pickupType;
    }

    public void setPickupType(String pickupType) {
        this.pickupType = pickupType;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }
}


