package com.example.demo.Config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "bank")
public class BankConfig {
    
    private String bankId = "MB";           // Mã ngân hàng (VD: MB, VCB, TCB, ACB...)
    private String bankName = "MB Bank";    // Tên ngân hàng
    private String accountNumber = "";      // Số tài khoản
    private String accountName = "";        // Tên chủ tài khoản
    private int qrExpirationMinutes = 30;   // Thời gian hết hạn QR (phút)
    private String qrImagePath = "/storage/image/QRcode.png"; // Đường dẫn ảnh QR

    // Getters and Setters
    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public int getQrExpirationMinutes() { return qrExpirationMinutes; }
    public void setQrExpirationMinutes(int qrExpirationMinutes) { this.qrExpirationMinutes = qrExpirationMinutes; }

    public String getQrImagePath() { return qrImagePath; }
    public void setQrImagePath(String qrImagePath) { this.qrImagePath = qrImagePath; }
}
