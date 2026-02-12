import { RideHistoryItem } from "@/components/history/HistoryCard";
import { format } from "date-fns";

export const generateReceiptHTML = (ride: RideHistoryItem, logoUrl: string, currency: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${ride.id}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 20px;
            background-color: #f3f4f6;
        }
        
        .receipt-container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }
        
        .logo-container {
            max-width: 180px;
        }
        
        .logo {
            max-height: 50px;
            width: auto;
        }
        
        .receipt-badge {
            background: #f3f4f6;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
        }
        
        .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #111827;
        }
        
        .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 32px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #9ca3af;
            margin-bottom: 8px;
        }
        
        .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #1f2937;
        }
        
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 32px 0;
        }
        
        .ride-path {
            position: relative;
            padding-left: 24px;
            margin-bottom: 32px;
        }
        
        .ride-path::before {
            content: '';
            position: absolute;
            left: 5px;
            top: 8px;
            bottom: 8px;
            width: 2px;
            border-left: 2px dashed #d1d5db;
        }
        
        .stop {
            position: relative;
            margin-bottom: 24px;
        }
        
        .stop:last-child {
            margin-bottom: 0;
        }
        
        .stop-dot {
            position: absolute;
            left: -24px;
            top: 4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            z-index: 1;
        }
        
        .stop-dot.pickup { border: 3px solid #10b981; }
        .stop-dot.drop { border: 3px solid #ef4444; }
        
        .stop-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .stop-address {
            font-size: 14px;
            font-weight: 500;
            line-height: 1.5;
        }
        
        .billing-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .billing-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            font-size: 15px;
        }
        
        .billing-label { color: #4b5563; }
        .billing-value { font-weight: 600; color: #111827; }
        
        .total-row {
            margin-top: 16px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .total-label {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }
        
        .total-value {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
        }
        
        .driver-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-top: 32px;
        }
        
        .driver-info h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .driver-info p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #9ca3af;
            font-size: 13px;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .receipt-container { box-shadow: none; margin: 0; max-width: 100%; border: none; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="logo-container">
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>
            <div class="receipt-badge">Receipt #${ride.id}</div>
        </div>
        
        <h1 class="title">Thanks for riding</h1>
        <p class="subtitle">Requested on ${format(new Date(ride.date), "MMMM d, yyyy 'at' h:mm a")}</p>
        
        <div class="grid">
            <div>
                <div class="section-title">Ride Fare</div>
                <div class="info-value">${currency}${ride.price.toFixed(2)}</div>
            </div>
            <div>
                <div class="section-title">Payment</div>
                <div class="info-value">${ride.paymentMethod}</div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="ride-path">
            <div class="stop">
                <div class="stop-dot pickup"></div>
                <div class="stop-label">Pickup</div>
                <div class="stop-address">${ride.pickupAddress}</div>
            </div>
            <div class="stop">
                <div class="stop-dot drop"></div>
                <div class="stop-label">Drop</div>
                <div class="stop-address">${ride.dropAddress}</div>
            </div>
        </div>
        
        <div class="grid">
            <div>
                <div class="section-title">Distance</div>
                <div class="info-value">${ride.distance}</div>
            </div>
            <div>
                <div class="section-title">Duration</div>
                <div class="info-value">${ride.duration}</div>
            </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="billing-table">
            <div class="billing-row">
                <span class="billing-label">Base Fare</span>
                <span class="billing-value">${currency}${(ride.price * 0.8).toFixed(2)}</span>
            </div>
            <div class="billing-row">
                <span class="billing-label">Taxes & Fees</span>
                <span class="billing-value">${currency}${(ride.price * 0.2).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="total-row">
            <span class="total-label">Total Paid</span>
            <span class="total-value">${currency}${ride.price.toFixed(2)}</span>
        </div>
        
        <div class="driver-card">
            <div class="driver-info">
                <div class="section-title">Your Driver</div>
                <h4>${ride.driverName}</h4>
                <p>${ride.driver_vehicle_name || ''} ${ride.vehicle_no ? `• ${ride.vehicle_no}` : ''}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated receipt for your ride.</p>
            <p>© ${new Date().getFullYear()} ${ride.driver_vehicle_brand || 'Ride Sharing'}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};
