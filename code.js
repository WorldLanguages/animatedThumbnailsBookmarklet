if(Scratch.INIT_DATA.PROJECT.model.creator==Scratch.INIT_DATA.LOGGED_IN_USER.model.username) {

    snackBarCSS();

    var snackbar = document.createElement("div");
    snackbar.id = "snackbar";
    document.body.appendChild(snackbar);
    document.getElementById("snackbar").innerHTML = '<a id="selectThumbnailFile">Select an image</a> or drag and drop anywhere on this page.';
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

} // If user is on a project that owns

else {
    alert("Please use the bookmarklet in a project you own.");}

function upload(filelocation) {

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
            url: "/internalapi/project/thumbnail/" + Scratch.INIT_DATA.PROJECT.model.id + "/set/",
            data: e2.target.result,
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
                document.getElementById("snackbar").innerHTML = 'The thumbnail was successfully changed.<br><img src="'+uploadedImage+'" height="108" width="144" style="background-color:white;"><br><a id="selectThumbnailFile">Select another image</a><br><a style="text-align:right;" onclick="document.getElementById(\'snackbar\').className=\'\';">Close</a><br>';
                document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
            },
            error: function() {
                error();}
        });
    };
    reader.readAsArrayBuffer(filelocation);
}

function snackBarCSS() {
    var css = document.createElement("style");
    css.innerHTML = '#snackbar { visibility: hidden; min-width: 250px; margin-left: -125px; background-color: black; color: #fff; text-align: center; border-radius: 2px; padding: 16px; position: fixed; z-index: 1; left: 50%; top: 50px; } #snackbar.show { visibility: visible; } ';
    document.head.appendChild(css);
}

function error(err) {
    if(String(err).includes("parameter 1 is not of type 'Blob'.")) {
        document.getElementById("snackbar").innerHTML = 'Error - please upload a downloaded file,<br> not an image from another website.<br><a id="selectThumbnailFile">Select an image</a>';
        document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
    } else {
        document.getElementById("snackbar").innerHTML = 'Error - try a smaller image.<br><a id="selectThumbnailFile">Select an image</a>';
        document.getElementById("selectThumbnailFile").onclick = function(){document.getElementById("uploadthumbnail").click();};
    }
}
