const STORAGE_KEY = "flowTask.tasks";
const form = document.querySelector("#taskForm");
const fields = {
  title: document.querySelector("#title"),
  description: document.querySelector("#description"),
  category: document.querySelector("#category"),
  date: document.querySelector("#date"),
  priority: document.querySelector("#priority"),
  status: document.querySelector("#status")
};

let tasks = [];
try { tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { tasks = []; }

const editId = new URLSearchParams(location.search).get("id");
const editTask = editId ? tasks.find(task => task.id === editId) : null;

function todayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
}

function updateCount() { document.querySelector("#descriptionCount").textContent = fields.description.value.length; }

if (editTask) {
  document.title = "Editar tarea | Flow Task";
  document.querySelector("#formEyebrow").textContent = "Actualiza la información";
  document.querySelector("#formTitle").textContent = "Editar tarea";
  document.querySelector("#submitButton").innerHTML = '<i class="bi bi-check2 me-1"></i>Guardar cambios';
  Object.keys(fields).forEach(key => { fields[key].value = editTask[key] || ""; });
  updateCount();
} else {
  fields.date.value = todayString();
  fields.date.min = todayString();
}

fields.description.addEventListener("input", updateCount);

form.addEventListener("submit", event => {
  event.preventDefault();
  event.stopPropagation();
  form.classList.add("was-validated");
  if (!form.checkValidity()) return;

  const data = {
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    category: fields.category.value,
    date: fields.date.value,
    priority: fields.priority.value,
    status: fields.status.value
  };

  if (editTask) {
    Object.assign(editTask, data, { updatedAt: new Date().toISOString() });
    sessionStorage.setItem("flowTask.notice", "Los cambios se guardaron correctamente.");
  } else {
    tasks.push({ id: `task-${Date.now()}`, ...data, createdAt: new Date().toISOString() });
    sessionStorage.setItem("flowTask.notice", "La tarea se creó correctamente.");
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  location.href = "tareas.html";
});

document.querySelector("#year").textContent = new Date().getFullYear();
