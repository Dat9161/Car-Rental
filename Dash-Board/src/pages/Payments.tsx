import { useEffect, useState } from 'react';
import { paymentApi } from '../services/api';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Payment, PaymentStatus } from '../types';
import { format } from 'date-fns';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await paymentApi.getMyPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (payment: Payment) => {
    setSelectedPayment(payment);
    setTxnId('');
    setShowModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayment) return;
    try {
      await paymentApi.confirm(selectedPayment.id, txnId || undefined);
      setShowModal(false);
      setSelectedPayment(null);
      fetchPayments();
      alert('Xác nhận thanh toán thành công!');
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Xác nhận thất bại!');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy giao dịch này?')) return;
    try {
      await paymentApi.cancel(id);
      fetchPayments();
    } catch (error) {
      console.error('Error cancelling payment:', error);
      alert('Hủy thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredPayments = filterStatus === 'ALL'
    ? payments
    : payments.filter(p => p.status === filterStatus);

  const statusLabels: Record<PaymentStatus, string> = {
    PENDING: 'Chờ thanh toán',
    COMPLETED: 'Đã thanh toán',
    FAILED: 'Thất bại',
    REFUNDED: 'Đã hoàn tiền',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
  };

  const statusColors: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    EXPIRED: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
        <p className="text-gray-600 mt-2">Xác nhận và quản lý các giao dịch thanh toán QR Bank</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'ALL')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nội dung CK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">#{payment.id}</td>
                    <td className="px-6 py-4 text-sm">Booking #{payment.bookingId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {payment.amount.toLocaleString('vi-VN')} {payment.currency}
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {payment.transferContent}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[payment.status]}`}>
                        {statusLabels[payment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.createdAt && format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {payment.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleConfirm(payment)}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                              title="Xác nhận đã nhận tiền"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Xác nhận</span>
                            </button>
                            <button
                              onClick={() => handleCancel(payment.id)}
                              className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                              title="Hủy"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {payment.status === 'COMPLETED' && payment.providerTxnId && (
                          <span className="text-xs text-gray-500">
                            TXN: {payment.providerTxnId}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Xác nhận thanh toán</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Số tiền:</p>
                <p className="text-xl font-bold text-green-600">
                  {selectedPayment.amount.toLocaleString('vi-VN')} {selectedPayment.currency}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Nội dung chuyển khoản:</p>
                <code className="text-lg font-mono font-bold">{selectedPayment.transferContent}</code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giao dịch ngân hàng (tùy chọn)
                </label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="VD: FT24120612345"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Xác nhận đã nhận tiền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
