var baseURL = 'http://localhost:8888';

function loadRestaurants() {
    $.ajax({
        url: baseURL + "/restaurants",
        type: "GET"
    })
        .done(function(result) {
            $('#restaurantList').empty();
            var restaurantsArray = result.entities;
            $(restaurantsArray).each(function(e) {
                $('#restaurantList').append('<li><a href="#page-detail" data-id=' + $(this).get(0).restID + '><h4>' + $(this).get(0).name + '</h4></a></li>');
            });
            $('#restaurantList').listview('refresh');
        });
}

function showDetails(id) {
    $('#detail-name, #detail-address').empty();
    $('#detail-review-list').empty();
    $('#detail-name').attr('data-restID', '');
    $.ajax({
        url: baseURL + "/restaurants/" + id,
        type: "GET"
    })
        .done(function(result) {
            console.log(result)
            var restaurant = result.restaurants.entities[0];
            var reviews = result.details[0].entities;
            var rating = result.details[1];
            $('#detail-rating').html(rating + '<span class="star-rating" data-rating='+ rating +' style="width:'+ (Number(rating)*20) +'px;margin-left:20px"></span>');
            $('#detail-name').text(restaurant.name).attr("data-restID", restaurant.restID);
            $('#detail-address').append(restaurant.address + '<span class="block">' + restaurant.city + ', ' + restaurant.state + '</span>');

            console.log(reviews);
            showGoogleMap(restaurant.location.latitude, restaurant.location.longitude);
            $(reviews).each(function(e) {
                $('#detail-review-list').append('<li><h4><span class="stars"><span class="star-rating" data-rating='+ $(this).get(0).rating +'></span></span>' + $(this).get(0).title + '</h4><p><i class="block">' + $(this).get(0).reviewer + '</i>' + $(this).get(0).body + '</p></li>');
                var stars = $(this).get(0).rating * 20;
                console.log(stars)
                $('#detail-review-list li:last .star-rating').css('width', stars +'px');
            });
            $('#detail-review-list').listview('refresh');
        });
}

function showGoogleMap(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    var options = {
        zoom: 11,
        center: latlng,
        disableDefaultUI: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggable: true
    };
    var map = new google.maps.Map(document.getElementById('detail-map'), options);
}

function addReview() {
    // $('#form-uuid').val($('#detail-name').attr('data-restID'));
    var payload = {
        title: $('#form-title').val(),
        reviewer: $('#form-email').val(),
        rating: Number($('#form-rating').val()),
        body: $('#form-desc').val(),
        restID: Number($('#form-uuid').val())
    }
    $.ajax({
        url: baseURL + "/reviews",
        type: "POST",
        headers: {
            'Content-Type':'application/json'
        },
        data: JSON.stringify(payload)
    })
        .done(function(result) {
            // showDetails($('#form-uuid').val());
            history.back();
        })
}

$(function() {
    // loadRestaurants();
    console.log('yep')
    // $('#restaurantList').on('click', 'a', function(e) {
    //     var itemID = $(this).attr('data-id');
    //     console.log(itemID)
    //     // showDetails(itemID);
    // });

    $('#form-add-item').on('click', '#btn-submit', function() {
        addReview();
        return false;
    })
// setTimeout(function () {
//     console.log('here')
//     $('#restaurantList').addClass('boo')
//     $('#restaurantList').listview('refresh')
// }, 2000)

})