import { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Printer, Copy, Check, Layers } from 'lucide-react';
import { QRCodeSVG } from "qrcode.react";
import { APP_BASE, apiUrl } from '../../utils/api';

const QRCode = () => {
  const shopId = localStorage.getItem('shopId');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedQrCode, setCopiedQrCode] = useState(null);
  const qrRefs = useRef({});

  // Fetch tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(apiUrl('/api/shop/tables'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }

      const data = await response.json();
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTableQrUrl = (table) => {
    return `${APP_BASE}/menu/${shopId}/table/${table.qrCode}`;
  };

  const handleDownloadQR = (table) => {
    const qrElement = qrRefs.current[table._id];
    if (qrElement) {
      const link = document.createElement('a');
      link.href = qrElement.toDataURL('image/png');
      link.download = `table-${table.tableNumber}-qr.png`;
      link.click();
    }
  };

  const handlePrintQR = (table) => {
    const qrElement = qrRefs.current[table._id];
    if (qrElement) {
      const printWindow = window.open('', '', 'height=400,width=600');
      const qrImage = qrElement.toDataURL('image/png');
      printWindow.document.write(`
        <html>
          <head>
            <title>Table ${table.tableNumber} QR Code</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; }
              h1 { margin-bottom: 20px; }
              img { margin-bottom: 20px; }
              p { text-align: center; }
            </style>
          </head>
          <body>
            <h1>Table ${table.tableNumber}</h1>
            <p>${table.name}</p>
            <img src="${qrImage}" />
            <p>Scan to view menu</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyUrl = (table) => {
    const url = getTableQrUrl(table);
    navigator.clipboard.writeText(url);
    setCopiedQrCode(table._id);
    setTimeout(() => setCopiedQrCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <QRCodeSVG className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-gray-600">Generate and manage table QR codes</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium mb-2">No tables found</p>
          <p className="text-gray-500 text-sm mb-4">Create tables first from the Tables management page</p>
          <button
            onClick={() => window.location.href = '/shop/tables'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2 font-medium"
          >
            <Layers className="w-5 h-5" />
            Go to Tables
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div
              key={table._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Table Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{table.name}</h3>
                <p className="text-sm text-gray-600">Table #{table.tableNumber}</p>
                <p className="text-sm text-gray-600">{table.capacity} seats</p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center mb-6">
                <QRCodeComponent
                  ref={(el) => (qrRefs.current[table._id] = el)}
                  value={getTableQrUrl(table)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* QR Code URL */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">QR Code ID:</p>
                <code className="text-xs text-gray-700 font-mono break-all">
                  {table.qrCode.slice(0, 16)}...
                </code>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleDownloadQR(table)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download QR
                </button>

                <button
                  onClick={() => handlePrintQR(table)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print QR
                </button>

                <button
                  onClick={() => handleCopyUrl(table)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {copiedQrCode === table._id ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy URL
                    </>
                  )}
                </button>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  table.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {table.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      {tables.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-2">💡 QR Code Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Download QR codes for each table and place them on table tents</li>
            <li>• Print multiple copies for durability and visibility</li>
            <li>• Each table has a unique QR code that links directly to the menu</li>
            <li>• Customers will be taken to the table-specific ordering page</li>
            <li>• Test QR codes with your phone before printing</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default QRCode;
