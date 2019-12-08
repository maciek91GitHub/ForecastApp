/**
 * REQUEST_URL note- I wasn't able to get forecast for more than 5 days because it's possible only for paid accouts (mine is free).
 * This request gets forecast for every next 3 hours in the same location. I was trying to get data for 8 days (by setting cnt to 64),
 * but I was getting max 39 measurements, not 64. So this script simulates forecast data and every 3 hours work as 1 day.
 * 
 * Maciej Baryła
 */
var REQUEST_URL = "http://api.openweathermap.org/data/2.5/forecast?cnt=8&units=metric&callback=weatherResponseHandler&appid=35288f54ead43f7d70d1f61ae98fc47c&q=";
var LOCATION_COOKIE_NAME = "location";
var INFO_COOKIE_NAME = "cookie_info";
var IMG_URL = "./img/";
var scriptEl;
var locationVal;
var cookiesInfoVal;
var startContainerEl;
var forecastContainerEl;
var loadingPanelEl;
var forecastDataContainerEl;
var navSearchEl;
var starterView = true;
var forecastData;

function sendRequest(location) {
  if(scriptEl){
    scriptEl.remove();
  }
  scriptEl = $(document.createElement("script"));
  scriptEl.attr("src", REQUEST_URL + location);
  $(document.body).append(scriptEl);
}

function weatherResponseHandler(res) {
  forecastData = res;
  console.log(forecastData);
  document.cookie = LOCATION_COOKIE_NAME + "=" + forecastData.city.name;
  distributeDaysData(forecastData.list);
}

function distributeDaysData(data){
  var dayCardEls = $("#daysPanel .card");
  var day = new Date();
  $("#locationHeaer").text(forecastData.city.name);
  for(var i = 0; i < dayCardEls.length; i++){
    if(day.toDateString().indexOf("Sun") != -1){
      dayCardEls.eq(i).addClass("text-danger");
    }
    dayCardEls.eq(i).find(".card-header").text(day.toDateString());
    dayCardEls.eq(i).find(".card-img-top").attr("src", IMG_URL + data[i].weather[0].icon.substring(0, 2) + ".png");
    dayCardEls.eq(i).find(".card-text").text(Math.floor(data[i].main.temp) + "°C");
    dayCardEls.eq(i).find(".temp-indicator").css("height", Math.floor(data[i].main.temp));
    day.setDate(day.getDate() + 1);
  }
  updateDetails(dayCardEls.eq(0));
  loadingPanelEl.hide();
  forecastDataContainerEl.fadeIn(500);

  
}

function updateDetails(dayEl){
  var dayIndex = dayEl.attr("data-day-no");
  var dayData = forecastData.list[dayIndex];
  $(".card").removeClass("bg-dark");
  $(".card").removeClass("text-light");
  dayEl.addClass("bg-dark");
  dayEl.addClass("text-light");
  $("#detailsIcon").attr("src", IMG_URL + dayData.weather[0].icon.substring(0, 2) + ".png");
  $("#detailsTemp").text(Math.floor(dayData.main.temp) + "°C");
  $("#weatherInfo").text(dayData.weather[0].description.charAt(0).toUpperCase()
    + dayData.weather[0].description.slice(1));
  $("#maxTempInfo").text(Math.ceil(dayData.main.temp_max));
  $("#humidityInfo").text(dayData.main.humidity);
  $("#pressureInfo").text(dayData.main.pressure);
  $("#windInfo").text(dayData.wind.speed);
}

function readCookies(){
  var cookies = document.cookie.split(';');
  for(var i = 0; i <cookies.length; i++) {
    if(cookies[i].indexOf(LOCATION_COOKIE_NAME) !== -1){
      locationVal = cookies[i].substring(cookies[i].indexOf("=") + 1);
    }
    if(cookies[i].indexOf(INFO_COOKIE_NAME) !== -1){
      cookiesInfoVal = cookies[i].substring(cookies[i].indexOf("="));
    }
  }
}

function showForecastView(){
  navSearchEl.fadeIn(500);
  forecastContainerEl.fadeIn(500);
}
function hideForecastView(){
  navSearchEl.hide();
  forecastContainerEl.hide();
  forecastDataContainerEl.hide();
  loadingPanelEl.show();
}

function setDaysPanelLayout(){
  if (window.innerWidth < 1280) {
    $("#daysPanel").removeClass("card-group");
  } else {
    $("#daysPanel").addClass("card-group");
  }
}

$( document ).ready(function() {
  startContainerEl = $("#startContainer");
  forecastContainerEl = $("#forecastContainer");
  forecastDataContainerEl = $("#forecastDataContainer");
  loadingPanelEl = $("#loadingPanel");
  navSearchEl = $("#navSearch");


  setDaysPanelLayout();
  $(window).on('resize', function(){
    setDaysPanelLayout();
  });

  $("#startSearchBtn").on("click", function() {
    sendRequest($("#location").val());
    startContainerEl.hide();
    showForecastView();
    starterView = false;
  });

  $("#navSearchBtn").on("click", function() {
    sendRequest($("#navLocation").val());
    showForecastView();
  });

  $("#navIcon, #navTitle").on("click", function() {
    if(!starterView){
      hideForecastView();
      starterView = true;
      startContainerEl.fadeIn(500);
    }
  });

  $("#daysPanel .card").on("click", function() {
    updateDetails($(this));
  });

  readCookies();
  if(locationVal){
    $("#location").val(locationVal);
  }

  hideForecastView();

});