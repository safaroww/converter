document.addEventListener("DOMContentLoaded", function () {
    const uploadFilesInput = document.getElementById("uploadFiles");
    const filePreview = document.getElementById("filePreview");
    const convertButton = document.getElementById("convertButton");
    const resetButton = document.getElementById("resetButton");
    const outputFormatSelect = document.getElementById("outputFormat");
    const canvas = document.getElementById("canvas");

    let filesArray = [];

    uploadFilesInput.addEventListener("change", (e) => {
        const files = e.target.files;
        for (let i = 0; i < files.length; i++) {
            filesArray.push(files[i]);
            renderFilePreview(files[i]);
        }
    });

    function renderFilePreview(file) {
        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");

        const fileImage = document.createElement("img");
        const fileNameInput = document.createElement("input");
        const removeButton = document.createElement("button");

        fileImage.src = URL.createObjectURL(file);
        fileNameInput.type = "text";
        fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
        fileNameInput.addEventListener("input", (e) => {
            const fileIndex = filesArray.indexOf(file);
            if (fileIndex !== -1) {
                filesArray[fileIndex].newName = e.target.value;
            }
        });

        removeButton.classList.add("remove-btn");
        removeButton.innerText = "×";
        removeButton.addEventListener("click", () => {
            fileItem.remove();
            filesArray = filesArray.filter((f) => f !== file);
        });

        fileItem.appendChild(fileImage);
        fileItem.appendChild(fileNameInput);
        fileItem.appendChild(removeButton);

        filePreview.appendChild(fileItem);
        file.newName = file.name.replace(/\.[^/.]+$/, "");
    }

    convertButton.addEventListener("click", async () => {
        const format = outputFormatSelect.value;
        const zip = new JSZip();

        for (let file of filesArray) {
            const convertedFile = await convertImage(file, format);
            const updatedName = file.newName || file.name.replace(/\.[^/.]+$/, "");
            zip.file(`${updatedName}.${format}`, convertedFile);
        }

        if (filesArray.length > 1) {
            zip.generateAsync({ type: "blob" }).then(function (content) {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = "converted_files.zip";
                link.click();
            });
        } else if (filesArray.length === 1) {
            const file = zip.files[Object.keys(zip.files)[0]];
            file.async("blob").then(function (content) {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = `${filesArray[0].newName || filesArray[0].name.replace(/\.[^/.]+$/, "")}.${format}`;
                link.click();
            });
        }
    });

    resetButton.addEventListener("click", () => {
        filePreview.innerHTML = "";
        filesArray = [];
    });

    function convertImage(file, format) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        const updatedName = file.newName || file.name.replace(/\.[^/.]+$/, "");
                        const newFile = new File([blob], `${updatedName}.${format}`, { type: blob.type });
                        resolve(newFile);
                    }, `image/${format}`);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    const dragModal = document.createElement("div");
    dragModal.classList.add("drag-modal");
    dragModal.innerHTML = "<div><p>Drop files to upload</p></div>";
    document.body.appendChild(dragModal);

    const style = document.createElement("style");
    style.textContent = `
            .drag-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 18px;
                display: none;
                z-index: 9999;
                width: 100%;
                height: 100%;
                justify-content: center;
                align-items: center;
            }
            .drag-modal.visible {
                display: flex;
            }
        `;
    document.head.appendChild(style);

    let dragCounter = 0;

    document.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    document.addEventListener("dragenter", (e) => {
        e.preventDefault();
        dragCounter++;
        if (dragCounter === 1) {
            dragModal.classList.add("visible");
        }
    });

    document.addEventListener("dragleave", () => {
        dragCounter--;
        if (dragCounter === 0) {
            dragModal.classList.remove("visible");
        }
    });

    document.addEventListener("drop", (e) => {
        e.preventDefault();
        dragCounter = 0;
        dragModal.classList.remove("visible");

        if (e.dataTransfer.files) {
            Array.from(e.dataTransfer.files).forEach((file) => {
                filesArray.push(file);
                renderFilePreview(file);
            });
        }
    });

    function renderFilePreview(file) {
        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");

        const fileImage = document.createElement("img");
        const fileNameInput = document.createElement("input");
        const removeButton = document.createElement("button");

        fileImage.src = URL.createObjectURL(file);
        fileNameInput.type = "text";
        fileNameInput.value = file.name.replace(/\.[^/.]+$/, "");
        fileNameInput.addEventListener("input", (e) => {
            const fileIndex = filesArray.indexOf(file);
            if (fileIndex !== -1) {
                filesArray[fileIndex].newName = e.target.value;
            }
        });

        removeButton.classList.add("remove-btn");
        removeButton.innerText = "×";
        removeButton.addEventListener("click", () => {
            fileItem.remove();
            filesArray = filesArray.filter((f) => f !== file);
        });

        fileItem.appendChild(fileImage);
        fileItem.appendChild(fileNameInput);
        fileItem.appendChild(removeButton);

        filePreview.appendChild(fileItem);
        file.newName = file.name.replace(/\.[^/.]+$/, "");
    }
});


const toggleButton = document.getElementById("darkModeToggle");
const dayIcon = document.getElementById("dayIcon");
const nightIcon = document.getElementById("nightIcon");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    dayIcon.style.display = "none";
    nightIcon.style.display = "inline-block";
}

toggleButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.toggle("dark-mode");

    if (isDarkMode) {
        dayIcon.style.display = "none";
        nightIcon.style.display = "inline-block";
    } else {
        dayIcon.style.display = "inline-block";
        nightIcon.style.display = "none";
    }

    const currentMode = isDarkMode ? "dark" : "light";
    localStorage.setItem("theme", currentMode);
});