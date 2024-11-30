// JavaScript for index.html
function likeToggle(postId){
    $.ajax({
        url:`http://localhost:5000/likes/add/${postId}`,
        method:"POST",
        success: function(){
            const likeIcon = $(`.likescontainer[data-id="${postId}"] i#like`);
            likeIcon.removeClass('bi-hand-thumbs-up').addClass('bi-hand-thumbs-up-fill');
            likeIcon.attr('onclick',`unlikeToggle(${postId})`);
            const likeCounter = $(`.likescontainer[data-id="${postId}"] .like-count`);
            let likeCount = parseInt(likeCounter.text()) || 0;
            likeCount++;
            likeCounter.text(likeCount);
            $("#likescontainer").load("#likescontainer");
        },
        error: function(){
            console.log("Error toggling like");
        }
    });
}
function unlikeToggle(postId){
    $.ajax({
        url:`http://localhost:5000/likes/${postId}`,
        method:"DELETE",
        success: function(){
            const unlikeIcon = $(`.likescontainer[data-id="${postId}"] i#liked`);
            unlikeIcon.removeClass('bi-hand-thumbs-up-fill').addClass('bi-hand-thumbs-up');
            unlikeIcon.attr('onclick', `likeToggle(${postId})`)
            const likeCounter = $(`.likescontainer[data-id="${postId}"] .like-count`);
            let likeCount = parseInt(likeCounter.text());
            likeCount--;
            if(likeCount < 0){
                likeCount = 0;
            };
            likeCounter.text(likeCount);
            $("#likescontainer").load("#likescontainer");
        },
        error: function(){
            console.log("Error toggling like");
        }
    });
}
$(document).ready(function(){
    document.getElementById("logo").addEventListener("click", function(){
        window.location.href="http://localhost:5000/";
    });
    async function checkLoginStatus(){
        $.ajax({
                url:"http://localhost:5000/validate",
                method:"GET",
                xhrFields:{
                    withCredentials: true
                },
                success: function(data){
                    if (data.valid){
                        const userId = data.data.ID;
                        const addPostsModal = document.getElementById('addpost-modal');
                        $("#loginbutton").hide();
                        $("#signupbutton").hide();
                        $("#user-profile").show();
                        $("#add-posts").show();
                        $("#signout").show();
                        $("#maintab").show();
                        $("#profimg").attr("src", `/assets/pfp/${data.data.ProfilePic}`);

                        $("#profimg").on("click", function(){
                            window.location.href=`http://localhost:5000/profile/${data.data.ID}`;
                        });

                        if (!$('#add-posts').find('h4[data-bs-target="#addpost-modal"]').length) {
                            const addPostButton = `
                                <h4 style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#addpost-modal">
                                    <i class="bi bi-pencil-fill"></i>&nbsp;Post&nbsp;
                                </h4>
                                <hr style="width: 900px; border: none; border-top: 2px solid white;">
                            `;
                            $("#add-posts").append(addPostButton);
                        }
                        if(addPostsModal){
                            addPostsModal.addEventListener('show.bs.modal', function(){
                                const contentForm =`<div class="modal-header">
                                                        <div id="profile-pict" class="profile-container">
                                                            <img src="/assets/pfp/${data.data.ProfilePic}" id="profimg" alt="" class="profile-pic">
                                                        </div>
                                                        <h5 class="modal-title">&nbsp;Post as @${data.data.Username}</h5>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <form id="content-form">
                                                            <div class="mb-3">
                                                                <textarea class="form-control content-form" id="posts-content" placeholder="What's happening?" required></textarea>
                                                            </div>
                                                            <div id="warning" style="color: red;"></div>
                                                            <div class="mb-3">
                                                                <label for="uploadImage" class="form-label">Upload Image</label>
                                                                <input class="form-control" type="file" id="upload-image" accept="image/*">
                                                            </div>
                                                        </form>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <button id="postBtn" type="button" class="btn btn-primary">Post</button>
                                                    </div>`;
                                $("#content").append(contentForm);
                                $("#postBtn").on("click", function(){
                                    var formData = new FormData();
                                    var postContent = $("#posts-content").val();
                                    var imageInput = $("#upload-image")[0].files[0];
                                    console.log(typeof postContent);
                                    formData.append("content", postContent);
                                    if (imageInput) {
                                        formData.append("image", imageInput);
                                    }
                                    formData.forEach((value, key) => {
                                        console.log(key + ': ' + value + (typeof value));
                                    });

                                    $.ajax({
                                        url: "http://localhost:5000/posts/create",
                                        type: "POST",
                                        processData:false,
                                        contentType: false,
                                        data: formData,
                                        success: function(){
                                            $("#addpost-modal").modal("hide");
                                            window.location.href="http://localhost:5000/";
                                            console.log("Post added succesfully");
                                        },
                                        error: function(xhr, status, error){
                                            $("#warning").append(xhr.responseJSON.error);
                                        }
                                    });

                                });
                            addPostsModal.addEventListener('hide.bs.modal', function(){
                                $("#content").empty();
                                $("#warning").empty();
                            });
                            });
                        };

                        $("#confirmbtn").off("click").on("click", function(){
                            $.ajax({
                                url:"http://localhost:5000/logout",
                                method:"POST",
                                success: function () {
                                    window.location.href = "http://localhost:5000/";
                            }
                            });
                        });

                        $.ajax({
                            url:"http://localhost:5000/posts/",
                            method:"GET",
                            success: function(postsdata){
                                $("#posts").empty();
                                postsdata.forEach(post => {
                                    const likeTotal = post.Likes.length;
                                    const commentTotal = post.Children.length;
                                    const likeCheck = post.Likes.some(like => like.UserID === userId)
                                    const timeStamp = post.CreatedAt;
                                    const date = new Date(timeStamp).toISOString().split("T")[0];
                                    const posts = `<div class="mainbox">
                                                    <div style="display: flex; align-items: center;">
                                                        <div id="profile-pict" class="profile-container">
                                                            <img src="/assets/pfp/${post.User.ProfilePic}" id="profimg" alt="" class="profile-pic">
                                                        </div>
                                                        <h4>&nbsp;${post.User.Name}</h4>
                                                        &nbsp;
                                                        <h6>@${post.User.Username}</h6>
                                                        &nbsp;
                                                        <h6>|</h6>
                                                        <h6 style="margin-right: 10em;">&nbsp;${date}</h6>
                                                    </div>
                                                    <br>
                                                    <div class="card-body">
                                                        <p class="card-text">${post.Content}</p>
                                                        ${post.Image ? `<img src="./assets/posts/${post.ID}/${post.Image}" style="max-width: 900px; max-height: 600px;" alt="">`: ""}
                                                    </div>
                                                    <br>
                                                    <div id="likescontainer" data-id="${post.ID}" style="display: flex">
                                                        ${likeCheck 
                                                            ? `<i id='like' class='bi bi-hand-thumbs-up-fill' style='cursor: pointer;' onclick="unlikeToggle(${post.ID})"></i>` 
                                                            : `<i id='liked' class='bi bi-hand-thumbs-up' style='cursor: pointer;' onclick="likeToggle(${post.ID})"></i>`
                                                        }
                                                        <p class="like-count" style="margin-left: 1em">${likeTotal}</p>
                                                        <i class="bi bi-chat" style="margin-left: 1.4em;"></i>
                                                        <p style="margin-left:1em">${commentTotal}</p>
                                                    </div>
                                                </div>`;
                                    $("#posts").append(posts);             
                                });
                            }
                        });
                    }
                },
                error: function(xhr, status, error){
                    console.error("token validation error", error);
                    $("#loginbutton").show();
                    $("#addposts").hide();
                    $("#maintab").hide();
                    $("#signupbutton").show();
                    $("#user-profile").hide();
                    $("#signout").hide();

                    $.ajax({
                        url:"http://localhost:5000/posts/",
                        method:"GET",
                        success: function(postsdata){
                            $("#posts").empty();

                            postsdata.forEach(post => {
                                const likeTotal = post.Likes.length;
                                const commentTotal = post.Children.length;
                                const timeStamp = post.CreatedAt;
                                const date = new Date(timeStamp).toISOString().split("T")[0];
                                const posts = `<div class="mainbox">
                                    <div style="display: flex; align-items: center;">
                                        <div id="profile-pict" class="profile-container">
                                            <img src="/assets/pfp/${post.User.ProfilePic}" id="profimg" alt="" class="profile-pic">
                                        </div>
                                        <h4>&nbsp;${post.User.Name}</h4>
                                        &nbsp;
                                        <h6>@${post.User.Username}</h6>
                                        &nbsp;
                                        <h6>|</h6>
                                        <h6 style="margin-right: 10em;">&nbsp;${date}</h6>
                                    </div>
                                    <br>
                                    <div class="card-body">
                                        <p class="card-text">${post.Content}</p>
                                        ${post.Image ? `<img src="./assets/posts/${post.ID}/${post.Image}" style="max-width: 900px; max-height: 600px;" alt="">`: ""}
                                    </div>
                                    <br>
                                    <div style="display: flex">
                                        <i id='liked' class='bi bi-hand-thumbs-up' style='cursor: pointer;' data-bs-toggle="modal" data-bs-target="#logintocontinue-modal"></i>
                                        <p class="like-count" style="margin-left: 1em">${likeTotal}</p>
                                        <i class="bi bi-chat" style="margin-left: 1.4em;" style='cursor: pointer;' data-bs-toggle="modal" data-bs-target="#logintocontinue-modal"></i>
                                        <p style="margin-left:1em">${commentTotal}</p>
                                    </div>
                                </div>`;
                                $("#posts").append(posts);  
                                $("#loginredirectbtn").off("click").on("click", function(){
                                    window.location.href = "http://localhost:5000/login";
                                });
                            });
                        }
                    });

                }


        });

        
        
    };
    checkLoginStatus();
});