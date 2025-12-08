// src/screens/PaymentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  Clipboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../config/api.config';

interface PaymentData {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transferContent: string;
  qrImageUrl: string;
  expiresAt: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId, amount, currency } = route.params;

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [countdown, setCountdown] = useState(0);

  const baseUrl = getApiBaseUrl();

  useEffect(() => {
    createPayment();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (payment?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(payment.expiresAt).getTime();
        const diff = Math.max(0, Math.floor((expires - now) / 1000));
        setCountdown(diff);
        
        if (diff <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [payment]);

  const createPayment = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        navigation.goBack();
        return;
      }

      const response = await fetch(`${baseUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          method: 'QR_BANK',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPayment(data);
      } else {
        Alert.alert('Lỗi', data.error || 'Không thể tạo thanh toán');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Lỗi', 'Không kết nối được server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label} đã được sao chép`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDone = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn đã chuyển khoản thành công?\n\nSau khi admin xác nhận, đơn đặt xe sẽ được duyệt.',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Đã chuyển',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tạo mã thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#dc3545" />
          <Text style={styles.errorText}>Không thể tạo thanh toán</Text>
          <TouchableOpacity style={styles.retryButton} onPress={createPayment}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Build QR URL
  let qrUrl = '';
  if (payment.qrImageUrl) {
    qrUrl = payment.qrImageUrl.startsWith('/')
      ? `${baseUrl}${payment.qrImageUrl}`
      : payment.qrImageUrl;
  } else if (payment.qrContent) {
    qrUrl = payment.qrContent.startsWith('/')
      ? `${baseUrl}${payment.qrContent}`
      : payment.qrContent;
  }
  
  console.log('QR URL:', qrUrl);
  console.log('Payment data:', JSON.stringify(payment, null, 2));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán QR</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Countdown */}
        {countdown > 0 && (
          <View style={styles.countdownContainer}>
            <Ionicons name="time-outline" size={20} color="#ff9800" />
            <Text style={styles.countdownText}>
              Hết hạn sau: {formatTime(countdown)}
            </Text>
          </View>
        )}

        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Số tiền cần thanh toán</Text>
          <Text style={styles.amountValue}>
            {payment.amount.toLocaleString('vi-VN')} {payment.currency}
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <Text style={styles.qrHint}>
            Mở app ngân hàng và quét mã QR này
          </Text>
        </View>

        {/* Bank Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Hoặc chuyển khoản thủ công</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngân hàng</Text>
            <Text style={styles.infoValue}>{payment.bankName}</Text>
          </View>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => copyToClipboard(payment.accountNumber, 'Số tài khoản')}
          >
            <Text style={styles.infoLabel}>Số tài khoản</Text>
            <View style={styles.copyRow}>
              <Text style={styles.infoValueBold}>{payment.accountNumber}</Text>
              <Ionicons name="copy-outline" size={18} color="#007bff" />
            </View>
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chủ tài khoản</Text>
            <Text style={styles.infoValue}>{payment.accountName}</Text>
          </View>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => copyToClipboard(payment.amount.toString(), 'Số tiền')}
          >
            <Text style={styles.infoLabel}>Số tiền</Text>
            <View style={styles.copyRow}>
              <Text style={styles.infoValueBold}>
                {payment.amount.toLocaleString('vi-VN')} {payment.currency}
              </Text>
              <Ionicons name="copy-outline" size={18} color="#007bff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.infoRow, styles.transferContentRow]}
            onPress={() => copyToClipboard(payment.transferContent, 'Nội dung CK')}
          >
            <Text style={styles.infoLabel}>Nội dung chuyển khoản</Text>
            <View style={styles.copyRow}>
              <Text style={styles.transferContent}>{payment.transferContent}</Text>
              <Ionicons name="copy-outline" size={18} color="#007bff" />
            </View>
          </TouchableOpacity>

          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color="#ff9800" />
            <Text style={styles.warningText}>
              Vui lòng nhập đúng nội dung chuyển khoản để được xác nhận tự động
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Tôi đã chuyển khoản</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },

  content: { padding: 16 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: { marginTop: 12, color: '#dc3545', fontSize: 16 },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  countdownText: { marginLeft: 8, color: '#856404', fontWeight: '600' },

  amountCard: {
    backgroundColor: '#007bff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  amountValue: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 4 },

  qrCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  qrImage: { width: 220, height: 220, backgroundColor: '#f0f0f0', borderRadius: 8 },
  qrHint: { marginTop: 12, color: '#666', fontSize: 13 },

  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { color: '#666', fontSize: 14 },
  infoValue: { color: '#333', fontSize: 14 },
  infoValueBold: { color: '#333', fontSize: 15, fontWeight: '600' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  
  transferContentRow: { flexDirection: 'column', alignItems: 'flex-start' },
  transferContent: {
    color: '#007bff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: { flex: 1, marginLeft: 8, color: '#856404', fontSize: 13, lineHeight: 18 },

  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  doneButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
