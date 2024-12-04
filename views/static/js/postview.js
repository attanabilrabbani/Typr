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
function countComments(children){
    var totalComment = 0;
    children.forEach(child => {
        totalComment++;
        if (child.Children.length > 0 && Array.isArray(child.Children)){
            totalComment += countComments(child.Children);
    }
});
    return totalComment;
}
function showComments(children, userId, width){
    children.forEach(child => {
        var likeTotal = child.Likes ? child.Likes.length : 0;
        var commentTotal = child.Children ? child.Children.length : 0;
        const likeCheck = child.Likes && Array.isArray(child.Likes) && child.Likes.some(like => like.UserID === userId);
        const timeStamp = child.CreatedAt;
        const date = new Date(timeStamp).toISOString().split("T")[0];
        const comment = `<div class="mainbox comment-box" id="mainbox" data-id="${child.ID}" style="width:${width}px">
        <div style="display: flex; align-items: center;">
            <div id="profile-pict" class="profile-container">
                <img src="/assets/pfp/${child.User.ProfilePic}" id="profimg" alt="" class="profile-pic">
            </div>
            <h4>&nbsp;${child.User.Name}</h4>
            &nbsp;
            <h6>@${child.User.Username}</h6>
                &nbsp;
            <h6>|</h6>
            <h6 style="margin-right: 10em;">&nbsp;${date}</h6>
            </div>
            <br>
            <div class="card-body">
            <p class="card-text">${child.Content}</p>
            ${child.Image ? `<img src="/assets/posts/${child.ID}/${child.Image}" style="max-width: 900px; max-height: 600px;" alt="">`: ""}
            </div>
            <br>
            <div id="likescontainer" style="display: flex">
                ${likeCheck ? `<i id='like' class='bi bi-hand-thumbs-up-fill' style='cursor: pointer;' onclick="unlikeToggle(${child.ID})"></i>` 
                : `<i id='liked' class='bi bi-hand-thumbs-up' style='cursor: pointer;' onclick="likeToggle(${child.ID})"></i>`
                }
            <p class="like-count" style="margin-left: 1em">${likeTotal}</p>
            <i class="bi bi-chat" id="commentIcon" data-id="${child.ID}" data-bs-toggle="modal" data-bs-target="#addcomment-modal" style="margin-left: 1.4em; cursor: pointer;"></i>
            <p style="margin-left:1em">${commentTotal}</p>
            </div>
            </div>`;
            $("#posts").append(comment);

            if(commentTotal > 0 && Array.isArray(child.Children)){
                showComments(child.Children, userId, 900);
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
                        const addCommentsModal = document.getElementById('addcomment-modal');
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
                        
                        $("#confirmbtn").off("click").on("click", function(){
                            $.ajax({
                                url:"http://localhost:5000/logout",
                                method:"POST",
                                success: function () {
                                    window.location.href = "http://localhost:5000/";
                            }
                            });
                        });
                        const urlPath = window.location.pathname;
                        const urlId = urlPath.split("/").pop();

                        $.ajax({
                            url:`http://localhost:5000/posts/${urlId}`,
                            method:"GET",
                            success: function(post){
                                $("#comments").empty();
                                $("#posts").empty();
                                const likeTotal = post.Likes.length;
                                const commentTotal = countComments(post.Children);
                                const likeCheck = post.Likes.some(like => like.UserID === userId)
                                const timeStamp = post.CreatedAt;
                                const date = new Date(timeStamp).toISOString().split("T")[0];
                                const posts = `<div class="mainbox" id="mainbox" data-id="${post.ID}">
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
                                                        ${userId === post.User.ID ? `<button type="button" class="btn btn-outline-primary" data-bs-toggle="modal"
                                                            data-bs-target="#editpost-modal" style="margin-left:180px">Edit Post&nbsp;</button>
                                                        <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#delete-modal" style="margin-left:10px">&nbsp;Delete</button>` : ""}
                                                        
                                                    </div>
                                                    <br>
                                                    <div class="card-body">
                                                        <p class="card-text">${post.Content}</p>
                                                        ${post.Image ? `<img src="/assets/posts/${post.ID}/${post.Image}" style="max-width: 900px; max-height: 600px;" alt="">`: ""}
                                                    </div>
                                                    <br>
                                                    <div id="likescontainer" style="display: flex">
                                                        ${likeCheck 
                                                            ? `<i id='like' class='bi bi-hand-thumbs-up-fill' style='cursor: pointer;' onclick="unlikeToggle(${post.ID})"></i>` 
                                                            : `<i id='liked' class='bi bi-hand-thumbs-up' style='cursor: pointer;' onclick="likeToggle(${post.ID})"></i>`
                                                        }
                                                        <p class="like-count" style="margin-left: 1em">${likeTotal}</p>
                                                        <i class="bi bi-chat" id="commentIcon" data-id="${post.ID}" data-bs-toggle="modal" data-bs-target="#addcomment-modal" style="margin-left: 1.4em; cursor: pointer;"></i>
                                                        <p style="margin-left:1em">${commentTotal}</p>
                                                    </div>
                                                </div><div class="addposts"><hr style="width: 1000px; border: none; border-top: 2px solid white; justi"></div>`;
                                $("#posts").append(posts);
                                totalComment = 0;
                                if (commentTotal > 0){
                                    showComments(post.Children, userId, 1000);
                                }
                                var commentId;
                                var postUname;
                                $(document).on("click", "#commentIcon", function(){
                                    commentId = $(this).data("id");
                                    const parentDiv = $(this).closest(".mainbox"); 
                                    postUname = parentDiv.find("h6").first().text().trim();
                                    console.log(commentId);
                                    console.log(postUname);
                                })

                                $("#editBtn").on("click", function(){
                                    var editForm = new FormData(); 
                                    var editData = $("#edit-data").val();
                                    editForm.append("content", editData);
                                    $.ajax({
                                        url: `http://localhost:5000/posts/edit/${post.ID}`,
                                        type: "PUT",
                                        processData:false,
                                        contentType: false,
                                        data: editForm,
                                        success: function(){
                                            window.location.href = `http://localhost:5000/posts/view/${post.ID}`;
                                            console.log(post.ID);
                                            
                                        },
                                        error: function(){
                                            console.log("Update error");
                                        }
                                    });
                                });

                                $("#delpostbtn").on("click", function(){
                                    $.ajax({
                                        url: `http://localhost:5000/posts/${post.ID}`,
                                        method: "DELETE",
                                        success: function(){
                                            console.log("Deletion Success");
                                            window.location.href = "http://localhost:5000/";
                                        },
                                        error: function(){
                                            console.log("Deletion Failed");
                                        }
                                    });
                                })

                                if(addCommentsModal){
                                    addCommentsModal.addEventListener('show.bs.modal', function(){
                                        const contentForm =`<div class="modal-header">
                                                                <div id="profile-pict" class="profile-container">
                                                                    <img src="/assets/pfp/${data.data.ProfilePic}" id="profimg" alt="" class="profile-pic">
                                                                </div>
                                                                <h5 class="modal-title">&nbsp;Comment as @${data.data.Username}</h5>
                                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <form id="content-form">
                                                                    <div class="mb-3">
                                                                        <textarea class="form-control content-form" id="posts-content" placeholder="Add Comment" required></textarea>
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
                                        // $("#comment-content").empty();
                                        $("#comment-content").append(contentForm);

                                        $("#postBtn").on("click", function(){
                                            var formData = new FormData();
                                            var postContent = $("#posts-content").val();
                                            var Comment = `${postUname} ${postContent}`
                                            var imageInput = $("#upload-image")[0].files[0];
                                            console.log(typeof postContent);
                                            formData.append("content", Comment);
                                            if (imageInput) {
                                                formData.append("image", imageInput);
                                            }
                                            formData.forEach((value, key) => {
                                                console.log(key + ': ' + value + (typeof value));
                                            });

                                            
        
                                            $.ajax({
                                                url: `http://localhost:5000/reply/${commentId}`,
                                                type: "POST",
                                                processData:false,
                                                contentType: false,
                                                data: formData,
                                                success: function(){
                                                    $("#addcomment-modal").modal("hide");
                                                    window.location.href=`http://localhost:5000/posts/view/${post.ID}`;
                                                    console.log(dataId);
                                                    console.log("Comment added succesfully");
                                                },
                                                error: function(){
                                                    $("#warning").append("unable to post reply");
                                                }
                                            });
        
                                        });
                                    addCommentsModal.addEventListener('hide.bs.modal', function(){
                                        console.clear();
                                        $("#comment-content").empty();
                                        $("#warning").empty();
                                    });
                                    });
                                }
                                
                   
                            }
                        });
                    }
                },
                error: function(xhr, status, error){
                    console.error("token validation error", error);
                    $("#addposts").hide();
                    $("#maintab").hide();
                    $("#signupbutton").show();
                    $("#user-profile").hide();
                    $("#loginbutton").show();
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