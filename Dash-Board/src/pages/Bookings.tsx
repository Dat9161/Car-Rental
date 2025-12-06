import { useEffect, useState } from 'react';
import { bookingApi, vehicleApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, PlayCircle, XCircle, Plus, MapPin, Building, Eye } from 'lucide-react';
import type { Booking, Vehicle, BookingStatus } from '../types';
import { format } from 'date-fns';
import BookingModal from '../components/BookingModal';

const Bookings = () => {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, vehiclesData] = await Promise.all([
        bookingApi.getMyBookings(),
        vehicleApi.list(),
      ]);
      // Debug: log bookings để kiểm tra pickupType
      console.log('Bookings data:', bookingsData);
      const deliveryBookings = bookingsData.filter(b => b.pickupType === 'DELIVERY');
      console.log('Delivery bookings:', deliveryBookings);
      
      setBookings(bookingsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setShowModal(true);
  };

  const handleStatusChange = async (id: number, action: 'confirm' | 'activate' | 'complete' | 'cancel') => {
    try {
      switch (action) {
        case 'confirm':
          await bookingApi.confirm(id);
          break;
        case 'activate':
          await bookingApi.activate(id);
          break;
        case 'complete':
          await bookingApi.complete(id);
          break;
        case 'cancel':
          await bookingApi.cancel(id);
          break;
      }
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Cập nhật trạng thái thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const statusLabels: Record<BookingStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    ACTIVE: 'Đang thuê',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  };

  const statusColors: Record<BookingStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt xe</h1>
          <p className="text-gray-600 mt-2">Danh sách và quản lý các đặt xe</p>
        </div>
        {!isAdmin && (
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Đặt xe mới</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'ALL')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhận xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Chưa có đặt xe nào
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.vehicleTitle}</div>
                      <div className="text-sm text-gray-500">{booking.vehicleType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{format(new Date(booking.startAt), 'dd/MM/yyyy HH:mm')}</div>
                      <div className="text-gray-500">→ {format(new Date(booking.endAt), 'dd/MM/yyyy HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {booking.pickupType === 'DELIVERY' ? (
                          <>
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600">Giao tận nơi</span>
                          </>
                        ) : (
                          <>
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Tại gara</span>
                          </>
                        )}
                      </div>
                      {booking.pickupType === 'DELIVERY' && booking.deliveryAddress && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={booking.deliveryAddress}>
                          {booking.deliveryAddress}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {booking.totalAmount.toLocaleString('vi-VN')} {booking.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {isAdmin && booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirm')}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="Xác nhận"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Xác nhận</span>
                          </button>
                        )}
                        {isAdmin && booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'activate')}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                            title="Kích hoạt"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Kích hoạt</span>
                          </button>
                        )}
                        {isAdmin && booking.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'complete')}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                            title="Hoàn thành"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Hoàn thành</span>
                          </button>
                        )}
                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancel')}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Hủy"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Hủy</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                          title="Chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BookingModal
          vehicles={vehicles.filter(v => v.status === 'AVAILABLE')}
          onClose={() => setShowModal(false)}
          onSave={async () => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Chi tiết đặt xe #{selectedBooking.id}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Thông tin xe */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Thông tin xe</h4>
                <p className="text-lg font-medium">{selectedBooking.vehicleTitle}</p>
                <p className="text-sm text-gray-500">{selectedBooking.vehicleType}</p>
              </div>

              {/* Thời gian */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Thời gian thuê</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Bắt đầu</p>
                    <p className="font-medium">{format(new Date(selectedBooking.startAt), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kết thúc</p>
                    <p className="font-medium">{format(new Date(selectedBooking.endAt), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>

              {/* Phương thức nhận xe */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Phương thức nhận xe</h4>
                <div className="flex items-center space-x-2">
                  {selectedBooking.pickupType === 'DELIVERY' ? (
                    <>
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-blue-600">Giao xe tận nơi</span>
                    </>
                  ) : (
                    <>
                      <Building className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Nhận xe tại gara</span>
                    </>
                  )}
                </div>
                {selectedBooking.pickupType === 'DELIVERY' && selectedBooking.deliveryAddress && (
                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Địa chỉ giao xe:</p>
                    <p className="text-sm font-medium text-blue-800">{selectedBooking.deliveryAddress}</p>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              {selectedBooking.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-700 mb-2">Ghi chú từ khách hàng</h4>
                  <p className="text-sm text-yellow-800">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Tổng tiền */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Thanh toán</h4>
                <div className="flex justify-between items-center">
                  <span>Tổng tiền:</span>
                  <span className="text-xl font-bold text-green-600">
                    {selectedBooking.totalAmount.toLocaleString('vi-VN')} {selectedBooking.currency}
                  </span>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[selectedBooking.status]}`}>
                  {statusLabels[selectedBooking.status]}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

