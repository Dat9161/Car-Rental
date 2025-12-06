package com.example.demo.Repository;

import com.example.demo.Entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, Payment.PaymentStatus status);
    
    List<Payment> findByStatusOrderByCreatedAtDesc(Payment.PaymentStatus status);
    
    Optional<Payment> findByTransferContent(String transferContent);
    
    List<Payment> findByBookingRenterIdOrderByCreatedAtDesc(Long renterId);
}
