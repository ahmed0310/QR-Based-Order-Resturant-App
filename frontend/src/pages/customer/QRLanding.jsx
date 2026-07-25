import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { apiUrl } from '../../utils/api';

export default function QRLanding() {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTableAndRedirect = async () => {
      try {
        const response = await fetch(
          apiUrl(`/api/shop/table/qr/${encodeURIComponent(qrCode)}`)
        );

        if (!response.ok) {
          setError('Invalid QR code or table not found');
          setLoading(false);
          return;
        }

        const table = await response.json();

        // shopId may arrive populated (an object) or as a raw id string.
        const shopId = table?.shopId?._id ?? table?.shopId;

        if (!shopId || !table?._id) {
          setError('This QR code is not linked to a valid table.');
          setLoading(false);
          return;
        }

        // Redirect to customer menu with tableId and shopId
        navigate(`/customer/menu/${shopId}/${table._id}`, { replace: true });
      } catch (err) {
        console.error('QR Lookup Error:', err);
        setError('Unable to process QR code. Please try again.');
        setLoading(false);
      }
    };

    fetchTableAndRedirect();
  }, [qrCode, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md w-full">
        {loading ? (
          <>
            <Loader className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
            <p className="text-gray-600">Scanning table QR code...</p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Go Home
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
