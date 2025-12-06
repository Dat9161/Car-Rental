package com.example.demo.Repository;

import com.example.demo.Entity.BankQR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankQRRepository extends JpaRepository<BankQR, Long> {
    
    Optional<BankQR> findFirstByIsActiveTrue();
}
