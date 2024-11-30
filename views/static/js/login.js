document.getElementById("logo").addEventListener("click", function(){
    window.location.href="http://localhost:5000/";
});
$(document).ready(function(){
$("#login").on("submit", function(e){
    $("#message").empty();
    e.preventDefault();

    var email = $("#email").val();
    var password = $("#password").val();

    const loginData = {
        email:email,
        password:password
    };

    $.ajax({
        url: "http://localhost:5000/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(loginData),
        success: function(response){
            const loginSuccess = new bootstrap.Modal(document.getElementById('loginsuccess-modal'));
            loginSuccess.show();
            setTimeout(() => {
                window.location.href = "http://localhost:5000/";
            }, 2500);
            
        },
        error: function(){
            const message = `<p style="color: red; font-size: 12px;">Invalid Email or Password</p>`;
            $("#message").append(message);
        }
    });
});
});