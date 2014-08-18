var baseURL = 'http://localhost:8888';

function loadRestaurants () {
	$.ajax({
		url: baseURL + "/restaurants",
		type: "GET"
	})
	.done(function (result) {
		$('#restaurantList').empty();
		var restaurantsArray = result.entities;
		$(restaurantsArray).each(function (e) {
			$('#restaurantList').append('<li><a href="#page-detail" data-id='+ $(this).get(0).uuid +'><h4>' + $(this).get(0).name +'</h4></a></li>');
		});
		$('#restaurantList').listview('refresh');
	});
}
function showDetails (id) {
	$('#detail-name, #detail-address').empty();
	$('#detail-review-list').empty();
	$.ajax({
		url: baseURL + "/restaurants/" + id,
		type: "GET"
	})
	.done(function (result) {
		console.log(result)
		var restaurant = result.restaurants.entities[0];
		var reviews = result.details[0].entities;
		var rating = result.details[1];
		$('#detail-name').text(restaurant.name);
		$('#detail-address').append(restaurant.address + '<span class="block">' + restaurant.city + ', ' + restaurant.state + '</span>');
		$('#detail-rating').text(rating);
		console.log(reviews);
		showGoogleMap(restaurant.location.latitude, restaurant.location.longitude);
		$(reviews).each(function (e) {
			$('#detail-review-list').append('<li><h4>' + $(this).get(0).title + '</h4><p><span class="block stars">'+ $(this).get(0).rating + '</span><i class="block">' + $(this).get(0).reviewer + '</i>' + $(this).get(0).body +'</p></li>');
		});
		$('#detail-review-list').listview('refresh');
	});
}

function showGoogleMap (lat, lng) {
		var latlng = new google.maps.LatLng(lat,lng);   
        var options = { zoom: 11, center: latlng, disableDefaultUI: false, mapTypeId: google.maps.MapTypeId.ROADMAP, draggable: true };
        var map = new google.maps.Map(document.getElementById('detail-map'), options);
	}

$(function () {
	loadRestaurants();

	$('#restaurantList').on('click', 'a', function (e) {
		var itemID = $(this).attr('data-id');
		showDetails(itemID);
	})
})