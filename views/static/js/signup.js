document.getElementById("logo").addEventListener("click", function(){
    window.location.href="http://localhost:5000/";
});
$(document).ready(function(){
$("#signup").on("submit", function(e){
    $("#message").empty();
    e.preventDefault();

    var username = $("#username").val();
    var name = $("#name").val();
    var email = $("#email").val();
    var password = $("#password").val();

    const newUser = {
        username: username,
        name: name,
        email:email,
        password:password
    };

    $.ajax({
        url: "http://localhost:5000/signup",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(newUser),
        success: function(response){
            const signupSuccess = new bootstrap.Modal(document.getElementById('signupsuccess-modal'));
            signupSuccess.show();
            $("#signup")[0].reset();
            $("#loginredirectbtn").on("click", function(){
                window.location.href = "http://localhost:5000/login";
            });
            $("#closebtn").on("click", function(){
                window.location.href = "http://localhost:5000/";
            })

        },
        error: function(xhr, status, error){
            const response = JSON.parse(xhr.responseText);
            $("#message").append(`<p style="color: red; font-size: 12px;">${response.message}</p>`)
            console.log(response.message);
        }
    });
});
});