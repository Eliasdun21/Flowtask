const STORAGE_KEY = "flowTask.tasks";

const starterTasks = [
  { id: "task-1", title: "Hacer presentación", description: "Preparar las diapositivas para la exposición.", category: "Escuela", date: "2026-09-23", priority: "Alta", status: "proceso", createdAt: "2026-09-20T10:00:00.000Z" },
  { id: "task-2", title: "Comprar material", description: "Conseguir cartulinas y marcadores.", category: "Personal", date: "2026-09-24", priority: "Media", status: "pendiente", createdAt: "2026-09-20T11:00:00.000Z" },
  { id: "task-3", title: "Terminar maqueta", description: "Revisar la versión responsiva de la página.", category: "Escuela", date: "2026-09-25", priority: "Alta", status: "proceso", createdAt: "2026-09-20T12:00:00.000Z" },
  { id: "task-4", title: "Subir evidencias", description: "Entregar los archivos finales en la plataforma.", category: "Estudio", date: "2026-09-26", priority: "Media", status: "pendiente", createdAt: "2026-09-20T13:00:00.000Z" },
  { id: "task-5", title: "Estudiar examen", description: "Repasar los temas vistos durante la semana.", category: "Estudio", date: "2026-09-28", priority: "Alta", status: "pendiente", createdAt: "2026-09-20T14:00:00.000Z" },
  { id: "task-6", title: "Enviar investigación", description: "Compartir el documento con el equipo.", category: "Escuela", date: "2026-09-19", priority: "Baja", status: "hecha", createdAt: "2026-09-19T14:00:00.000Z" },
  { id: "task-7", title: "Organizar apuntes", description: "Separar los apuntes por materia.", category: "Personal", date: "2026-09-18", priority: "Baja", status: "hecha", createdAt: "2026-09-18T14:00:00.000Z" }
];

function getTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterTasks));
    return starterTasks;
  }
  try { return JSON.parse(saved); } catch { return starterTasks; }
}

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function statusLabel(status) {
  return { pendiente: "Pendiente", proceso: "En proceso", hecha: "Hecha" }[status] || "Pendiente";
}

function renderSummary(tasks) {
  const summary = [
    { key: "pendiente", title: "Pendientes", icon: "bi-hourglass-split", className: "pending" },
    { key: "proceso", title: "En proceso", icon: "bi-arrow-repeat", className: "progress" },
    { key: "hecha", title: "Hechas", icon: "bi-check2-circle", className: "done" }
  ];
  document.querySelector("#summaryCards").innerHTML = summary.map(item => `
    <div class="col-md-4">
      <a href="tareas.html?estado=${item.key}" class="text-decoration-none text-reset">
        <article class="summary-card h-100 p-4 d-flex align-items-center gap-3">
          <span class="summary-icon ${item.className}"><i class="bi ${item.icon}"></i></span>
          <div><p class="mb-1 text-secondary">${item.title}</p><span class="summary-number">${tasks.filter(task => task.status === item.key).length}</span></div>
        </article>
      </a>
    </div>`).join("");
}

function renderRecent(tasks) {
  const recent = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const container = document.querySelector("#recentTasks");
  if (!recent.length) {
    container.innerHTML = `<div class="col-12"><div class="empty-state text-center py-5"><i class="bi bi-journal-check fs-1"></i><h3 class="h5 mt-2">Aún no tienes tareas</h3><a class="btn btn-flow mt-2" href="nueva-tarea.html">Crear la primera</a></div></div>`;
    return;
  }
  container.innerHTML = recent.map(task => `
    <div class="col-md-6 col-xl-4">
      <article class="task-card h-100 p-4 ${task.status === "hecha" ? "completed" : ""}">
        <div class="d-flex justify-content-between gap-3 mb-3">
          <span class="badge rounded-pill bg-light text-dark border">${escapeHtml(task.category)}</span>
          <span class="badge rounded-pill ${task.status === "hecha" ? "text-bg-success" : task.status === "proceso" ? "text-bg-primary" : "text-bg-warning"}">${statusLabel(task.status)}</span>
        </div>
        <h3 class="task-title h5">${escapeHtml(task.title)}</h3>
        <p class="task-description small text-truncate">${escapeHtml(task.description || "Sin descripción")}</p>
        <div class="task-meta d-flex justify-content-between gap-2 mt-4"><span><i class="bi bi-calendar3 me-1"></i>${formatDate(task.date)}</span><span><span class="priority-dot priority-${task.priority.toLowerCase()} me-1"></span>${escapeHtml(task.priority)}</span></div>
      </article>
    </div>`).join("");
}

const tasks = getTasks();
renderSummary(tasks);
renderRecent(tasks);
document.querySelector("#year").textContent = new Date().getFullYear();
