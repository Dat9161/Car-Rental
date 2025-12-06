package com.example.demo.Service;

import com.example.demo.Config.BankConfig;
import com.example.demo.DTO.PaymentCreateRequest;
import com.example.demo.DTO.PaymentResponse;
import com.example.demo.Entity.Booking;
import com.example.demo.Entity.Payment;
import com.example.demo.Entity.User;
import com.example.demo.Repository.BookingRepository;
import com.example.demo.Repository.PaymentRepository;
import com.example.demo.Repository.BankQRRepository;
import com.example.demo.Entity.BankQR;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private BankConfig bankConfig;

    @Autowired
    private BankQRRepository bankQRRepository;

    /**
     * Tạo payment mới với QR Bank
     */
    public PaymentResponse createPayment(PaymentCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking không tồn tại!"));

        User currentUser = userService.getCurrentUser();
        
        // Kiểm tra quyền: chỉ renter hoặc admin mới được tạo payment
        boolean isAdmin = currentUser.getRole() == User.Role.ADMIN;
        boolean isOwner = booking.getRenter().getId().equals(currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Bạn không có quyền thanh toán booking này!");
        }

        // Kiểm tra booking status
        if (booking.getStatus() != Booking.BookingStatus.PENDING && 
            booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking không ở trạng thái có thể thanh toán!");
        }

        // Kiểm tra đã có payment pending chưa
        paymentRepository.findByBookingIdAndStatus(booking.getId(), Payment.PaymentStatus.PENDING)
                .ifPresent(p -> {
                    throw new RuntimeException("Đã có giao dịch thanh toán đang chờ xử lý!");
                });

        // Tạo nội dung chuyển khoản unique
        String transferContent = generateTransferContent(booking.getId());

        // Tạo payment
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setCurrency(booking.getCurrency());
        payment.setMethod(request.getMethod());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setProvider(bankConfig.getBankName());
        payment.setTransferContent(transferContent);
        payment.setExpiresAt(LocalDateTime.now().plusMinutes(bankConfig.getQrExpirationMinutes()));

        // Sử dụng ảnh QR tĩnh
        if (request.getMethod() == Payment.PaymentMethod.QR_BANK) {
            payment.setQrContent(getStaticQRImageUrl());
        }

        Payment saved = paymentRepository.save(payment);
        
        return buildPaymentResponse(saved);
    }

    /**
     * Lấy payment theo ID
     */
    public PaymentResponse getPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment không tồn tại!"));
        
        checkPaymentExpiration(payment);
        return buildPaymentResponse(payment);
    }

    /**
     * Lấy payments của booking
     */
    public List<PaymentResponse> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId)
                .stream()
                .map(this::buildPaymentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy payments của user hiện tại
     */
    public List<PaymentResponse> getMyPayments() {
        User currentUser = userService.getCurrentUser();
        
        if (currentUser.getRole() == User.Role.ADMIN) {
            return paymentRepository.findAll().stream()
                    .map(this::buildPaymentResponse)
                    .collect(Collectors.toList());
        }
        
        return paymentRepository.findByBookingRenterIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::buildPaymentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Admin xác nhận đã nhận tiền (manual confirm)
     */
    public PaymentResponse confirmPayment(Long paymentId, String providerTxnId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment không tồn tại!"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Payment không ở trạng thái chờ xác nhận!");
        }

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setProviderTxnId(providerTxnId);

        // Cập nhật booking status
        Booking booking = payment.getBooking();
        if (booking.getStatus() == Booking.BookingStatus.PENDING) {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        }

        return buildPaymentResponse(paymentRepository.save(payment));
    }

    /**
     * Hủy payment
     */
    public PaymentResponse cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment không tồn tại!"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy payment đang chờ!");
        }

        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        return buildPaymentResponse(paymentRepository.save(payment));
    }

    /**
     * Kiểm tra payment theo nội dung chuyển khoản (cho webhook/callback)
     */
    public PaymentResponse checkPaymentByTransferContent(String transferContent) {
        Payment payment = paymentRepository.findByTransferContent(transferContent)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch!"));
        
        return buildPaymentResponse(payment);
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Tạo nội dung chuyển khoản unique
     * Format: CR{bookingId}{timestamp}
     */
    private String generateTransferContent(Long bookingId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("ddHHmmss"));
        return "CR" + bookingId + timestamp;
    }

    /**
     * Lấy thông tin QR từ database
     */
    private BankQR getActiveBankQR() {
        return bankQRRepository.findFirstByIsActiveTrue()
                .orElse(null);
    }

    /**
     * Trả về URL ảnh QR từ database hoặc config
     */
    private String getStaticQRImageUrl() {
        BankQR bankQR = getActiveBankQR();
        if (bankQR != null && bankQR.getQrImageUrl() != null) {
            return bankQR.getQrImageUrl();
        }
        return bankConfig.getQrImagePath();
    }

    /**
     * Kiểm tra và cập nhật trạng thái hết hạn
     */
    private void checkPaymentExpiration(Payment payment) {
        if (payment.getStatus() == Payment.PaymentStatus.PENDING 
                && payment.getExpiresAt() != null 
                && LocalDateTime.now().isAfter(payment.getExpiresAt())) {
            payment.setStatus(Payment.PaymentStatus.EXPIRED);
            paymentRepository.save(payment);
        }
    }

    /**
     * Build response với thông tin bank từ database
     */
    private PaymentResponse buildPaymentResponse(Payment payment) {
        PaymentResponse response = PaymentResponse.fromEntity(payment);
        
        // Lấy thông tin bank từ database
        BankQR bankQR = getActiveBankQR();
        if (bankQR != null) {
            response.setBankName(bankQR.getBankName());
            response.setAccountNumber(bankQR.getAccountNumber());
            response.setAccountName(bankQR.getAccountName());
            response.setQrImageUrl(bankQR.getQrImageUrl());
        } else {
            // Fallback to config
            response.setBankName(bankConfig.getBankName());
            response.setAccountNumber(bankConfig.getAccountNumber());
            response.setAccountName(bankConfig.getAccountName());
            if (payment.getQrContent() != null) {
                response.setQrImageUrl(payment.getQrContent());
            }
        }
        
        return response;
    }
}
