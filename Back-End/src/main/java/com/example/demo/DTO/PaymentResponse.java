package com.example.demo.DTO;

import com.example.demo.Entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String currency;
    private Payment.PaymentMethod method;
    private Payment.PaymentStatus status;
    private String provider;
    private String providerTxnId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    
    // QR specific
    private String qrContent;
    private String qrImageUrl;
    private String transferContent;
    private LocalDateTime expiresAt;
    
    // Bank info for display
    private String bankName;
    private String accountNumber;
    private String accountName;

    public static PaymentResponse fromEntity(Payment payment) {
        PaymentResponse r = new PaymentResponse();
        r.id = payment.getId();
        r.bookingId = payment.getBooking().getId();
        r.amount = payment.getAmount();
        r.currency = payment.getCurrency();
        r.method = payment.getMethod();
        r.status = payment.getStatus();
        r.provider = payment.getProvider();
        r.providerTxnId = payment.getProviderTxnId();
        r.paidAt = payment.getPaidAt();
        r.qrContent = payment.getQrContent();
        r.transferContent = payment.getTransferContent();
        r.expiresAt = payment.getExpiresAt();
        if (payment.getCreatedAt() != null) {
            r.createdAt = payment.getCreatedAt().toLocalDateTime();
        }
        return r;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Payment.PaymentMethod getMethod() { return method; }
    public void setMethod(Payment.PaymentMethod method) { this.method = method; }

    public Payment.PaymentStatus getStatus() { return status; }
    public void setStatus(Payment.PaymentStatus status) { this.status = status; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderTxnId() { return providerTxnId; }
    public void setProviderTxnId(String providerTxnId) { this.providerTxnId = providerTxnId; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getQrContent() { return qrContent; }
    public void setQrContent(String qrContent) { this.qrContent = qrContent; }

    public String getQrImageUrl() { return qrImageUrl; }
    public void setQrImageUrl(String qrImageUrl) { this.qrImageUrl = qrImageUrl; }

    public String getTransferContent() { return transferContent; }
    public void setTransferContent(String transferContent) { this.transferContent = transferContent; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
}
