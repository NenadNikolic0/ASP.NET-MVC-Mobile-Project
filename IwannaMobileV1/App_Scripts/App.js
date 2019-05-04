
//Backend endpoint 
var serviceEndPoint = "/Home/";

//Empty service value from local storage 
localStorage["choosenservice"] = 0;

// RequestId declarations
var RequestId;

 
//Main function that will execute after DOM is loaded 
$(document).ready(function ()
{
    // Call all init functions
    InitLogin();
    HaircutService();
    Nails();
    Salon();
    SetCoordinates();
    InsertRequest();
    InitLoginVendor();
    SetDistance();
    Refresh_Page_Vendor();
    Vendor_Send_Offer();
    Vendor_Cancel_Offer();
    Refresh_Page_Customer();
    Customer_Accept_Offer();
    Customer_Cancel_Offer();
  
    //Function will fire when Location page shows
    $(document).on("pageshow", "#Set_Location", function (event, ui) {

        //Call getLocation() function which will return coordinates
        getLocation();
        
    });


    //Function will fire when home page shows 
    $(document).on('pageshow', '#Home_screen', function (event, ui) {
        
        //Empty offers div
        $("#current_offers_vendor").empty();
    
        //Ajax request for getting active offers
        $.get("/Home/getActiveOffers", function (data) {
            //When callback is received check result , if data is successfully received fill offer container
            if (data.Result == true) {
                //Go throught offer data and append to div
                $.each(data.listaponuda, function (i, l) {
                    $("#current_offers_vendor").append("<p  class='vendoractiveoffers' idcustomer='" + l.idcustomer + "' service='" + l.service + "' description='" + l.description + "' name='" + l.name + "' address='" + l.address + "' phone='" + l.phone + "' email='" + l.email + "' custreqid='" + l.customerrequestid + "' vendorid='" + l.vendorid + "'>" + l.service + " - " + l.name + "</p>");
                });
            }

        });

        //Reset latitude and longitude
        lat = 0;
        lng = 0;

        return false;

    });

    

    //Function will fire when vendor enters home screen 
    $(document).on('pageshow', '#Home_screen_Vendor', function (event, ui) {

        //Empty client requests 
        $("#current_requests_vendor").empty();
        $("#vendors_offer_description").val("");

        //Ajax request to get data from server
        $.get("/Service/getActiveRequests", function (data) {

            //When callback is received and if data is true, go throught data list and add requests into div
            if (data.Result == true) {
                $.each(data.alista, function (i, l) {
                    $("#current_requests_vendor").append("<p  class='vendoractiverequests' idreg='" + l.requestid + "' service='" + l.service + "' customer='" + l.customer + "' address='" + l.address + "' email='" + l.email + "' pol='" + l.pol + "' startend='" + l.startend + "'>" + l.service + " - " + l.customer + "</p>");
                });
            }

        });

        return false;


    });



    //User click on active requests button 
    $(document).on("click", ".vendoractiverequests", function (event) {

        //Fill locale storage with data from form 
        localStorage["CustomerRequestID"] = $(this).attr("idreg");
        localStorage["ServiceType"] = $(this).attr("service");
        localStorage["Customer"] = $(this).attr("customer");
        localStorage["Address"] = $(this).attr("address");
        localStorage["Email"] = $(this).attr("email");
        localStorage["Gender"] = $(this).attr("pol");
        localStorage["StartEnd"] = $(this).attr("startend");

        //Redirect to details page 
        $.mobile.changePage("#vendor_customer_details", "slide");
        return false;
    });


    //Function will fire when clients page with details is shown
    $(document).on('pageshow', '#vendor_customer_details', function (event, ui) {

        //Empty previous data 
        $("#Customer_Request_Detail_Window").empty();

        //Add current customer data to div 
        $("#Customer_Request_Detail_Window").append("<span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Traženi servis:</span>&nbsp;" + localStorage["ServiceType"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>U periodu:</span>&nbsp;" + localStorage["StartEnd"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Ime i prezime klijenta:</span>&nbsp;" + localStorage["Customer"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Email klijenta:</span>&nbsp;" + localStorage["Email"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Adresa klijenta:</span>&nbsp;" + localStorage["Address"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Pol klijenta:</span>&nbsp;" + localStorage["Gender"] + "<div class='customer_request_border'></div>");


    });

    /**
     * 
     *
    **/
    $(document).on("click", ".vendoractiveoffers", function (event) {

        //Set form data to localstorage 
        localStorage["idcustomeroffer"] = $(this).attr("idcustomer");
        localStorage["serviceoffer"] = $(this).attr("service");
        localStorage["descriptionoffer"] = $(this).attr("description");
        localStorage["nameoffer"] = $(this).attr("name");
        localStorage["addressoffer"] = $(this).attr("address");
        localStorage["phoneoffer"] = $(this).attr("phone");
        localStorage["emailoffer"] = $(this).attr("email");
        localStorage["custreqidoffer"] = $(this).attr("custreqid");
        localStorage["vendoridoffer"] = $(this).attr("vendorid");

        //Redirect to offer details page 
        $.mobile.changePage("#vendor_offers_details", "slide");
        return false;
    });


    //Function will fire when custoner opens vendor details page 
    $(document).on('pageshow', '#vendor_offers_details', function (event, ui) {

        //Empty previous data
        $("#Vendor_Detail_Window").empty();

        //Add new data to div 
        $("#Vendor_Detail_Window").append("<span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Traženi servis:</span>&nbsp;" + localStorage["serviceoffer"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Naziv salona:</span>&nbsp;" + localStorage["nameoffer"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Adresa salona:</span>&nbsp;" + localStorage["addressoffer"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Telefon:</span>&nbsp;" + localStorage["phoneoffer"] +
            "<br/> <span style='color:#8cc63f;font-weight:bold;line-height:30px;'>Email:</span>&nbsp;" + localStorage["emailoffer"] + "<div class='customer_request_border'></div>");

        //Set description value to value from local storage 
        $("#vendors_offer_description2").val(localStorage["descriptionoffer"]);
    });

    $(document).on('pageshow', '#accepted_requests_vendor', function (event, ui) {

        $("#Accepted_requests_vendor").empty();
        $.get("/Service/getAcceptedRequests", function (data) {
            if (data.Result == true) {
                $.each(data.listrequest, function (i, l) {
                    $("#Accepted_requests_vendor").append("<p class='Accepted_requests_vendor'>" + l.service + " - " + l.name + " - " + l.datetime + "</p>");
                });
            }



        });

        return false;

    });

    $(document).on('pageshow', '#accepted_vendors_offer', function (event, ui) {

        $("#accepted_services_div").empty();
        $.get("/Home/getAcceptedServices", function (data) {
            if (data.Result == true) {
                $.each(data.listrequest, function (i, l) {
                    $("#accepted_services_div").append("<p class='Accepted_requests_vendor'>" + l.service + " - " + l.name + " - " + l.datetime + "</p>");
                });
            }



        });

        return false;

    });

  
   
});

function InitLogin()
{
    $('#login-loginbtn').click(function ()
    {
        var user = $('#login-username').val();
        var pass = $('#login-pass').val();

        var loginModel = { Username: user, Password: pass };

        $.mobile.loading("show");
        $.post(serviceEndPoint + "Login", loginModel, function (data) {
            $.mobile.loading("hide");
            if (data.Result == false) {
                $('#login-validation').text("Pogrešno korisničko ime ili šifra!");
            } //Ulogovan
            else {
                $.mobile.changePage("#Home_screen", "slide");
                $('#login-validation').text("");
                $('#login-username').val("");
                $('#login-pass').val("");

            }
        });
        return false;
    });
}




   




function HaircutService() {
    //OnHaircutDemand
    $('#Haircut').click(function () {
        localStorage["choosenservice"] = 1;
        $.mobile.changePage("#Set_Location", "slide");
        return false;
    });
}

function Nails() {
    //OnNailsDemand
    $('#Nails').click(function () {
        localStorage["choosenservice"] = 2;
        $.mobile.changePage("#Set_Location", "slide");
        return false;
    });
}

function Salon() {
    //OnNailsDemand
    $('#Salon').click(function () {
        localStorage["choosenservice"] = 3;
        $.mobile.changePage("#Set_Location", "slide");
        return false;
    });
}

function SetCoordinates() {

    $('#Set_Location_Button').click(function () {
        
        $.mobile.changePage("#Set_Distance", "slide");
        return false;
    });
}

function InsertRequest() {

    $('#SetTimeButton').click(function () {
        if ($("#StartDate").val() == "" || $("#StartTime").val() == "" || $("#EndDate").val() == "" || $("#EndTime").val() == "") {
            $("#SetTimeValidation").text("Morate popuniti sva polja!");


        }
        else {
            $("#SetTimeValidation").text("");
            var starttime = $("#StartDate").val() + " " + $("#StartTime").val();
            var endtime = $("#EndDate").val() + " " + $("#EndTime").val();
            if (Date.parse(starttime) > Date.parse(endtime)) {
                $("#SetTimeValidation").text("Početno vreme je veće od odredišnog vremena!");
            }
            else {
                $("#SetTimeValidation").text("");
                var serviceModel = { ServiceID: localStorage["choosenservice"], Latitude: localStorage["lat"], Longitude: localStorage["lng"], StartTime: starttime, EndTime: endtime, Distance: localStorage["distance"] };
                $.mobile.loading("show");
                $.post(serviceEndPoint + "InsertService", serviceModel, function (data) {
                    $.mobile.loading("hide");
                    if (data.Result == true) {
                        $.mobile.changePage("#Home_screen", "slide");
                        $("#StartDate").val("");
                        $("#StartTime").val("");
                        $("#EndDate").val("");
                        $("#EndTime").val("");

                    }
                });
            }
        }
        return false;
    });

}


function InitLoginVendor() {
    $('#login-loginbtn-vendor').click(function () {
        var user = $('#login-username-vendor').val();
        var pass = $('#login-pass-vendor').val();

        var loginModel = { Username: user, Password: pass };

        $.mobile.loading("show");
        $.post("/Service/Login", loginModel, function (data) {
            $.mobile.loading("hide");
            if (data.Result == false) {
                $('#login-validation-vendor').text("Pogrešno korisničko ime ili šifra!");
            } //Ulogovan
            else {
                $.mobile.changePage("#Home_screen_Vendor", "slide");
                $('#login-validation-vendor').text("");
                $('#login-username-vendor').val("");
                $('#login-pass-vendor').val("");

            }
        });
        return false;
    });
}


function SetDistance() {

    $('#Set_Distance_Button').click(function () {
        localStorage["distance"] = $("#Choose_Distance").val();
        $.mobile.changePage("#Set_Time_Frame", "slide");
        return false;
    });
}




function Refresh_Page_Vendor() {

    $('#refresh_page_vendor').click(function () {
        $("#current_requests_vendor").empty();

        $.mobile.loading("show");
        $.get("/Service/getActiveRequests", function (data) {
            $.mobile.loading("hide");
            if (data.Result == true) {
                $.each(data.alista, function (i, l) {
                    $("#current_requests_vendor").append("<p  class='vendoractiverequests' idreg='" + l.requestid + "' service='" + l.service + "' customer='" + l.customer + "' address='" + l.address + "' email='" + l.email + "' pol='" + l.pol + "' startend='" + l.startend + "'>" + l.service + " - " + l.customer + "</p>");
                });
            }

        });
        return false;
    });
}






function Vendor_Send_Offer() {
    $('#Vendor_Send_Offer').click(function () {
        if ($.trim($("#vendors_offer_description").val())) {
            var offerModel = { description: $("#vendors_offer_description").val(), customerrequestid: localStorage["CustomerRequestID"] };

            $.mobile.loading("show");
            $.post("/Service/InsertVendorOffer", offerModel, function (data) {
                $.mobile.loading("hide");
                $("#vendoroffervalidate").text("");
                $.mobile.changePage("#Home_screen_Vendor", "slide");
                return false;
            });
        }
        else {
            $("#vendoroffervalidate").text("Morate popuniti detalje!");
            return false;

        }

    });
}



function Vendor_Cancel_Offer() {

    $('#Vendor_Cancel_Offer').click(function () {
        
        var offerModel = { description: "-", customerrequestid: localStorage["CustomerRequestID"], servicetypeid: localStorage["ServiceType"] };

        $.mobile.loading("show");
        $.post("/Service/InsertVendorCancelOffer", offerModel, function (data) {
            $.mobile.loading("hide");
            $("#vendoroffervalidate").text("");
            $.mobile.changePage("#Home_screen_Vendor", "slide");
            return false;
        });
       
           
           

    });
    

}

function Refresh_Page_Customer() {
    //OnHaircutDemand
    $('#refresh_page_customer').click(function () {
        $("#current_offers_vendor").empty();

        $.mobile.loading("show");
        $.get("/Home/getActiveOffers", function (data) {
            $.mobile.loading("hide");
            if (data.Result == true) {
               
                $.each(data.listaponuda, function (i, l) {
                    $("#current_offers_vendor").append("<p  class='vendoractiveoffers' idcustomer='" + l.idcustomer + "' service='" + l.service + "' description='" + l.description + "' name='" + l.name + "' address='" + l.address + "' phone='" + l.phone + "' email='" + l.email + "' custreqid='" + l.customerrequestid + "' vendorid='" + l.vendorid + "'>" + l.service + " - " + l.name + "</p>");
                });
            }


        });
        
        return false;
    });
}


function Customer_Accept_Offer() {

    $("#Customer_Accept_Offer").click(function () {
        var offerModel = { customerrequestid: localStorage["custreqidoffer"], vendorid: localStorage["vendoridoffer"] };
        $.mobile.loading("show");
        $.post("/Home/AcceptOffer", offerModel, function (data) {
            $.mobile.loading("hide");
           
            $.mobile.changePage("#Home_screen", "slide");
            return false;
        });
    });
}


function Customer_Cancel_Offer() {
    $("#Customer_Cancel_Offer").click(function () {
        var offerModel = { customerrequestid: localStorage["custreqidoffer"], vendorid: localStorage["vendoridoffer"] };
        $.mobile.loading("show");
        $.post("/Home/CancelOffer", offerModel, function (data) {
            $.mobile.loading("hide");
          
            $.mobile.changePage("#Home_screen", "slide");
            return false;
        });
    });


}


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function showPosition(pos) {
            localStorage["lat"] = pos.coords.latitude;
            localStorage["lng"] = pos.coords.longitude;
        });
    } 
}
