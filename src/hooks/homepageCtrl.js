App.controller('homeController', function ($scope, $state,API,$timeout,toast,$rootScope,$mdToast,$location,$anchorScroll,$filter,$translate,$window,$location , squareCreds) {
    $scope.activeTab = 1;
    $scope.currentRideDetails ={}
    $scope.showRideOptions = false
    var pickUpCityOffset;
    $scope.scheduledRideFare;
    $scope.stopsFields =[]
    $scope.stopsData = [];
    var directionsDisplay;
    var directionsService;
    $scope.drop = {}
    $scope.selectedBookingType = 1
    $scope.pickup = {}
    var taxPercent;
    $scope.otp = '';
    $scope.initialState = 1
    $scope.availableVehicles = []
    var rideTime, rideDistance , scheduledFareFlow;
    // $scope.businessId = '25311';
    // var businessToken = 'e5946fb59ed4f2e6feb26e9cb6ded98da31e49cb6872934bdddd46ce7aaeeac4'
    // $scope.hashKey = 'e5946fb59ed4f2e6feb26e9cb6ded98da31e49cb6872934bdddd46ce7aaeeac4';
    $scope.selectedItems = [];
    var stripe;
    var cardNumberElement, cardExpiryElement, cardCvcElement,initialCountry;
    var map;

    $scope.pickupLocation = null;
    $scope.dropLocation = null;

  
    function initMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                map = new google.maps.Map(document.getElementById('map'), {
                    center: pos,
                    zoom: 13,
                    mapTypeId: 'roadmap'
                });
            }, function() {
                // Handle geolocation error (e.g., user denied permission)
                map = new google.maps.Map(document.getElementById('map'), {
                    center: {lat: 37.7749, lng: -122.4194}, // Default to San Francisco
                    zoom: 13,
                    mapTypeId: 'roadmap'
                });
            });
        } else {
            // Browser doesn't support Geolocation
            console.log('Browser doesn\'t support Geolocation');
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 37.7749, lng: -122.4194}, // Default to San Francisco
                zoom: 13,
                mapTypeId: 'roadmap'
            });
        }
    }

    function init(){
        var url = $window.location.href;
        var hashIndex = url.indexOf('#');
        var urlFragment = (hashIndex !== -1) ? url.substring(hashIndex + 1) : '';

        // Extract the part after '?' in the fragment to get the query parameters
        var queryParamsIndex = urlFragment.indexOf('?');
        var queryParams = (queryParamsIndex !== -1) ? urlFragment.substring(queryParamsIndex + 1) : '';

        var params = new URLSearchParams(queryParams);
        // Fetch business_id and key from the parameters
        $scope.businessId = params.get('business_id');
        $scope.hashKey = params.get('key');
        $scope.googleKey = params.get('key2');
        $scope.removeGuestFlow = params.get('remove_guest_flow') == 1 ? true : false;
        $scope.splitFlow = params.get('split_flow') == 1 ? true : false;
        $scope.removeCashPayments = params.get('remove_cash_payment') == 1 ? true : false;
        $scope.showStops =  params.get('show_stops') == 1 ? true : false;
        initialCountry = params.get('initial_country') || 'US';
        scheduledFareFlow = params.get('scheduled_fare_flow') == 1 ? true : false;
        $scope.scheduledFareFlowEnabled = scheduledFareFlow;
        $scope.showPassengerLuggageField = params.get('show_passenger_luggage_field') == 1 ? true : false;
        $scope.showMaps = params.get('show_maps') == 1 ? true : false;
        $scope.showChooseService = params.get('show_choose_service') == 1 ? true : false;
        $scope.showRoundTrip = params.get('show_round_trip') == 1 ? true : false;
        $scope.scheduleDaysLimitReturn = params.get('schedule_days_limit_return');
        $scope.bookingForSomeoneElseEnabled = params.get('booking_for_someone_else_enabled') == 1 ? true : false;

        $scope.colorCode = params.get('color_code');// #ECE5DD.
        if($scope.colorCode)   document.documentElement.style.setProperty('--mainColor', $scope.colorCode);
        $scope.secondaryColor = params.get('secondary_color');
        if($scope.secondaryColor) document.documentElement.style.setProperty('--secondaryColor',$scope.secondaryColor);
        else if($scope.colorCode) document.documentElement.style.setProperty('--secondaryColor',$scope.colorCode);
        // var googleKey = 'AIzaSyCNHWyrM_P1L-fia6Kxd9FXFuzkj1Pkm5g';
        loadGoogleMapsAPI($scope.googleKey);

       $timeout(function(){
            $scope.authenticateUser();
        },1000);
    }

    init();

    function loadGoogleMapsAPI(key) {
        
        var alreadyAddedScript = document.getElementById('maps');

        if(alreadyAddedScript) { 
            document.querySelector('body').removeChild(alreadyAddedScript);
            var scripts = document.querySelectorAll("script[src*='maps.googleapis.com/']"); // removing google scripts
            for(var i = 0; i < scripts.length; i++) {
                scripts[i].parentNode.removeChild(scripts[i]);
            } 
            window.google = {};
        }

        
        var script = document.createElement('script');
        script.id = 'maps';
        script.src  = 'https://maps.googleapis.com/maps/api/js?key=' + key + '&v=3.27&libraries=places,drawing,geometry&sensor=false';
        document.querySelector('body').appendChild(script);

        script.onload = function() {
            if(!$scope.showMaps) return;
            $timeout(function(){
                // $scope.initialisePickupLocation();
                // $scope.initialiseDropLocation();
                initMap();
                directionsService = new google.maps.DirectionsService();
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsDisplay.setMap(map);
            },1000);
        }
    }

    // function init(){
    //     var url = $window.location.href;
    //     console.log(url);
    //     var hashIndex = url.indexOf('#');
    //     var urlFragment = (hashIndex !== -1) ? url.substring(hashIndex + 1) : '';

    //     // Extract the part after '?' in the fragment to get the query parameters
    //     var queryParamsIndex = urlFragment.indexOf('?');
    //     var queryParams = (queryParamsIndex !== -1) ? urlFragment.substring(queryParamsIndex + 1) : '';

    //     var params = new URLSearchParams(queryParams);

    // // Fetch business_id and key from the parameters
    //     $scope.businessId = params.get('business_id');
    //     $scope.hashKey = params.get('key');

    //    $timeout(function(){
    //         $scope.authenticateUser();
    //     },300);
    // }

    // init();

    // function init(){
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const coordinatesParam = urlParams.get('coordinates');
        
    //     if (coordinatesParam) {
    //         // Parse the coordinates stringified JSON
    //         const coordinates = JSON.parse(coordinatesParam);

    //         if(coordinates.from.latitude == null || coordinates.from.longitude == null || coordinates.to.latitude == null || coordinates.to.longitude == null) {
    //             createToast('Unable to fetch location data. Please enter locations again.')
    //             return;
    //         }
    //         // Assign values from the coordinates object to $scope
    //         $scope.pickup = coordinates.from;
    //         $scope.drop = coordinates.to;
    //         $scope.stopsFields = coordinates.tussenstops || [];

    //         document.getElementById('destinationAddress').value = $scope.drop.address;
    //         document.getElementById('pickupAddress').value = $scope.pickup.address;
    //         $scope.authenticateUser();

    //     }
    // }

    $scope.initialiseDropLocation = function () {
        $timeout(function () {
            var dropAutocomplete = new google.maps.places.Autocomplete(document.getElementById('destinationAddress'));
            google.maps.event.addListener(dropAutocomplete, 'place_changed', function () {   // for getting drop location lat, long
                var place = dropAutocomplete.getPlace();
                $scope.drop.latitude = place.geometry.location.lat();
                $scope.drop.longitude = place.geometry.location.lng();
                $scope.drop.address = document.getElementById('destinationAddress').value;
                $scope.currentRideDetails.drop_details = angular.copy($scope.drop);
                if($scope.showMaps) addMarker('drop');
                // localStorage.setItem('U_current_ride_details', JSON.stringify(currentRideDetails));
                // var endPoint = new google.maps.LatLng($scope.drop.latitude, $scope.drop.longitude);
                // plotMarker(endPoint);
            });
        },500);
    }

    $scope.verifySession = function(){
        var headers ={
            'x-jugnoo-session-id' : $scope.sessionId ,
            'x-jugnoo-session-identifier' : $scope.sessionIdentifier
        };
        
        var reqObj = {};

        API.postWithHeaders(AUTOS_URL + '/open/v1/verify_session',reqObj,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                $scope.stripeKey = res.data.data.stripe_key;
                $scope.stripe3dEnabled = res.data.data.stripe_3d_enabled || 0;
                if($scope.stripeKey) initializeStripe();
                // fetchConfiguration();
            }else{
                createToast(res.data.error?res.data.error : res.data.message);
            }
        });
    }

    function fetchConfiguration(){
        $scope.fetchConfiguration();
    }
    function initializeStripe(){
        stripe = Stripe($scope.stripeKey);
        var elements = stripe.elements();

        var style = {
            base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                padding : '10px 20px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '20px',
                '::placeholder': {
                    color: '#CFD7E0'
                }
            },
        };
    
        cardNumberElement = elements.create('cardNumber', { style: style , showIcon: true,
            iconStyle: 'solid'});
        cardNumberElement.mount('#card-number');
    
        cardExpiryElement = elements.create('cardExpiry', { style: style });
        cardExpiryElement.mount('#card-expiry');
    
        cardCvcElement = elements.create('cardCvc', { style: style });
        cardCvcElement.mount('#card-cvc');
    
    }

    $scope.setLocationFromAutocomplete = function (setPickup) {
        if(setPickup && $scope.currentRideDetails.pickup_details && $scope.currentRideDetails.pickup_details.address){
            $scope.pickup.details = $scope.currentRideDetails.pickup_details.address;
        }else if(!setPickup && $scope.currentRideDetails.drop_details && $scope.currentRideDetails.drop_details.address){
            $scope.drop.address = $scope.currentRideDetails.drop_details.address;
        }
    
    }

    $scope.setStopsLocationFromAutocomplete = function(index){
        if($scope.stopsData[index] && $scope.stopsData[index].address){
            $scope.stopsFields[index].address = $scope.stopsData[index].address;
        }
    }


    $scope.initialisePickupLocation = function () {
        $timeout(function () {
            var pickupAutocomplete = new google.maps.places.Autocomplete(document.getElementById('pickupAddress'));
            google.maps.event.addListener(pickupAutocomplete, 'place_changed', function () {   // for getting pickup location lat, long
                var place = pickupAutocomplete.getPlace();
                $scope.pickup.latitude = place.geometry.location.lat();
                $scope.pickup.longitude = place.geometry.location.lng();
                $scope.pickup.address = document.getElementById('pickupAddress').value;
                $scope.fetchConfiguration();
                $scope.currentRideDetails.pickup_details = angular.copy($scope.pickup);
                if($scope.showMaps) addMarker('pickup');
                // localStorage.setItem('U_current_ride_details', JSON.stringify(currentRideDetails));
                // findDrivers();
            });
        },500);
    }

    var pickupMarker , dropMarker;

    function addMarker(type) {
        if(type == 'pickup'){
            if(!$scope.pickup.latitude && !$scope.pickup.longitude){
                // createToast('Please enter pickup location');
                return;
            }
            if(pickupMarker){
                pickupMarker.setPosition(new google.maps.LatLng($scope.pickup.latitude, $scope.pickup.longitude));
            }else{
                var endPoint = new google.maps.LatLng($scope.pickup.latitude, $scope.pickup.longitude);
                pickupMarker = new google.maps.Marker({
                    position: endPoint,
                    map: map                   
                });
            }
        }else if(type == 'drop'){
            if(!$scope.drop.latitude && !$scope.drop.longitude){
                // createToast('Please enter drop location');
                return;
            }
            if(dropMarker){
                dropMarker.setPosition(new google.maps.LatLng($scope.drop.latitude, $scope.drop.longitude));
            }else{
                var endPoint = new google.maps.LatLng($scope.drop.latitude, $scope.drop.longitude);
                dropMarker = new google.maps.Marker({
                    position: endPoint,
                    map: map
                })
            }
        }

        if(($scope.pickup.latitude && $scope.pickup.longitude) || ($scope.drop.latitude && $scope.drop.longitude)){
            var bounds = new google.maps.LatLngBounds();
            if(pickupMarker) bounds.extend(pickupMarker.position);
            if(dropMarker) bounds.extend(dropMarker.position);
            map.fitBounds(bounds);
            map.panToBounds(bounds);
            calculateRoute();
        }
        //Set zoom
        map.setZoom(13);
    }

    function calculateRoute () {
        if(!$scope.pickup.latitude || !$scope.pickup.longitude || !$scope.drop.latitude || !$scope.drop.longitude) return;
        var request = {
            origin: new google.maps.LatLng($scope.pickup.latitude, $scope.pickup.longitude),
            destination: new google.maps.LatLng($scope.drop.latitude, $scope.drop.longitude),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
                directionsDisplay.setMap(map);
            }
        });
    }

    $scope.initialiseStopsLocation = function(index){
        $timeout(function() {
            var stop = new google.maps.places.Autocomplete(document.getElementById('stop' + index));
            google.maps.event.addListener(stop, 'place_changed', function() {
                var place = stop.getPlace();
                $scope.stopsFields[index].latitude = place.geometry.location.lat();
                $scope.stopsFields[index].longitude = place.geometry.location.lng();
                $scope.stopsFields[index].address = document.getElementById('stop'+index).value;
                $scope.stopsData[index] = angular.copy($scope.stopsFields[index]);
            });
        }, 0);
    }
    $scope.addStops = function(){
        $scope.stopsFields.push({});
    }

    $scope.authenticateUser = function(){
        var reqObj ={
            scope : 'open_apis'
        };

        var newObj= JSON.stringify(reqObj);
        console.log('133');
        var hmacData = generateHmacHash(newObj);
        console.log('12211');

        var headers ={
            'x-jugnoo-id' : $scope.businessId,
            'x-jugnoo-signature' :  hmacData
        };
        API.postWithHeaders(AUTOS_URL + '/open/v1/authorization' , reqObj,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                $scope.sessionId = res.data.data.session_id;
                $scope.sessionIdentifier = res.data.data.session_identifier;
                $scope.verifySession();
            }else{
                alert(res.data);
                alert(res.data.error);
                createToast(res.data.error?res.data.error : res.data.message);

            }
        });
    }

    // $scope.authenticateUser();

    // function generateHmacHash(data) {
    //     var hmac = Crypto.createHmac('sha256', hashKey);
    //     hmac.update(data);
    //     var secureHash = hmac.digest('hex');
    //     var messageHash = secureHash.toString('base64');
    //     return messageHash;
    //  }

    function generateHmacHash(data) {
        var hmac = CryptoJS.HmacSHA256(data, $scope.hashKey);
        var messageHash = hmac.toString(CryptoJS.enc.Hex);
        return messageHash;
    }
   
    $scope.getDetails = function(){
        // $rootScope.showLoader = true;
        
        if(!$scope.pickup.latitude || !$scope.pickup.longitude){
            createToast('Enter valid pickup location');
            return;
        }

        if(!$scope.drop.latitude || !$scope.drop.longitude){
            createToast('Enter valid drop location');
            return;
        }

        if($scope.showRoundTrip && $scope.isRoundTrip &&!$scope.returnDateTime){
            createToast('Please choose a return date');
            return;
        }

        if ($scope.showRoundTrip && $scope.isRoundTrip && $scope.returnDateTime && $scope.rideDateTime) {
            var rideTime = moment($scope.rideDateTime, 'YYYY-MM-DD HH:mm');
            var returnTime = moment($scope.returnDateTime, 'YYYY-MM-DD HH:mm');
            if (!returnTime.isAfter(rideTime)) {
                createToast('Return time must be greater than ride date time');
                return;
            }
        }

        // if(!$scope.rideDateTime){
        //     createToast('Please choose a date');
        //     return;
        // }

        if($scope.stopsFields.length > 0 ){
            for(var i = 0 ; i< $scope.stopsFields.length; i++){
                if(!$scope.stopsFields[i].latitude || !$scope.stopsFields[i].longitude){
                    createToast('Enter valid stops location');
                    return;
                }
            }
        }
        var req = {
            latitude : $scope.pickup.latitude,
            longitude : $scope.pickup.longitude,
            op_drop_latitude : $scope.drop.latitude,
            op_drop_longitude : $scope.drop.longitude,
            service_id :$scope.servicesData[0].id,
            // ride_time : 20,
            // ride_distance : 234,
            login_type : 0,
            show_toll_charge : 1,
        };

        if($scope.showRoundTrip && $scope.isRoundTrip && $scope.returnDateTime){
            req.return_trip = 1;
            req.return_time = pickUpCityOffset ? ( moment($scope.returnDateTime).subtract(pickUpCityOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss')) : (moment($scope.returnDateTime).utc().format('YYYY-MM-DD HH:mm:ss') );
        }

        if($scope.sessionId && $scope.sessionIdentifier){
            var headers ={
                'x-jugnoo-session-id' : $scope.sessionId ,
                'x-jugnoo-session-identifier' : $scope.sessionIdentifier
            };
        }

        $scope.calculateDistanceTime().then(function(res){
            req.ride_time = $scope.showRoundTrip && $scope.isRoundTrip  && $scope.returnDateTime? res.ride_Time * 2.0 : res.ride_Time;
            req.ride_distance = $scope.showRoundTrip && $scope.isRoundTrip && $scope.returnDateTime ? res.ride_Distance * 2.0 : res.ride_Distance;
            if(scheduledFareFlow){
                req.pickup_time = pickUpCityOffset ? ( moment($scope.rideDateTime).subtract(pickUpCityOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss')) : (moment($scope.rideDateTime).utc().format('YYYY-MM-DD HH:mm:ss') );
            }
            
            API.postWithHeaders(AUTOS_URL+'/open/v1/find_a_driver' , req , headers).then(function(res){
                if(res.data.flag ==responseStatus.SUCCESS || res.data.flag == '175'){
                    $rootScope.showLoader = false;
                    $scope.initialState = 0 ;
                    $scope.regionsList = res.data.regions;
                    $scope.availableVehicles = []; 
                    $scope.regionsList.forEach(function(item){
                        if($scope.supportedVehicle.includes(item.ride_type))
                        {
                            $scope.availableVehicles.push(item);
                        }
                    });
                    $scope.showRideOptions = true;
                }else{
                    createToast(res.data.error ? res.data.error : res.data.message);
                }
            });
        });
        // req.ride_time = rideTime;
        // req.ride_distance = rideDistance;
     
        
    }

    $scope.calculateDistanceTime = function(){
        return new Promise(function(resolve,reject){
            var startPoint = new google.maps.LatLng($scope.pickup.latitude, $scope.pickup.longitude);
            var endPoint = new google.maps.LatLng($scope.drop.latitude, $scope.drop.longitude);
            var waypoints = [];
            if($scope.stopsFields.length > 0){
                for(var i=0 ; i<$scope.stopsFields.length ; i++){
                    waypoints.push({location :new google.maps.LatLng($scope.stopsFields[i].latitude, $scope.stopsFields[i].longitude),
                        stopover : true
                    });
                }
            }

            var request ={
                origin : startPoint,
                destination : endPoint,
                waypoints : waypoints,
                travelMode : google.maps.TravelMode.DRIVING
            };

            var directionsService = new google.maps.DirectionsService();
            directionsService.route(request , function(response ,status){
                // var rideTime = (response.routes[0].legs[0].duration.value / 60).toFixed(2);
                // var rideDistance = (response.routes[0].legs[0].distance.value / 1000).toFixed(2)
                var totalDuration = 0;
                    var totalDistance = 0;

                    response.routes[0].legs.forEach(function(leg) {
                        totalDuration += leg.duration.value;
                        totalDistance += leg.distance.value;
                    });

                    rideTime = (totalDuration / 60).toFixed(2); // in minutes
                    rideDistance = (totalDistance / 1000).toFixed(2); // in kilometers
                    resolve({ ride_Time: rideTime, ride_Distance: rideDistance });
            });
        });

     };


     $scope.fetchConfiguration = function(){
        var headers ={
            'x-jugnoo-session-id' : $scope.sessionId ,
            'x-jugnoo-session-identifier' : $scope.sessionIdentifier
        };

        var req = {
            latitude : $scope.pickup.latitude ,
            longitude : $scope.pickup.longitude
        };

        API.postWithHeaders(AUTOS_URL + '/open/v1/fetch_configuration_user_web',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                $scope.servicesData = res.data.data.services;
                if(!$scope.servicesData.length){
                    createToast('No services available');
                    return;
                }
                console.log('Type of servicesData[0].id:', typeof $scope.servicesData[0].id, 'Value:', $scope.servicesData[0].id);
                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.selectedService =$scope.servicesData[0];
                        console.log('tesint',typeof $scope.selectedService)

                    })
                },1000);
                
                // $scope.servicesData.forEach(function(item){
                //     console.log('item',item);
                //     item.id = parseInt(item.id);
                //     console.log('type of ', typeof item.id);
                // });
                
                $scope.supportedVehicle = res.data.data.services[0].supported_ride_type;
                pickUpCityOffset =  res.data.data.offset;
                // $scope.supportedVehicle - [0]
            }else{
                pickUpCityOffset = null;
                createToast(res.data.error ? res.data.error : res.data.message ? res.data.message : 'Authentication Failed');
            }
        });
    };

    $scope.onServiceChange = function(){
        $scope.supportedVehicle = $scope.selectedService.supported_ride_type;
        $scope.isOutStation = $scope.selectedService.supported_ride_type.includes(7);
        if($scope.selectedService.schedule_days_limit_return ) $scope.scheduleDaysLimitReturn = $scope.selectedService.schedule_days_limit_return ;
    }
    $scope.selectVehicle = function(data){
        $scope.selectedItems[0]=data;
        $scope.selectedVehicleService = data.vehicle_services;
        $scope.scheduledRideFare = (data.region_fare && data.region_fare.scheduled_ride_fare )? data.region_fare.scheduled_ride_fare : 0;
        taxPercent = data.region_fare ? data.region_fare.tax_percentage : 0;
        $scope.currency_symbol = (data.region_fare && data.region_fare.currency_symbol) ? data.region_fare.currency_symbol : data.region_fare.currency;
        if ($scope.selectedVehicleService.length == 0) {
            $scope.activeTab = 3;
        } else {
            $scope.activeTab = 2;
        }
    };
    $scope.selectedServiceItems = [];

    $scope.selectService = function(index,data){
        var service = document.getElementById('service'+index);
        if(service.classList.contains('selected')){
            service.classList.remove('selected');
            $scope.selectedServiceItems.forEach(function(item,index){
                if(item.id == data.id){
                    $scope.selectedServiceItems.splice(index,1);
                }
            });
        }else{
            service.classList.add('selected');
            $scope.selectedServiceItems.push(data);
        }
    };

    $('#scheduleDateTime').daterangepicker({
        
        "singleDatePicker": true,
        "timePicker": true,
        "timePicker24Hour": true,
        'timePickerIncrement' : 10,
        "startDate": moment().add(15, 'minutes'), // Start date set to 24 hours from now
        "minDate": moment().add(15, 'minutes'), // Min date set to 24 hours from now 
        "drops": "up",
        "locale": {
            "format": 'YYYY-MM-DD HH:mm',
            "applyLabel": $filter('translate')('homepage.apply'), // Custom text for Apply button
            "cancelLabel": $filter('translate')('homepage.cancel') // Custom text for Cancel button
        }
    }, function(start, end, label) {
    
      $scope.rideDateTime = start.format('YYYY-MM-DD HH:mm');
      $('#scheduleDateTime').val(start.format('YYYY-MM-DD HH:mm'));
      $scope.$apply();
    });

    $('#mobileNumber').intlTelInput({
        utilsScript: 'node_modules/intl-tel-input/build/js/utils.js',
        formatOnDisplay: false,
        nationalMode: false,
        initialCountry: initialCountry,
    });

    $('#passengerMobileNumber').intlTelInput({
        utilsScript: 'node_modules/intl-tel-input/build/js/utils.js',
        formatOnDisplay: false,
        nationalMode: false,
        initialCountry: initialCountry,
    });

    $translate('homepage.placeholder_phone_no').then(function(translatedText) {
        $('#mobileNumber').attr('placeholder', translatedText);
        $('#passengerMobileNumber').attr('placeholder', translatedText);

    });

    var toast;
    $scope.saveUserInfo = function(){
        if(!$scope.isGuestUser){
            if(!$scope.userName){
                createToast('Please enter name');
                return;
            }
            if(!$scope.userEmail){
                createToast('Please enter valid email');
                return;
            }
        }
        if(!$('#mobileNumber').intlTelInput("isValidNumber")){
            createToast('Please enter valid phone number');
            return;
        }

        if($scope.selectedItems[0].ride_type == 11 && !$scope.userFlightNumber){
            createToast('Please enter flight number');
            return;
        }
        
        $('#mobileNumber').prop('disabled' , true);

        var countryCode = $('#mobileNumber').intlTelInput("getSelectedCountryData").dialCode;

        var req = {
            latitude : $scope.pickup.latitude,
            longitude : $scope.pickup.longitude,
            login_type : 0,
            phone_no : $('#mobileNumber').intlTelInput("getNumber"),
            country_code : '+' + countryCode
        };
        var headers ={
            'x-jugnoo-session-id' : $scope.sessionId ,
            'x-jugnoo-session-identifier' : $scope.sessionIdentifier
        };

        generateOtp(req,headers);
    };

    function createToast(content){
        if(toast) {
            $mdToast.hide();
        }
        toast = $mdToast.show($mdToast.simple().position('bottom right').textContent(content));
    }

    function generateOtp(data,headers){
        API.postWithHeaders(AUTOS_URL + '/open/v1/generate_customer_login_otp',data,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                $scope.otp_sent =1;
                // $location.hash('enterOtpElement');
                // $anchorScroll();
                setTimeout(function(){
                    $('html, body').animate({
                        scrollTop: $('#' + 'enterOtpElement' ).offset().top
                    }, 1000);
                },400);
            }
        });
    }

    $scope.verifyOtp = function(otp){
        var headers ={
            'x-jugnoo-session-id' : $scope.sessionId ,
            'x-jugnoo-session-identifier' : $scope.sessionIdentifier
        };

        var countryCode = $('#mobileNumber').intlTelInput("getSelectedCountryData").dialCode;
        var req = {
            latitude : $scope.pickup.latitude,
            longitude : $scope.pickup.longitude,
            login_type : 0,
            phone_no : $('#mobileNumber').intlTelInput("getNumber"),
            country_code :'+' + countryCode,
            login_otp : otp
        };

        API.postWithHeaders(AUTOS_URL+ '/open/v1/verify_customer_otp',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                $scope.otpVerified =1;
                $scope.newSessionId = res.data.data.session_id;
                $scope.newSessionIdentifier = res.data.data.session_identifier;
                $scope.userIdentifier = res.data.data.user_identifier;
                if(!$scope.isGuestUser) $scope.updateUserProfile();
                createToast(res.data.message);
                // $location.hash('termsContainer');
                // $anchorScroll();
                $('html, body').animate({
                    scrollTop: $('#' + 'termsContainer' ).offset().top
                }, 1000);
            }else{
                createToast(res.data.error ? res.data.error : res.data.message);
            }
        });
    };


    $scope.updateUserProfile = function(){
        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier
        };

        var req = {
            updated_user_name : $scope.userName,
            updated_user_email : $scope.userEmail
        };
        API.postWithHeaders(AUTOS_URL + '/open/v1/update_user_profile',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                createToast(res.data.message);
            }else{
                createToast(res.data.error?res.data.error : res.data.message);
            }
        });

    };

    // var stripe = Stripe('pk_test_8RZQ6vistTt7kqiEveFVjQMT');
    // var elements = stripe.elements();
    // let cardNumberElement, cardExpiryElement, cardCvcElement;   

    // var style = {
    //     base: {
    //         iconColor: '#666EE8',
    //         color: '#31325F',
    //         lineHeight: '40px',
    //         padding : '10px 20px',
    //         fontWeight: 300,
    //         fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //         fontSize: '20px',
    //         '::placeholder': {
    //             color: '#CFD7E0'
    //         }
    //     },
    // };

    // cardNumberElement = elements.create('cardNumber', { style: style , showIcon: true,
    //     iconStyle: 'solid'});
    // cardNumberElement.mount('#card-number');

    // cardExpiryElement = elements.create('cardExpiry', { style: style });
    // cardExpiryElement.mount('#card-expiry');

    // cardCvcElement = elements.create('cardCvc', { style: style });
    // cardCvcElement.mount('#card-cvc');


    $scope.openPaymentModal = function(mode){
        $scope.selectedPaymentMode = mode;
        $('#addCardModal').modal('show');
    };
   
    $scope.showAddCardSection = 0;

    $scope.addCard = function(){
        if($scope.stripe3dEnabled){    
            stripe.confirmCardSetup($scope.clientSecret, {
                payment_method: {
                    card: cardNumberElement,
                }
            }).then(function(res){
                if(res.setupIntent.status == 'succeeded'){
                    $scope.setupIntentId = res.setupIntent.id;
                    $scope.confirmCardSetup($scope.setupIntentId);
                }
                else{
                    createToast(res.setupIntent.status || 'Error');
                }
            }).catch(function(res){
                createToast('Error');
            });
        }else{
            stripe.createToken(cardNumberElement).then(function(result){
                if (result.token) {
                    var obj = {
                      stripe_token: result.token.id,
                      card_id: result.token.card.id,
                      last_4: result.token.card.last4,
                      exp_month: result.token.card.exp_year,
                      brand: result.token.card.brand
                    };
                    this.non3dAddCard(obj);
                } else {
                createToast(res.setupIntent.status || 'Error')
                }        
            })
        }
    }

    $scope.fetchWalletDetails = function(){
        var req = {
            latitude : $scope.pickup.latitude,
            longitude : $scope.pickup.longitude,
        }

        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }
    
        API.postWithHeaders(AUTOS_URL + '/open/v1/fetch_wallet_balance',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                $scope.cardsData = res.data.data.stripe_cards;
                $scope.stripeCards = res.data.data.stripe_cards;
                $scope.squareCards = res.data.data.square_cards;
                var stripeConfig = res.data.data.payment_mode_config_data.filter(function(item){
                    return item.name == 'stripe_cards'
                })
                var squareConfig = res.data.data.payment_mode_config_data.filter(function(item){
                    return item.name == 'square_cards'
                })
                console.log("square config ::::::", squareConfig);
                $scope.isStripeEnabled = stripeConfig.length > 0 ? stripeConfig[0].stripe_3d_enabled ||stripeConfig[0].enabled : 0;
                $scope.isSquareEnabled = squareConfig.length > 0 ? squareConfig[0].enabled : 0;
                $scope.paymentModeLoaded = true;
            }
            else createToast(res.data.error ? res.data.error : res.data.message)
        })
    }


    $scope.deleteStops = function(index){
        $scope.stopsFields.splice(index, 1);
    }

    $scope.getSecretKey = function(index){
        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        var req ={}

        if(!$scope.stripeKey){
            return ;
        }

        API.postWithHeaders(AUTOS_URL + '/open/v1/add_card_3d',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS) $scope.clientSecret = res.data.data.client_secret;
            else createToast(res.data.error ? res.data.error : res.data.message)

        })
    }

    $scope.confirmCardSetup = function(id){
        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        var req  ={
            setup_intent_id : id
        }

        API.postWithHeaders(AUTOS_URL + '/open/v1/confirm_card_3d',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS) {
                  $scope.fetchWalletDetails();
                  $scope.resetListCardModalElements();
                  createToast(res.data.message ? res.data.message : res.data.error);
            }
            else createToast(res.data.error ? res.data.error : res.data.message)
        })
    }


    $scope.non3dAddCard = function(tokenObj){
        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        var req  ={
            stripe_token: tokenObj.stripe_token,
            card_id: tokenObj.card_id,
            last_4: tokenObj.last_4,
            exp_month: tokenObj.exp_month,
            exp_year: tokenObj.exp_year,
            brand: tokenObj.brand,
            payment_option: 9,
            is_delete: 0
        }

        API.postWithHeaders(AUTOS_URL+'/open/v1/add_card',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS) {
                  $scope.fetchWalletDetails();
                  $scope.resetListCardModalElements();
                  createToast(res.data.message ? res.data.message : res.data.error);
            }
            else createToast(res.data.error ? res.data.error : res.data.message)
        })
    }


    $scope.selectCard = function(index, mode){
        $scope.selectedCardNumber = index;
        $scope.card_id = mode == 'square' ? $scope.squareCards[index].id : $scope.cardsData[index].id;
        $scope.selectedCardData = mode == 'square' ? $scope.squareCards[index] : $scope.cardsData[index];
        $scope.selectPaymentMode((mode || 'card'));
        $('#addCardModal').modal('hide');
    }

    $scope.editNumber = function(){
        $scope.otp_sent = 0;
        $scope.otpVerified = 0;
        $('#mobileNumber').prop('disabled' , false);
    }

    $scope.scheduleRide = function(){
        var req ={
            region_id : $scope.selectedItems[0].region_id,
            service_id : $scope.servicesData[0].id,
            // preferred_payment_mode : 9,
            // pool_fare_id : parseInt($scope.selectedItems[0].region_fare.pool_fare_id),
            // card_id : $scope.card_id,
            //booking_type : $scope.selectedBookingType || 1,
            vehicle_type : $scope.selectedItems[0].vehicle_type,
            login_type : 0,
            latitude : $scope.pickup.latitude,
            longitude : $scope.pickup.longitude,
            pickup_location_address : $scope.pickup.address,
            pickup_time : pickUpCityOffset ? ( moment($scope.rideDateTime).subtract(pickUpCityOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss')) : (moment($scope.rideDateTime).utc().format('YYYY-MM-DD HH:mm:ss') ),
            op_drop_latitude : $scope.drop.latitude,
            op_drop_longitude : $scope.drop.longitude,
            drop_location_address : $scope.drop.address,
        }
        if($scope.selectedItems[0].region_fare && $scope.selectedItems[0].region_fare.pool_fare_id){
            req.pool_fare_id = parseInt($scope.selectedItems[0].region_fare.pool_fare_id);
        }

        if( $scope.bookingForSomeoneElseEnabled && $scope.bookingForSomeoneElse){
            if(!$scope.passengerName){
                createToast('Please enter passenger name');
                return;
            }
            if(!$('#passengerMobileNumber').intlTelInput("isValidNumber")){
                createToast('Please enter valid passenger mobile number');
                return;
            }
            req.customer_name = $scope.passengerName;
            req.customer_phone_no = $('#passengerMobileNumber').intlTelInput("getNumber");
        }
        if($scope.showPassengerLuggageField ){
            if(!$scope.passengerCount){
                createToast('Please enter number of passengers');
                return;
            }
            req.passengers_count = Number($scope.passengerCount);
            if($scope.luggageCount){
                req.luggage_count = Number($scope.luggageCount);
            }
        }
        
        if($scope.showRoundTrip && $scope.isRoundTrip && $scope.returnDateTime){
            req.return_trip = 1;
            req.return_time = pickUpCityOffset ? ( moment($scope.returnDateTime).subtract(pickUpCityOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss')) : (moment($scope.returnDateTime).utc().format('YYYY-MM-DD HH:mm:ss') );
        }

        if($scope.userNotes){
            req.customer_note = $scope.userNotes;
        }

        if($scope.userFlightNumber){
            req.flight_number = $scope.userFlightNumber;
        }
        if(($scope.selectedPaymentMode == 'card' || $scope.selectedPaymentMode == 'square') && !$scope.card_id){
            createToast('Please select a card to book ride if you want to book through card payment method')
            return;
        }else if($scope.selectedPaymentMode == 'card' && $scope.card_id){
            req.card_id = $scope.card_id;
            req.preferred_payment_mode = 9;
        }else if($scope.selectedPaymentMode == 'square' && $scope.card_id){
            req.card_id = $scope.card_id;
            req.preferred_payment_mode = 73;
        }else if(!$scope.removeCashPayments){
            req.preferred_payment_mode = 1;
        }else{
            createToast('Please select payment method to book ride');
            return;
        }
        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        API.postWithHeaders(AUTOS_URL + '/open/v1/insert_pickup_schedule' , req , headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS){
                createToast(res.data.message);
                $('#rideBookedModal').modal('show');
            }else{
                createToast(res.data.error ? res.data.error : res.data.message);
            }
        })
    }

    $scope.selectPaymentMode = function(mode){
        $scope.selectedPaymentMode = mode;
        if(mode == 'cash'){
            $scope.selectedCardNumber = '';
            $scope.card_id = '';
        }
    }

    $scope.deleteCard = function(id, mode){
        if(mode == 'square'){
            deleteSquareCard(id);
            return;
        }
        var req ={
            is_delete : 1,
            card_id : id,
            payment_option : 9
        }
        
        var headers ={
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        API.postWithHeaders(AUTOS_URL + '/open/v1/delete_customer_card',req,headers).then(function(res){
            if(res.data.flag == responseStatus.SUCCESS ||res.data.flag == 144 ){
                if($scope.card_id == id){
                    $timeout(function() {
                        $scope.card_id = '';
                        $scope.selectedCardNumber = '';
                    }, 0);
                }
                $scope.fetchWalletDetails()
                createToast(res.data.message);
            } 
            else createToast(res.data.error ? res.data.error : res.data.message);
        })
    }


    var sum;
    $scope.calculateFare = function(){
        sum = 0 ;
        sum += parseInt($scope.selectedItems[0].region_fare.fare);
        if($scope.selectedServiceItems.length > 0){
            for(var i = 0 ; i < $scope.selectedServiceItems.length ; i++){
                sum += parseInt($scope.selectedServiceItems[i].customer_fare);
            }
        }
        $scope.scheduledRideFare = $scope.selectedItems[0].region_fare.scheduled_ride_fare;
        $scope.subTotal = parseInt(sum);
        $scope.taxValue = parseFloat((taxPercent/100) * sum).toFixed(2);
        $scope.totalFare = (parseFloat($scope.subTotal) + parseFloat($scope.taxValue)).toFixed(2);
    }


    $scope.reset = function(){
       document.getElementById('otp').value = '';
    }

    $('#addCardModal').on('hidden.bs.modal', function (e) {
        $scope.resetListCardModalElements();
    });

    $scope.resetListCardModalElements = function(){
        $scope.showAddCardSection = 0;
        cardNumberElement && cardNumberElement.clear();
        cardExpiryElement && cardExpiryElement.clear();
        cardCvcElement && cardCvcElement.clear();
    }

    $scope.setTab = function(tab) {
        if (tab <= $scope.activeTab) {
            $scope.activeTab = tab;
        }
    };

    $scope.selectBookingType = function(type){
        $scope.selectedBookingType = type;
        $scope.$apply();
    }

    $('#rideBookedModal').on('hidden.bs.modal', function (e) {
        window.location.reload();
    });

    $scope.selectWhereToBook = function(type){
        if(type == 'online'){
            $scope.splitFlow = false;
        }else{
            window.location.href = "https://www.limoz.app/download/";
        }
    }

    $scope.openAppLink = function(type){
        if(type == 'android'){
            window.open('https://play.google.com/store/apps/details?id=com.jugnoo.autos');
        }else if(type == 'ios'){    
            window.open('https://apps.apple.com/in/app/jugnoo-autos/id1488608006'); 
        }
        $state.reload();
    }

    $scope.closeModal = function(){
        window.location.reload();
    }
    // init();

    $scope.toggleRoundTrip = function(state){
        if(!$scope.rideDateTime) {
           createToast('Please select a ride date and time first');
            return;
        }
        if(state){
            $scope.returnDateTime = moment(); 
            $('#returndatetimepicker').daterangepicker({
                "singleDatePicker": true,
                "timePicker": true,
                "timePicker24Hour": true,
                'timePickerIncrement' : 10,
                "startDate": moment($scope.rideDateTime).add($scope.scheduleDaysLimitReturn, 'days'), // Start date set to scheduledDaysLimitReturn days from now
                "minDate": moment($scope.rideDateTime).add($scope.scheduleDaysLimitReturn, 'days'), // Min date set to scheduledDaysLimitReturn days from now
                "drops": "up",
                "locale": {
                    "format": 'YYYY-MM-DD HH:mm',
                    "applyLabel": $filter('translate')('homepage.apply'), // Custom text for Apply button
                    "cancelLabel": $filter('translate')('homepage.cancel') // Custom text for Cancel button
                }
            }, function(start, end, label) {
                $scope.returnDateTime = start.format('YYYY-MM-DD HH:mm');
                $('#returndatetimepicker').val(start.format('YYYY-MM-DD HH:mm'));
                $scope.$apply();
            });
        }
    }

    var payments, card;
    function initializeSquare() {
        if (typeof window.Square === 'undefined') {
            throw new Error('Square.js SDK not loaded');
        }

        if(!(squareCreds[$scope.businessId] && squareCreds[$scope.businessId].applicationId && squareCreds[$scope.businessId].locationId)) {
            createToast('Square credentials not found for this operator');
            return;
        }

        var applicationId = squareCreds[$scope.businessId].applicationId;
        var locationId = squareCreds[$scope.businessId].locationId;
        if(!payments) {
            payments = window.Square.payments(applicationId, locationId);

            payments.card().then(function (createdCard) {
                card = createdCard;
                return card.attach('#card-container');
            })
            .then(function () {
                $('#addCardModal').modal('hide');
            })
            .catch(function (error) {
                console.error('Square initialization failed:', error);
                createToast('Square initialization failed: ' + error.message);
            });
        }else{
            card.destroy();
            payments.card().then(function (createdCard) {
                card = createdCard;
                return card.attach('#card-container');
            })
            .catch(function (error) {
                console.error('Square initialization failed:', error);
                createToast('Square initialization failed: ' + error.message);
            });
           $('#addCardModal').modal('hide');
        } 
    }

    $scope.openSquarePaymentModal = function(id){
        if(id == 'squareAddCardModal'){
            initializeSquare();
        }
        setTimeout(function(){
            $((id ? '#'+id : '#addCardModal')).modal('show');
        },300)
    }

    $scope.submitSquareCard = function(){
           if (!card) {
            toast.createToast('error','Card not initialized. Please refresh and try again.');
            return;
        }
        
        // Create payment token
        card.tokenize().then(function(tokenResult) {
            if (tokenResult.status === 'OK') {
                createToast('Card token created successfully.');
                addSquareCardRequest(tokenResult.token);
            } else {
                // Handle tokenization errors
                var errorMessage = 'Card validation failed. Please check your card details.';
                if (tokenResult.errors && tokenResult.errors.length > 0) {
                    errorMessage = tokenResult.errors[0].message;
                }
                createToast( errorMessage);
            }
        }).catch(function(error) {
            console.error('Tokenization error:', error);
            createToast('Unable to process card. Please try again.');
        });
    }

    function addSquareCardRequest(token) {
        var req = {
            card_token: token,
        };

        var headers = {
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        API.postWithHeaders(AUTOS_URL + '/open/v1/add_sqaure_card', req ,headers).then(function (res) {
            if (res.data.flag == responseStatus.SUCCESS) {
                createToast(res.data.message);
                $('#squareAddCardModal').modal('hide');
                $scope.fetchWalletDetails();
                $scope.openSquarePaymentModal();
            } else {
                createToast( res.data.error ? res.data.error : res.data.message);
            }
        });
    }

    function deleteSquareCard(id){
        var req = {
            card_id: id
        };

        var headers = {
            'x-jugnoo-session-id' : $scope.newSessionId ,
            'x-jugnoo-session-identifier' : $scope.newSessionIdentifier,
        }

        API.postWithHeaders(AUTOS_URL + '/open/v1/delete_square_card', req, headers).then(function (res) {
            if (res.data.flag == responseFlags.SUCCESS) {
                createToast(res.data.message);
                $scope.fetchWalletDetails();
            } else {
                createToast(res.data.error ? res.data.error : res.data.message);
            }
        });
    }
})

