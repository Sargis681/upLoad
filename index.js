const dropArea = document.querySelector(".container__cart");
const listSection = document.querySelector(".container__list-section");
const listContainer = document.querySelector(".container__list");
const fileSelector = document.querySelector(".container__coldrap-file-selector");
const fileSelectorInput = document.querySelector(".container__coldrap-file-selector-input");
let rit = document.querySelector(".container__list-title");
let files = [];

fileSelector.onclick = () => fileSelectorInput.click();

fileSelectorInput.onchange = () => {
  files = [...fileSelectorInput.files];
  displayFiles();
  uploadFilesInBatches();
};

dropArea.ondragover = (e) => {
  e.preventDefault();
  [...e.dataTransfer.items].forEach((item) => {
    if (typeValidation(item.type)) {
      dropArea.classList.add("drag-over-effect");
    }
  });
};

dropArea.ondragleave = () => {
  dropArea.classList.remove("drag-over-effect");
};

dropArea.ondrop = (e) => {
  e.preventDefault();

  dropArea.classList.remove("drag-over-effect");
  if (e.dataTransfer.items) {
    files = [...e.dataTransfer.items].reduce((result, item) => {
      if (item.kind === "file" && typeValidation(item.type)) {
        result.push(item.getAsFile());
      }
      return result;
    }, []);
    displayFiles();
    uploadFilesInBatches();
  } else {
    files = [...e.dataTransfer.files].filter((file) => typeValidation(file.type));
    displayFiles();
    uploadFilesInBatches();
  }
};

function displayFiles() {
  listSection.style.display = "block";
  listContainer.innerHTML = ""; // Clear the file list

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
        <div class="file-size">${(file.size / (1024 * 1024)).toFixed(2)} MB</div>
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

function uploadFilesInBatches() {
  const batchSize = 3;
  rit.append(files.length + "/");
  console.log(files.length);

  const totalBatches = Math.ceil(files.length / batchSize);
  let currentBatch = 0;

  function uploadBatch() {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, files.length);
    const batchFiles = files.slice(start, end);

    if (batchFiles.length === 0) {
      console.log("All files uploaded successfully.");
      return;
    }

    let completedCount = 0;
    let hasError = false;

    batchFiles.forEach((file) => {
      let li;
      const fileElements = listContainer.getElementsByClassName("name");
      for (let i = 0; i < fileElements.length; i++) {
        if (fileElements[i].textContent === file.name) {
          li = fileElements[i].closest("li");
          break;
        }
      }

      if (!li) {
        return; // Skip if corresponding list item not found
      }

      li.classList.add("in-prog");

      const http = new XMLHttpRequest();
      const data = new FormData();
      data.append("file", file);

      http.upload.onprogress = (e) => {
        const percentComplete = (e.loaded / e.total) * 100;
        li.querySelector(".file-name span").innerHTML = Math.round(percentComplete) + "%";
        li.querySelector(".file-progress span").style.width = percentComplete + "%";
      };

      http.onload = () => {
        if (http.status === 200) {
          li.classList.add("complete");
          console.log("File uploaded successfully.");
        } else {
          console.log("An error occurred during file upload. Error code: " + http.status);
          hasError = true;
        }

        completedCount++;

        if (completedCount === batchFiles.length) {
          if (hasError) {
            console.log("Batch upload failed. Retrying...");
            uploadBatch();
          } else {
            currentBatch++;
            if (currentBatch < totalBatches) {
              uploadBatch();
            } else {
              console.log("All files uploaded successfully.");
            }
          }
        }
      };

      http.onerror = () => {
        console.log("An error occurred during file upload.");
        hasError = true;
        completedCount++;

        if (completedCount === batchFiles.length) {
          console.log("Batch upload failed. Retrying...");
          uploadBatch();
        }
      };

      const serverEndpoint = "http://localhost:8080";

      http.open("POST", serverEndpoint, true);

      li.querySelector(".cross").onclick = () => {
        http.abort();
        li.remove();
        completedCount++;

        if (completedCount === batchFiles.length) {
          console.log("Batch upload aborted.");
        }
      };

      http.send(data);
    });
  }

  uploadBatch();
}
