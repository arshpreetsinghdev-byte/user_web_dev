"use client";

import { useCallback, useEffect, useState } from "react";
import { bookingService } from "@/services/booking.service";
import { bookingValidator } from "@/lib/validators/bookingValidator";
import { findAvailableDrivers, filterVehiclesByRideType } from "@/lib/ride-booking/findDriver";
import type { VehicleRegion } from "@/types";
import { useBookingStore } from "@/stores/booking.store";

// type FindDriversResult = {
//   	regions: any;
// 	vehicles: VehicleRegion[];
// 	route: {
// 		distance: number;
// 		duration: number;
// 		distanceText: string;
// 		durationText: string;
// 	};
// };
type FindDriversResult = any;

/**
 * Encapsulates the full fare calculation + vehicle discovery flow.
 * Runs config fetch on pickup change and exposes a single action to
 * calculate route, hit find driver, filter by supported ride types,
 * and persist results into the booking store.
 */
export function useFindADrivers() {
	const [isFinding, setIsFinding] = useState(false);

	const {
		pickup,
		dropoff,
		stops,
		scheduledDateTime,
		pickupLocation,
		dropoffLocation,
		selectedService,
		pickupCityOffset,
		setServiceData,
		setPickupCityCurrency,
		setPickupCityOffset,
		setSelectedService,
		setRouteData,
		setAvailableVehicles,
		setIsLoading,
	} = useBookingStore();

	// Fetch configuration whenever pickup coordinates change
	useEffect(() => {
		const fetchConfiguration = async () => {
			if (!pickup?.lat || !pickup?.lng) return;

			try {
				const response = await bookingService.fetchConfiguration({
					latitude: pickup.lat,
					longitude: pickup.lng,
				});

				const services = (response.data?.services || []).filter((s: any) => s.type !== "rental" && s.type !== "car_rental");
				if (services.length) {
					setServiceData(services);

					// Only set to services[0] if no service is selected or 
					// if the current selection is no longer available in the new services list
					const currentSelected = useBookingStore.getState().selectedService;
					const isStillValid = currentSelected && services.some((s: any) =>
						(s.id?.toString() === currentSelected.id?.toString())
					);

					if (!isStillValid) {
						setSelectedService(services[0]);
					}
				}

				if (response.data?.currency) {
					setPickupCityCurrency(response.data.currency);
				}

				if (response.data?.offset !== undefined) {
					setPickupCityOffset(Number(response.data.offset));
				}
			} catch (error) {
				console.log("❌ Error fetching configuration:", error);
			}
		};

		fetchConfiguration();
	}, [pickup?.lat, pickup?.lng, setPickupCityCurrency, setPickupCityOffset, setSelectedService, setServiceData]);

	const calculateFareAndFindDrivers = useCallback(async (): Promise<FindDriversResult> => {
		// Validate input
		const validation = bookingValidator.validateBookingForm({
			pickup,
			destination: dropoff,
			stops,
			scheduledDateTime,
		});

		if (!validation.isValid) {
			throw new Error(validation.error);
		}

		setIsFinding(true);
		setIsLoading(true);

		try {
			// Calculate route
			const waypoints = stops
				.filter((stop) => stop.latitude && stop.longitude)
				.map((stop) => ({ lat: stop.latitude, lng: stop.longitude }));

			const routeData = await bookingService.calculateRoute({
				origin: { lat: pickup!.lat, lng: pickup!.lng },
				destination: { lat: dropoff!.lat, lng: dropoff!.lng },
				waypoints: waypoints.length ? waypoints : undefined,
			});

			if (!routeData) {
				throw new Error("Failed to calculate route. Please try again.");
			}

			setRouteData(routeData);

			const distanceTimeResult = {
				rideTime: Math.round(routeData.duration / 60),
				rideDistance: Math.round((routeData.distance / 1000) * 100) / 100,
				distanceText: routeData.distanceText,
				durationText: routeData.durationText,
			};

			// Find drivers
			const result = await findAvailableDrivers(
				pickupLocation,
				dropoffLocation,
				distanceTimeResult,
				{
					serviceId: selectedService?.id,
					scheduledFareFlow: !!scheduledDateTime,
					rideDateTime: scheduledDateTime || undefined,
					timezoneOffset: pickupCityOffset || 330,
				}
			);
			const vehicles = result?.regions;
			console.log("FETCHED VEHICLES +++++++",vehicles)
			// Filter by supported ride types (gracefully fallback to all)
			const supportedRideTypes = (selectedService?.supported_ride_type || [])
				.map((rt: number | string) => Number(rt))
				.filter((rt: number) => !Number.isNaN(rt));

			const filtered = filterVehiclesByRideType(vehicles, supportedRideTypes);
			console.log("fine till here -->",filtered)
			setAvailableVehicles(filtered);
			console.log("Returning");
			return {
				vehicles: filtered,
				route: routeData,
			};
		} catch(err){
			console.log("ERROR IN CALCULTING FARE ", err);
		} finally {
			setIsFinding(false);
			setIsLoading(false);
		}
	}, [
		dropoff,
		dropoffLocation,
		pickup,
		pickupCityOffset,
		pickupLocation,
		scheduledDateTime,
		selectedService,
		setAvailableVehicles,
		setIsLoading,
		setRouteData,
		stops,
	]);

	return {
		isFinding,
		calculateFareAndFindDrivers,
	};
}
