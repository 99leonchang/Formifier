/* Define API endpoints once globally */
var url = '/api';
//var url= 'https://calm-beach-46116.herokuapp.com/api';
$.fn.api.settings.api = {
    'authenticate' : url+'/authenticate',
    'logout' : url+'/logout',
    'create user' : url+'/users/create',
    'confirm user' : url+'/users/confirm',
    'resend' : url+'/users/resend',
    'get forms' : url+'/forms',
    'get single form' : url+'/forms/{id}',
    'get users' : url+'/users',
    'update tab' : url+'/{$tab}/{id}',
    'create form' : url+'/forms/create'
};

//API Function
var token;
function heartbeat() {
    $.ajax({
        url: url+'/heartbeat',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if(data.success == false){
                window.location.replace("/login");
            }
        },
        error: function(err) { console.log(err); },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', token);
        }
    });
}

function api(action, method, callback, data) {
    var api_url = $.fn.api.settings.api[action];
    $.ajax({
        url: api_url, // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
        type: method, // The HTTP Method, can be GET POST PUT DELETE etc
        data: data, // Additional parameters here
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if(data.success == false) displayError(data.message);
            else callback(data);
        },
        error: function(err) { console.log(err); },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', token);
        }
    });
}

function custom_api(action, method, callback, data) {
    var api_url = url+action;
    $.ajax({
        url: api_url, // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
        type: method, // The HTTP Method, can be GET POST PUT DELETE etc
        data: data, // Additional parameters here
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if(data.success == false) displayError(data.message);
            else callback(data);
        },
        error: function(err) { console.log(err); },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', token);
        }
    });
}

function displayError(message){
    console.log(message);
    $('#error_message').addClass('ui negative message').html('<div class="header">Error!</div><p>' + message + '</p>');
}