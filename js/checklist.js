// js/checklist.js
document.addEventListener("DOMContentLoaded", () => {
  // --- DONNÉES : Vos tâches prédéfinies ---
  const PREDEFINED_TASKS = [
    { id: "task-01", text: "Vérifier la compatibilité avec les navigateurs" },
    { id: "task-02", text: "Optimiser les images pour le web" },
    { id: "task-03", text: "Minifier les fichiers CSS et JavaScript" },
    { id: "task-04", text: "S'assurer de l'accessibilité (contrastes, balises alt)" },
    { id: "task-05", text: "Tester le design sur mobile et tablette" },
    { id: "task-06", text: "Valider le code HTML et CSS" },
    { id: "task-07", text: "Mettre en place une politique de cache efficace" },
    { id: "task-08", text: "Mettre en place une politique de cache efficace" },
    { id: "task-09", text: "Mettre en place une politique de cache efficace" },
    { id: "task-10", text: "Mettre en place une politique de cache efficace" },
    { id: "task-11", text: "Mettre en place une politique de cache efficace" },
    { id: "task-12", text: "Mettre en place une politique de cache efficace" },
    { id: "task-13", text: "Mettre en place une politique de cache efficace" },
    { id: "task-14", text: "Mettre en place une politique de cache efficace" },
    { id: "task-15", text: "Mettre en place une politique de cache efficace" },
    { id: "task-16", text: "Mettre en place une politique de cache efficace" },
    { id: "task-17", text: "Mettre en place une politique de cache efficace" },
    { id: "task-18", text: "Mettre en place une politique de cache efficace" },
    { id: "task-19", text: "Mettre en place une politique de cache efficace" }
  ];

  // Sélecteurs
  const taskListContainer = document.getElementById("task-list-container");
  const resetBtn = document.getElementById("reset-checklist-btn");

  // --- FONCTIONS ---

  /**
   * Génère et affiche toutes les tâches dans le DOM.
   */
  function renderTasks() {
    // Vide le conteneur avant de tout recréer
    taskListContainer.innerHTML = "";

    PREDEFINED_TASKS.forEach((task) => {
      // Crée l'élément principal de la tâche
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";

      // Récupère l'état sauvegardé (si 'true', la tâche est cochée)
      const isCompleted = localStorage.getItem(task.id) === "true";

      if (isCompleted) {
        taskItem.classList.add("completed");
      }

      // Crée la structure HTML de la tâche
      taskItem.innerHTML = `
        <label class="task-checkbox">
          <input type="checkbox" data-task-id="${task.id}" ${
        isCompleted ? "checked" : ""
      }>
          <span class="custom-checkbox">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </span>
          <span class="task-label">${task.text}</span>
        </label>
      `;

      // Ajoute l'écouteur d'événement pour le changement d'état
      const checkbox = taskItem.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => {
        const taskId = checkbox.dataset.taskId;
        const isChecked = checkbox.checked;

        // Met à jour le style visuel
        taskItem.classList.toggle("completed", isChecked);

        // Sauvegarde le nouvel état dans le localStorage
        localStorage.setItem(taskId, isChecked);
      });

      // Ajoute la tâche complète au conteneur
      taskListContainer.appendChild(taskItem);
    });
  }

  /**
   * Gère le clic sur le bouton de réinitialisation.
   */
  resetBtn.addEventListener("click", () => {
    // Parcourt toutes les tâches prédéfinies
    PREDEFINED_TASKS.forEach((task) => {
      // Supprime l'état sauvegardé pour chaque tâche
      localStorage.setItem(task.id, "false");
    });

    // Regénère l'affichage pour refléter les changements
    renderTasks();
  });

  // --- INITIALISATION ---
  // Affiche les tâches au chargement de la page
  renderTasks();
});