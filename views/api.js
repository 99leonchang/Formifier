/* Define API endpoints once globally */
var url = '/api';
//var url= 'https://calm-beach-46116.herokuapp.com/api';
$.fn.api.settings.api = {
    'authenticate' : url+'/authenticate',
    'get forms' : url+'/forms',
    'get single form' : url+'/forms/{id}',
    'get users' : url+'/users',
    'update tab' : url+'/{$tab}/{id}',
    'create form' : url+'/forms/create'
};

//API Function
var token;
function api(action, method, parser, data) {
    var api_url = $.fn.api.settings.api[action];
    $.ajax({
        url: api_url, // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
        type: method, // The HTTP Method, can be GET POST PUT DELETE etc
        data: data, // Additional parameters here
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if(data.success == false) displayError(data.message);
            else parser(data);
        },
        error: function(err) { console.log(err); },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', token);
        }
    });
}

function custom_api(action, method, parser, data) {
    var api_url = url+action;
    $.ajax({
        url: api_url, // The URL to the API. You can get this by clicking on "Show CURL example" from an API profile
        type: method, // The HTTP Method, can be GET POST PUT DELETE etc
        data: data, // Additional parameters here
        dataType: 'json',
        success: function(data) {
            console.log(data);
            if(data.success == false) displayError(data.message);
            else parser(data);
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