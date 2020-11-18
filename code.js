var parser = document.createElement("a");
parser.href = document.location.href;
if(parser.hostname === "scratch.mit.edu" && parser.pathname.startsWith("/projects/")) {
    var projectID = parser.pathname.replace(/\D/g,'');
    var script = document.createElement('script');
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    script.onload = animThumbnailMain;
    document.getElementsByTagName('head')[0].appendChild(script);
} else {
    alert("Please click the bookmark on a Scratch project");
}

function animThumbnailMain() {
    snackBarCSS = function() {
        var css = document.createElement("style");
        css.innerHTML = '#snackbar { visibility: hidden; min-width: 250px; margin-left: -125px; background-color: black; color: #fff; text-align: center; border-radius: 2px; padding: 16px; position: fixed; z-index: 100; left: 50%; top: 50px; } #snackbar.show { visibility: visible; } ';
        document.head.appendChild(css);
    }

    error = function error(err) {
        if(String(err).includes("parameter 1 is not of type 'Blob'.")) {
            document.getElementById("snackbar").innerHTML = 'Error - please upload a downloaded file,<br> not an image from another website.<br><a id="selectThumbnailFile">Select an image</a><br><a onclick="document.getElementById(\'snackbar\').className=\'\';">Close</a>';
            document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
        } else {
            document.getElementById("snackbar").innerHTML = 'Error - try a smaller image.<br><a id="selectThumbnailFile">Select an image</a><br><a onclick="document.getElementById(\'snackbar\').className=\'\';">Close</a>';
            document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
        }
    }

    getCookie = function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    upload = function upload(filelocation) {

        document.getElementById("snackbar").innerHTML = "Reading file...";

        var reader1 = new FileReader();

        reader1.onload = function (e) {
            uploadedImage = e.target.result;
        };
        try{reader1.readAsDataURL(filelocation);}catch(err){error(err);return;}

        var reader = new FileReader();
        reader.onload = function(e2){
            $.ajax({
                type: "POST",
                url: "/internalapi/project/thumbnail/" + projectID + "/set/",
                data: e2.target.result,
                headers: {
                    "X-csrftoken": getCookie("scratchcsrftoken"),
                },
                contentType: "",
                processData: false,
                xhr: function() {
                    var xhr = $.ajaxSettings.xhr();
                    xhr.upload.onprogress = function(e) {
                        if(!document.getElementById("snackbar").innerHTML.includes("Error")){
                            var progress = Math.floor(e.loaded / e.total *100) + '%';
                            document.getElementById("snackbar").innerHTML = "Uploading file " + progress;
                        }
                    };
                    return xhr;
                },
                success: function(msg) {
                    document.getElementById("snackbar").innerHTML = 'The thumbnail was successfully changed.<br><img src="'+uploadedImage+'" height="108" width="144" style="background-color:white;"><br><a id="selectThumbnailFile">Select another image</a><br><a onclick="document.getElementById(\'snackbar\').className=\'\';">Close</a>';
                    document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
                },
                error: function() {
                    error();}
            });
        };
        reader.readAsArrayBuffer(filelocation);
    }

    snackBarCSS();

    var snackbar = document.createElement("div");
    snackbar.id = "snackbar";
    document.body.appendChild(snackbar);
    document.getElementById("snackbar").innerHTML = '<a id="selectThumbnailFile">Select an image</a> or drag and drop anywhere on this page.<br><a onclick="document.getElementById(\'snackbar\').className=\'\';">Close</a>';
    document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
    document.getElementById("snackbar").className = "show";

    if(!document.getElementById("uploadthumbnail")) {
        var file = document.createElement("input");
        file.id = "uploadthumbnail";
        file.setAttribute("type", "file");
        file.setAttribute("accept", "image/*");
        document.body.appendChild(file);
        document.getElementById("uploadthumbnail").onchange = function() {
            if(document.getElementById('uploadthumbnail').files[0])upload(document.getElementById('uploadthumbnail').files[0]);
        };
    } else {
        document.getElementById("uploadthumbnail").click();
    }

    if(!document.getElementById("uploadthumbnaildrag")){
        var dragloaded = document.createElement("span");
        dragloaded.id = "uploadthumbnaildrag";
        document.body.appendChild(dragloaded);

        var dropper = $(document);
        dropper.on("dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = "copy";
        });
        dropper.on("drop", function(e) {
            e.stopPropagation();
            e.preventDefault();
            upload(e.originalEvent.dataTransfer.items[0].getAsFile());
        });
    } // If drag and drop loader wasn't put before
}
