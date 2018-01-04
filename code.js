if(Scratch.INIT_DATA.PROJECT.model.creator==Scratch.INIT_DATA.LOGGED_IN_USER.model.username) {

    if(!document.getElementById("uploadthumbnail")) {
        var file = document.createElement("input");
        file.id = "uploadthumbnail";
        file.setAttribute("type", "file");
        file.click();
        document.body.appendChild(file);
        document.getElementById("uploadthumbnail").onchange = function() {
            upload(document.getElementById('uploadthumbnail').files[0]);
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

function upload(filelocation) {
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
                    console.log(Math.floor(e.loaded / e.total *100) + '%');
                };
                return xhr;
            },
            success: function(msg) {
                alert();
                if(document.getElementById("uploadthumbnail"))document.getElementById("uploadthumbnail").remove();
            },
            error: function() {
                error();}
        });
    };
    try{reader.readAsArrayBuffer(filelocation);}catch(err){error();}
}
