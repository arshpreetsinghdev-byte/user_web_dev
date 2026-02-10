import type { VehicleRegion, InsertPickupScheduleRequest } from '@/types';

// Extract cookie value in browser context
export function getCookieValue(name: string): string | undefined {
	if (typeof document === 'undefined') return undefined;
	const match = document.cookie.match(
		new RegExp(`(?:^|; )${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}=([^;]*)`)
	);
	return match ? decodeURIComponent(match[1]) : undefined;
}

// Format date/time for API requests with optional timezone adjustment
export function formatDateTime(date: Date, timezoneOffset?: number): string {
	const d = new Date(date);

	if (timezoneOffset) {
		d.setMinutes(d.getMinutes() - timezoneOffset);
	}

	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	const seconds = String(d.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Human-friendly fare text
export function getFormattedFare(region: VehicleRegion): string {
	const { currency_symbol, fare_float, fare } = region.region_fare;
	const displayFare = fare_float || fare;
	return `${currency_symbol}${displayFare.toFixed(2)}`;
}

// Human-friendly ETA text
export function getFormattedETA(region: VehicleRegion): string {
	if (!region.eta) return 'N/A';
	return region.eta === 1 ? '1 min' : `${region.eta} mins`;
}

// Build request body for insert_pickup_schedule
export function buildInsertPickupScheduleBody(req: InsertPickupScheduleRequest): URLSearchParams {
	const body = new URLSearchParams();

	// body.set('access_token', '2228b114e154b87f09e9e69835cecbd1718807a72d16a33ea5aaf9fb67491f7f');
	body.set('region_id', String(req.regionId));
	body.set('service_id', String(req.serviceId));
	body.set('vehicle_type', String(req.vehicleType));
	body.set('login_type', String(req.loginType ?? 0));
	body.set('latitude', String(req.latitude));
	body.set('longitude', String(req.longitude));
	body.set('pickup_location_address', req.pickupLocationAddress);

	let pickupTime = '';
	if (typeof req.pickupTime === 'string') {
		pickupTime = req.pickupTime;
	} else {
		// Send UTC time for the server to interpret correctly
		// Server treats input as UTC and converts to region time
		const d = new Date(req.pickupTime);
		const year = d.getUTCFullYear();
		const month = String(d.getUTCMonth() + 1).padStart(2, '0');
		const day = String(d.getUTCDate()).padStart(2, '0');
		const hours = String(d.getUTCHours()).padStart(2, '0');
		const minutes = String(d.getUTCMinutes()).padStart(2, '0');
		const seconds = String(d.getUTCSeconds()).padStart(2, '0');
		pickupTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}
	body.set('pickup_time', pickupTime);

	body.set('op_drop_latitude', String(req.dropLatitude));
	body.set('op_drop_longitude', String(req.dropLongitude));
	body.set('drop_location_address', req.dropLocationAddress);

	if (typeof req.passengerCount === 'number') {
		body.set('passenger_count', String(req.passengerCount));
	}

	if (typeof req.luggageCount === 'number') {
		body.set('luggage_count', String(req.luggageCount));
	}

	if (req.customerNote) {
		body.set('customer_note', req.customerNote);
	}

	body.set('preferred_payment_mode', String(req.preferredPaymentMode ?? 1));

	if (req.flightNumber) {
		body.set('flight_number', req.flightNumber);
	}

	if (req.customerName) {
		body.set('customer_name', req.customerName);
	}

	if (req.customerPhoneNo) {
		body.set('customer_phone_no', req.customerPhoneNo);
	}

	if (req.promoToApply !== undefined) {
		body.set('promo_to_apply', String(req.promoToApply));
	}

	if (req.couponToApply !== undefined) {
		body.set('coupon_to_apply', String(req.couponToApply));
	}

	return body;
}
