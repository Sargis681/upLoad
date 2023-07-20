const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(
  ".container__coldrap-file-selector"
);
const fileSelectorInput = document.querySelector(
  ".container__coldrap-file-selector-input"
);

// let lengthCo = 0;
let files = [];

fileSelector.onclick = () => fileSelectorInput.click();

fileSelectorInput.onchange = () => {
  files = [...fileSelectorInput.files];
  console.log(files);
  displayFiles();

  if (!isUploading) {
    uploadFilesInBatches();
  }
};

dropArea.ondragover = (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over-effect");
};

dropArea.ondragleave = () => {
  dropArea.classList.remove("drag-over-effect");
};

dropArea.ondragenter = (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over-effect");
};

dropArea.ondragend = () => {
  dropArea.classList.remove("drag-over-effect");
};

dropArea.ondrop = (e) => {
  e.preventDefault();
  dropArea.classList.remove("drag-over-effect");

  if (e.dataTransfer.items) {
    files = [...e.dataTransfer.items]
      // .filter((item) => item.kind === "file" && typeValidation(item.type))
      // .map((item) => item.getAsFile());
    displayFiles();

    if (!isUploading) {
      uploadFilesInBatches();
    }
  // } else {
  //   files = [...e.dataTransfer.files].filter((file) =>
  //     typeValidation(file.type)
  //   );
    console.log(files);
    displayFiles();

    if (!isUploading) {
      uploadFilesInBatches();
    }
  }
};

let isUploading = false;

function displayFiles() {
  listSection.style.display = "block";

  // listContainer.innerHTML = ""; // Clear the listContainer before appending new files

  files.forEach((file) => {
    const li = document.createElement("li");
    li.classList.add("in-prog");
    li.innerHTML = `
      <div class="col"></div>
      <div class="col">
        <div class="file-name">
          <div class="name">${file.name}</div>
          <span>0%</span>
        </div>
        <div class="file-progress">
          <span></span>
        </div>
        <div class="file-size">${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB</div>
      </div>
      <div class="col">
        <svg xmlns="http://www.w3.org/2000/svg" class="cross" height="20" width="20">
          <path d="m5.979 14.917-.854-.896 4-4.021-4-4.062.854-.896 4.042 4.062 4-4.062.854.896-4 4.062 4 4.021-.854.896-4-4.063Z"/>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="tick" height="20" width="20">
          <path d="m8.229 14.438-3.896-3.917 1.438-1.438 2.458 2.459 6-6L15.667 7Z"/>
        </svg>
      </div>
    `;
    listContainer.appendChild(li);
  });
}

function uploadFilesInBatches(a) {
  isUploading = true;
  const batchSize = 3;

  const totalBatches = Math.ceil(files.length / batchSize);
  console.log(totalBatches);

  let currentBatch = 0;

  function uploadBatch() {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, files.length);
    const batchFiles = files.slice(start, end);
    console.log("qcec");

    // if (a) {
    //   currentBatch = a;
    //   console.log(a);
    // }

    if (batchFiles.length === 0) {
      console.log("All files uploaded successfully.");
    }

    let completedCount = 0;
    let hasError = false;

    batchFiles.forEach((file, i) => {
      let li;
      const fileElements = listContainer.getElementsByClassName("name");
      for (let i = 0; i < fileElements.length; i++) {
        if (fileElements[i].textContent === file.name) {
          li = fileElements[i].closest("li");
          break;
        }
      }

      if (!li) {
        return;
      }

      li.classList.add("in-prog");

      const xhr = new XMLHttpRequest();
      const data = new FormData();
      data.append("file", file);

      xhr.upload.onprogress = (e) => {
        const percentComplete = (e.loaded / e.total) * 100;
        li.querySelector(".file-name span").innerHTML =
          Math.round(percentComplete) + "%";
        li.querySelector(".file-progress span").style.width =
          percentComplete + "%";
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          li.classList.add("complete");
          completedCount++;

          if (completedCount === batchFiles.length) {
            if (hasError) {
              console.log("Batch upload failed. Retrying...");
              console.log("qceq");
              uploadBatch();
            } else {
              if (fileElements.length > batchFiles.length) {
                console.log(a);
                // currentBatch = fileElements.length - batchFiles.length;
                uploadFilesInBatches(fileElements.length);
              }

              console.log(currentBatch);
              currentBatch++;
              if (currentBatch < totalBatches) {
                uploadBatch();
              } else {
                console.log("All files uploaded successfully.");
                isUploading = false;
                console.log(
                  batchFiles.length + "                " + "batchFiles"
                );
                console.log(
                  fileElements.length + "              " + "fileElements"
                );
                console.log(files.length + "                " + "files");
              }
            }
          }
        } else {
          console.log(`File upload failed with status: ${xhr.status}`);
          hasError = true;
        }
      };

      xhr.onerror = () => {
        console.log("An error occurred during file upload.");
        hasError = true;
      };

      const serverEndpoint = "http://localhost:8080"; // Replace with your server endpoint
      xhr.open("POST", serverEndpoint, true);

      li.querySelector(".cross").onclick = () => {
        xhr.abort();
        li.remove();
        console.log("File upload aborted.");
      };

      xhr.send(data);
    });
  }

  uploadBatch();
}

function typeValidation(fileType) {
  return fileType.startsWith("image/");
}
