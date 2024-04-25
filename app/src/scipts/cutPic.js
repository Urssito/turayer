document.addEventListener('DOMContentLoaded', () => {

    const inputImage = document.getElementById("file")
    let image = document.createElement("img");
    let canvas = document.getElementById("preview");
    let context = canvas.getContext("2d");
    let editordiv = document.getElementById("editor");

    inputImage.addEventListener('change', openEditor, false);

    function openEditor(e) {
        //create URL for the image
        let urlImage = URL.createObjectURL(e.target.files[0]);

        //delete previous editor
        editordiv.innerHTML = "";
        let cropperImg = document.createElement("img");
        cropperImg.setAttribute("id", "image")
        editordiv.appendChild(cropperImg);

        //clean image editor
        context.clearRect(0,0, canvas.width, canvas.height);

        //send image to editor
        document.getElementById("image").setAttribute("src", urlImage);
        $("#editor").css({
            margin: "20px"
        })

        if (document.getElementById("div-editor-buttons").childElementCount < 2){
            let save = document.createElement("button");
            save.setAttribute("id", "save-profilePhoto");
            save.setAttribute("name", "sendBase64");
            save.setAttribute("class", "edit-profile-btn-save-ProfilePhoto")
            document.getElementById("div-editor-buttons").appendChild(save);
            let button = document.getElementById("save-profilePhoto");
            button.innerHTML = `<img src="/icons/save.svg"> Guardar`
        }

        const cropper = new Cropper(cropperImg, {
            aspectRatio: 1,
            toggleDragModeOnDblclick: false,
            zoomOnWheel: false,
            background: false,
            ready: () => {
                let imgDim = document.getElementById("imgDim");
                let x = parseInt(cropper.getData().x);
                let y = parseInt(cropper.getData().y);
                let width = parseInt(cropper.getData().width);
                imgDim.innerHTML = `${x} ${y} ${width}`;

            },
            cropend: ()=> {
                let imgDim = document.getElementById("imgDim");
                let x = parseInt(cropper.getData().x);
                let y = parseInt(cropper.getData().y);
                let width = parseInt(cropper.getData().width);

                imgDim.innerHTML = `${x} ${y} ${width}`;
            }
        });
    }
});