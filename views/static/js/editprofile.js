document.getElementById("logo").addEventListener("click", function(){
    window.location.href="http://localhost:5000/";
});
$(document).ready(function(){
    const urlPath = window.location.pathname;
    const urlId = urlPath.split("/").pop();
    $("#editprofile").on("submit", function(e){
        $("#message").empty();
        e.preventDefault();

        var formData = new FormData();

        var name = $("#name").val();
        var bio = $("#bio").val();
        var email = $("#email").val();
        var password = $("#password").val();

        var imageInput = $("#upload-profilepic")[0].files[0];

        formData.append("name", name);
        formData.append("bio", bio);
        formData.append("email", email);
        formData.append("password", password);

        if (imageInput) {
            formData.append("profilepic", imageInput);
        }
        //debug
        
        $.ajax({
            url: `http://localhost:5000/users/edit/${urlId}`,
            type: "PUT",
            processData:false,
            contentType: false,
            data: formData,
            success: function(){ 
                window.location.href=`http://localhost:5000/profile/${urlId}`;
                console.log("Edited succesfully");
                formData.forEach((value, key) => {
                    console.log(key + ': ' + value + (typeof value));
                });
            },
            error: function(xhr){
                $("#message").append(xhr.responseJSON.error);
            }
        });
    });
    });