// js/mediatheque.js
import { addImage, getImages, deleteImage } from "./db-helper.js";

document.addEventListener("DOMContentLoaded", () => {
  const addImageInput = document.getElementById("add-image-input");
  const mediaGrid = document.getElementById("media-grid");

  async function renderMedia() {
    mediaGrid.innerHTML = "";
    const images = await getImages();
    images.forEach((image) => {
      const thumbnailUrl = URL.createObjectURL(image.file);
      const thumb = document.createElement("div");
      thumb.className = "media-thumbnail";
      thumb.innerHTML = `
        <img src="${thumbnailUrl}" alt="${image.name}">
        <button class="delete-media-btn" data-id="${image.id}" title="Supprimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      `;
      mediaGrid.appendChild(thumb);
    });
  }

  addImageInput.addEventListener("change", async (e) => {
    for (const file of e.target.files) {
      await addImage(file);
    }
    renderMedia();
  });

  mediaGrid.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-media-btn");
    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id, 10);
      await deleteImage(id);
      renderMedia();
    }
  });

  renderMedia();
});