const STORAGE_KEY = "flowTask.tasks";
let tasks = [];
let taskToDelete = null;

const starterTasks = [
  { id: "task-1", title: "Hacer presentación", description: "Preparar las diapositivas para la exposición.", category: "Escuela", date: "2026-09-23", priority: "Alta", status: "proceso", createdAt: "2026-09-20T10:00:00.000Z" },
  { id: "task-2", title: "Comprar material", description: "Conseguir cartulinas y marcadores.", category: "Personal", date: "2026-09-24", priority: "Media", status: "pendiente", createdAt: "2026-09-20T11:00:00.000Z" },
  { id: "task-3", title: "Terminar maqueta", description: "Revisar la versión responsiva de la página.", category: "Escuela", date: "2026-09-25", priority: "Alta", status: "proceso", createdAt: "2026-09-20T12:00:00.000Z" },
  { id: "task-4", title: "Subir evidencias", description: "Entregar los archivos finales en la plataforma.", category: "Estudio", date: "2026-09-26", priority: "Media", status: "pendiente", createdAt: "2026-09-20T13:00:00.000Z" },
  { id: "task-5", title: "Estudiar examen", description: "Repasar los temas vistos durante la semana.", category: "Estudio", date: "2026-09-28", priority: "Alta", status: "pendiente", createdAt: "2026-09-20T14:00:00.000Z" }
];

const elements = {
  list: document.querySelector("#taskList"),
  empty: document.querySelector("#emptyState"),
  search: document.querySelector("#searchInput"),
  category: document.querySelector("#categoryFilter"),
  status: document.querySelector("#statusFilter"),
  count: document.querySelector("#resultCount")
};

function loadTasks() {
  try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { tasks = []; }
  if (!localStorage.getItem(STORAGE_KEY)) { tasks = starterTasks; saveTasks(); }
}

function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function escapeHtml(value = "") {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function statusLabel(status) { return { pendiente: "Pendiente", proceso: "En proceso", hecha: "Hecha" }[status]; }
function statusBadge(status) { return { pendiente: "text-bg-warning", proceso: "text-bg-primary", hecha: "text-bg-success" }[status]; }

function filteredTasks() {
  const query = elements.search.value.trim().toLocaleLowerCase("es");
  return tasks.filter(task => {
    const matchesText = `${task.title} ${task.description || ""}`.toLocaleLowerCase("es").includes(query);
    const matchesCategory = elements.category.value === "todas" || task.category === elements.category.value;
    const matchesStatus = elements.status.value === "todos" || task.status === elements.status.value;
    return matchesText && matchesCategory && matchesStatus;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderTasks() {
  const visible = filteredTasks();
  elements.count.textContent = `${visible.length} ${visible.length === 1 ? "tarea" : "tareas"}`;
  elements.empty.classList.toggle("d-none", visible.length > 0);
  elements.list.classList.toggle("d-none", visible.length === 0);
  elements.list.innerHTML = visible.map(task => `
    <article class="task-card p-3 p-lg-4 ${task.status === "hecha" ? "completed" : ""}" data-id="${task.id}">
      <div class="d-flex flex-wrap flex-lg-nowrap align-items-start align-items-lg-center gap-3">
        <div class="form-check pt-1"><input class="form-check-input task-check fs-5" type="checkbox" ${task.status === "hecha" ? "checked" : ""} aria-label="Marcar ${escapeHtml(task.title)} como completada"></div>
        <div class="flex-grow-1">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-1"><h2 class="task-title h5 mb-0">${escapeHtml(task.title)}</h2><span class="badge rounded-pill ${statusBadge(task.status)}">${statusLabel(task.status)}</span></div>
          <p class="task-description mb-2">${escapeHtml(task.description || "Sin descripción")}</p>
          <div class="task-meta d-flex flex-wrap gap-3"><span><i class="bi bi-folder me-1"></i>${escapeHtml(task.category)}</span><span><i class="bi bi-calendar3 me-1"></i>${formatDate(task.date)}</span><span><span class="priority-dot priority-${task.priority.toLowerCase()} me-1"></span>Prioridad ${escapeHtml(task.priority.toLowerCase())}</span></div>
        </div>
        <div class="task-actions d-flex gap-2 ms-lg-auto">
          <a class="btn btn-outline-secondary edit-task" href="nueva-tarea.html?id=${encodeURIComponent(task.id)}"><i class="bi bi-pencil me-1"></i>Editar</a>
          <button class="btn btn-outline-danger delete-task" type="button"><i class="bi bi-trash3 me-1"></i>Eliminar</button>
        </div>
      </div>
    </article>`).join("");
}

function showToast(message) {
  document.querySelector("#toastMessage").textContent = message;
  bootstrap.Toast.getOrCreateInstance(document.querySelector("#taskToast")).show();
}

elements.list.addEventListener("change", event => {
  if (!event.target.matches(".task-check")) return;
  const id = event.target.closest("[data-id]").dataset.id;
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  task.status = event.target.checked ? "hecha" : "pendiente";
  saveTasks(); renderTasks(); showToast(event.target.checked ? "Tarea completada." : "Tarea marcada como pendiente.");
});

elements.list.addEventListener("click", event => {
  const button = event.target.closest(".delete-task");
  if (!button) return;
  taskToDelete = button.closest("[data-id]").dataset.id;
  const task = tasks.find(item => item.id === taskToDelete);
  document.querySelector("#deleteTaskName").textContent = `“${task.title}”`;
  bootstrap.Modal.getOrCreateInstance(document.querySelector("#deleteModal")).show();
});

document.querySelector("#confirmDelete").addEventListener("click", () => {
  tasks = tasks.filter(task => task.id !== taskToDelete);
  saveTasks(); renderTasks();
  bootstrap.Modal.getOrCreateInstance(document.querySelector("#deleteModal")).hide();
  showToast("La tarea se eliminó correctamente.");
});

[elements.search, elements.category, elements.status].forEach(input => input.addEventListener("input", renderTasks));

const requestedStatus = new URLSearchParams(location.search).get("estado");
if (["pendiente", "proceso", "hecha"].includes(requestedStatus)) elements.status.value = requestedStatus;
loadTasks(); renderTasks();
document.querySelector("#year").textContent = new Date().getFullYear();

const notice = sessionStorage.getItem("flowTask.notice");
if (notice) { sessionStorage.removeItem("flowTask.notice"); setTimeout(() => showToast(notice), 150); }
