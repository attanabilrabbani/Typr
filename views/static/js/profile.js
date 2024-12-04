// JavaScript for profile.html
function checkLoginStatus(userdata, urlId){
    $.ajax({
            url:"http://localhost:5000/validate",
            method:"GET",
            xhrFields:{
                withCredentials: true
            },
            success: function(data){
                if (data.valid){
                    let id = parseInt(urlId);
                    const userId = data.data.ID;
                    const followCheck = userdata.Followers.some(follower => follower.FollowerID === userId);
                    $("#loginbutton").hide();
                    $("#signupbutton").hide();
                    $("#user-profile").show();
                    $("#signout").show();
                    $("#profimg").attr("src", `/assets/pfp/${data.data.ProfilePic}`);

                    $("#profimg").on("click", function(){
                        window.location.href=`http://localhost:5000/profile/${userId}`;
                    });

                    $("#confirmbtn").off("click").on("click", function(){
                        $.ajax({
                            url:"http://localhost:5000/logout",
                            method:"POST",
                            success: function () {
                                window.location.href = "http://localhost:5000/";
                        }
                        });
                    });
                    const followInfo = userId === id 
                        ? `<a href="http://localhost:5000/editprofile/${userId}" class="btn btn-outline-light" style="width: 300px;">Edit Profile</a>` 
                        : (followCheck 
                          ? `<button type="button" class="btn btn-light" style="width: 300px;" onclick="unfollowToggle(${id})">Unfollow</button>` 
                          : `<button type="button" class="btn btn-outline-light" style="width: 300px;" onclick="followToggle(${id})">Follow</button>`);
                    $("#profileinfo").append(followInfo);
                    
                   return true, userId;
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
                
                const followButton = `<button type="button" class="btn btn-outline-light" style="width: 300px;">Follow</button>`;

                $("#profileinfo").append(followButton);

                return false;
            }


    });
    
};

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
            $("#user-posts").load("#user-posts");
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
            $("#user-posts").load("#user-posts");
        },
        error: function(){
            console.log("Error toggling like");
        }
    });
}

function followToggle(userId){
    $.ajax({
        url:`http://localhost:5000/follow/${userId}`,
        method:"POST",
        success: function(){
            location.reload();
        },
        error: function(){
            console.log("Error toggling follow");
        }
    });
}

function unfollowToggle(userId){
    $.ajax({
        url:`http://localhost:5000/unfollow/${userId}`,
        method: "DELETE",
        success: function(){
            location.reload();
        },
        error: function(){
            console.log("Error toggling unfollow");
        }
    })
}

$(document).ready(function(){
    document.getElementById("logo").addEventListener("click", function(){
        window.location.href="http://localhost:5000/";
    });
    const urlPath = window.location.pathname;
    const urlId = urlPath.split("/").pop();
    $.ajax({
        url:`http://localhost:5000/users/${urlId}`,
        method:"GET",
        success: function(userdata){
            $("#profileinfo").empty();
            const postTotal = userdata.Posts.length;
            const followerTotal = userdata.Followers.length;
            const followingTotal = userdata.Following.length;
            const userInfo = `<h4>${userdata.Name}</h4>
                               <h5>@${userdata.Username}</h5>
                               <p>${postTotal} Posts</p>
                               <p>${followerTotal} Followers ${followingTotal} Following</p>
                               <p>${userdata.Bio}</p>`;
            $("#profileinfo").append(userInfo);
            $("#user-posts").empty();
            var checkVal, idUser = checkLoginStatus(userdata, urlId);
            userdata.Posts.forEach(post => {
                const likeCheck = post.Likes.some(like => like.UserID === idUser);
                const likeTotal = post.Likes.length;
                const timeStamp = post.CreatedAt;
                const date = new Date(timeStamp).toISOString().split("T")[0];
                const posts = `<div class="mainbox" style="cursor: pointer;" data-id="${post.ID}">
                                <div style="display: flex; align-items: center;">
                                    <div id="profile-pict" class="profile-container">
                                        <img src="/assets/pfp/${userdata.ProfilePic}" id="profimg" alt="" class="profile-pic">
                                    </div>
                                    <h4>&nbsp;${userdata.Name}</h4>
                                    &nbsp;
                                    <h6>@${userdata.Username}</h6>
                                    &nbsp;
                                    <h6>|</h6>
                                    <h6 style="margin-right: 10em;">&nbsp;${date}</h6>
                                </div>
                                <br>
                                <div class="card-body" style="cursor: pointer;" data-id="${post.ID}">
                                    <p class="card-text">${post.Content}</p>
                                    ${post.Image ? `<img src="/assets/posts/${post.ID}/${post.Image}" style="max-width: 900px; max-height: 600px;" alt="">`: ""}
                                </div>
                                <br>
                                <div id="likescontainer" data-id="${post.ID}" style="display: flex">
                                    ${checkVal? (likeCheck ? `<i id='like' class='bi bi-hand-thumbs-up-fill' style='cursor: pointer;' onclick="unlikeToggle(${post.ID})"></i>`
                                         : `<i id='liked' class='bi bi-hand-thumbs-up' style='cursor: pointer;' onclick="likeToggle(${post.ID})"></i>`)
                                          : `<i id='liked' class='bi bi-hand-thumbs-up' style='cursor: pointer;'></i>`}
                                    <p class="like-count" style="margin-left: 1em">${likeTotal}</p>
                                    <i class="bi bi-chat" style="margin-left: 1.4em;"></i>
                                </div>
                            </div>`;
                $("#user-posts").append(posts);             
            });
            $(".card-body").on("click", function(){
                const divId = $(this).data("id");
                window.location.href = `http://localhost:5000/posts/view/${divId}`;
            });
            $(".edit-profile").on("click", function(){
                window.location.href = `http://localhost:5000/editprofile/${idUser}`;
            });
            
            
        }
    });
    
    window.addEventListener("pageshow", function(event) {
        if (event.persisted) {
            $("#user-posts").load("#user-posts");
        }
    });
});