// js/image-editor.js
document.addEventListener("DOMContentLoaded", () => {
  // Sélecteurs
  const editorTitle = document.getElementById("editor-title");
  const imageContainer = document.getElementById("image-container");
  const imageDisplay = document.getElementById("image-display");
  const imageLoader = document.getElementById("image-loader");
  const deleteBtn = document.getElementById("delete-btn");
  const resetBtn = document.getElementById("reset-btn");
  const downloadBtn = document.getElementById("download-btn");
  const downloadWrapper = document.getElementById("download-wrapper");
  const cropToolBtn = document.getElementById("crop-tool-btn");
  const undoBtn = document.getElementById("undo-btn");

  const textToolBtn = document.getElementById("text-tool-btn");
  const textPanel = document.getElementById("text-panel");
  const closeTextPanelBtn = document.getElementById("close-text-panel-btn");
  const textPanelInput = document.getElementById("text-panel-input");
  const textPanelColor = document.getElementById("text-panel-color");
  const addTextBtn = document.getElementById("add-text-btn");
  const mainControls = document.getElementById("main-controls");
  const cropActions = document.getElementById("crop-actions");
  const confirmCropBtn = document.getElementById("confirm-crop-btn");
  const cancelCropBtn = document.getElementById("cancel-crop-btn");

  // Variables d'état
  let selectedTextElement = null;
  let isDragging = false;
  let offsetX, offsetY;
  let cropper = null;
  let history = [];
  let redoStack = [];

  // --- GESTION DE L'HISTORIQUE (UNDO/REDO) ---
  function getCurrentState() {
    const texts = [];
    imageContainer.querySelectorAll(".text-overlay").forEach((el) => {
      texts.push({
        content: el.innerText,
        left: el.style.left,
        top: el.style.top,
        bgColor: el.style.backgroundColor,
        color: el.style.color,
      });
    });
    return { imageSrc: imageDisplay.src, texts: texts };
  }

  function saveState() {
    redoStack = [];
    history.push(getCurrentState());
    updateHistoryButtons();
  }

  function restoreState(state) {
    imageDisplay.src = state.imageSrc;
    imageContainer
      .querySelectorAll(".text-overlay")
      .forEach((el) => el.remove());
    state.texts.forEach((textData) => createTextElement(textData));
    selectText(null);
  }

  function updateHistoryButtons() {
    undoBtn.disabled = history.length <= 1;
  }

  undoBtn.addEventListener("click", () => {
    if (history.length > 1) {
      redoStack.push(history.pop());
      const previousState = history[history.length - 1];
      restoreState(previousState);
      updateHistoryButtons();
    }
  });

  // --- GESTION DU PANNEAU DE TEXTE ---
  function toggleTextPanel() {
    textPanel.classList.toggle("hidden");
  }
  textToolBtn.addEventListener("click", toggleTextPanel);
  closeTextPanelBtn.addEventListener("click", toggleTextPanel);

  // --- GESTION DES ÉLÉMENTS ---
  function createTextElement(data) {
    const textDiv = document.createElement("div");
    textDiv.className = "text-overlay";
    textDiv.innerText = data.content;
    textDiv.style.backgroundColor = data.bgColor;
    textDiv.style.color = data.color;
    textDiv.style.left = data.left;
    textDiv.style.top = data.top;
    textDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      selectText(textDiv);
    });
    textDiv.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      selectText(textDiv);
      isDragging = true;
      offsetX = e.clientX - textDiv.getBoundingClientRect().left;
      offsetY = e.clientY - textDiv.getBoundingClientRect().top;
      textDiv.style.cursor = "grabbing";
    });
    imageContainer.appendChild(textDiv);
    return textDiv;
  }

  function selectText(element) {
    if (selectedTextElement) {
      selectedTextElement.classList.remove("selected");
    }
    selectedTextElement = element;
    if (selectedTextElement) {
      selectedTextElement.classList.add("selected");
    }
    deleteBtn.disabled = selectedTextElement === null;
  }

  // --- GESTION DES ÉVÉNEMENTS ---
  imageLoader.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageDisplay.src = event.target.result;
        imageDisplay.onload = () => reset(true);
      };
      reader.readAsDataURL(file);
    }
  });

  addTextBtn.addEventListener("click", () => {
    const textValue = textPanelInput.value.trim();
    if (textValue === "") return;
    createTextElement({
      content: textValue,
      left: "50px",
      top: "50px",
      bgColor: textPanelColor.value,
      color: "black",
    });
    textPanelInput.value = "";
    toggleTextPanel();
    saveState();
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging && selectedTextElement) {
      const parentRect = imageContainer.getBoundingClientRect();
      let newX = e.clientX - parentRect.left - offsetX;
      let newY = e.clientY - parentRect.top - offsetY;
      selectedTextElement.style.left = `${newX}px`;
      selectedTextElement.style.top = `${newY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      if (selectedTextElement) {
        selectedTextElement.style.cursor = "grab";
      }
      saveState();
    }
  });

  deleteBtn.addEventListener("click", () => {
    if (selectedTextElement) {
      selectedTextElement.remove();
      selectText(null);
      saveState();
    }
  });

  function reset(isNewImage = false) {
    imageContainer
      .querySelectorAll(".text-overlay")
      .forEach((el) => el.remove());
    selectText(null);
    if (!isNewImage) imageDisplay.src = "";
    history = [];
    redoStack = [];
    saveState();
  }
  resetBtn.addEventListener("click", () => reset(false));

  downloadBtn.addEventListener("click", () => {
    selectText(null);
    html2canvas(imageContainer).then((canvas) => {
      const link = document.createElement("a");
      link.download = "image-modifiee.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });

  // --- LOGIQUE DE ROGNAGE ---
  function enterCropMode() {
    if (!imageDisplay.src || cropper) return;
    editorTitle.innerText = "Rogner l'image";
    mainControls.classList.add("hidden");
    downloadWrapper.classList.add("hidden"); // Cache le bouton de téléchargement
    cropActions.classList.remove("hidden"); // Affiche les actions de rognage
    imageContainer
      .querySelectorAll(".text-overlay")
      .forEach((el) => (el.style.display = "none"));
    cropper = new Cropper(imageDisplay, {
      viewMode: 1,
      background: false,
    });
  }

  function exitCropMode() {
    if (!cropper) return;
    editorTitle.innerText = "Éditeur d'images";
    cropper.destroy();
    cropper = null;
    mainControls.classList.remove("hidden");
    downloadWrapper.classList.remove("hidden"); // Réaffiche le bouton de téléchargement
    cropActions.classList.add("hidden"); // Cache les actions de rognage
    imageContainer
      .querySelectorAll(".text-overlay")
      .forEach((el) => (el.style.display = "block"));
  }

  cropToolBtn.addEventListener("click", enterCropMode);
  cancelCropBtn.addEventListener("click", exitCropMode);

  confirmCropBtn.addEventListener("click", () => {
    if (!cropper) return;
    const cropData = cropper.getData();
    const croppedCanvas = cropper.getCroppedCanvas();
    imageDisplay.src = croppedCanvas.toDataURL("image/png");
    imageDisplay.onload = () => {
      imageContainer.querySelectorAll(".text-overlay").forEach((textDiv) => {
        const currentLeft = parseFloat(textDiv.style.left);
        const currentTop = parseFloat(textDiv.style.top);
        textDiv.style.left = `${currentLeft - cropData.x}px`;
        textDiv.style.top = `${currentTop - cropData.y}px`;
      });
      exitCropMode();
      saveState();
    };
  });

  // Initialisation
  saveState();
});