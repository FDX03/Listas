// Clase para representar una Tarea individual
class Task {
    /**
     * @param {string} description - La descripción de la tarea.
     * @param {string} id - ID único para la tarea (por defecto, un timestamp).
     */
    constructor(description, id = Date.now().toString()) {
        this.id = id;
        this.description = description;
        this.completed = false; // Propiedad adicional para indicar si la tarea está completada
    }
}

// Clase para gestionar todas las tareas y la interacción con el DOM
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks(); // Cargar tareas al iniciar
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskListUl = document.getElementById('taskList');

        this._bindEvents(); // enlaza los eventos a los métodos de la clase
        this.renderTasks(); // Renderiza las tareas iniciales
    }

    /**
     * Carga las tareas desde el localStorage.
     * @returns {Task[]} Un array de objetos Task.
     */
    loadTasks() {
        const tasksJSON = localStorage.getItem('tasks');
        return tasksJSON ? JSON.parse(tasksJSON).map(taskData => new Task(taskData.description, taskData.id)) : [];
    }

    /**
     * Guarda las tareas en el localStorage.
     */
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    /**
     * Enlaza los listeners de eventos a los elementos del DOM.
     * Usa arrow functions o .bind(this) para mantener el contexto de 'this'.
     */
    _bindEvents() {
        this.addTaskBtn.addEventListener('click', this.handleAddTask.bind(this));
        // Permitir añadir tareas también con la tecla Enter en el input
        this.taskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleAddTask();
            }
        });
        // Usamos delegación de eventos en el UL para manejar clicks en Editar/Eliminar
        this.taskListUl.addEventListener('click', this.handleTaskActions.bind(this));
    }

    /**
     * Maneja la adición de una nueva tarea.
     */
    handleAddTask() {
        const description = this.taskInput.value.trim();
        if (description) {
            this.addTask(description);
            this.taskInput.value = ''; // Limpiar el input después de añadir
            this.taskInput.focus(); // Volver a enfocar el input
        } else {
            alert('¡La descripción de la tarea no puede estar vacía!');
        }
    }

    /**
     * Maneja las acciones de Editar y Eliminar tareas a través de delegación de eventos.
     * @param {Event} event - El objeto de evento del click.
     */
    handleTaskActions(event) {
        const target = event.target;
        const listItem = target.closest('li'); // Encuentra el elemento <li> más cercano
        
        if (!listItem) return; // No es un elemento de tarea

        const taskId = listItem.dataset.id; // Obtenemos el ID almacenado en el <li>

        if (target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                this.deleteTask(taskId);
            }
        } else if (target.classList.contains('edit-btn')) {
            const currentDescription = listItem.querySelector('.task-description').textContent;
            const newDescription = prompt('Editar tarea:', currentDescription);
            if (newDescription !== null) { // Si el usuario no cancela el prompt
                if (newDescription.trim() !== '') {
                    this.editTask(taskId, newDescription.trim());
                } else {
                    alert('La descripción no puede estar vacía. La tarea no se modificó.');
                }
            }
        }
    }

    /**
     * Añade una nueva tarea al array y actualiza el DOM.
     * @param {string} description - La descripción de la tarea.
     */
    addTask(description) {
        const newTask = new Task(description);
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
    }

    /**
     * Elimina una tarea del array y actualiza el DOM.
     * @param {string} id - El ID de la tarea a eliminar.
     */
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    /**
     * Edita la descripción de una tarea existente.
     * @param {string} id - El ID de la tarea a editar.
     * @param {string} newDescription - La nueva descripción.
     */
    editTask(id, newDescription) {
        const taskToEdit = this.tasks.find(task => task.id === id);
        if (taskToEdit) {
            taskToEdit.description = newDescription;
            this.saveTasks();
            this.renderTasks();
        }
    }

    /**
     * Renderiza todas las tareas en el DOM.
     * Limpia la lista existente y la reconstruye.
     */
    renderTasks() {
        this.taskListUl.innerHTML = ''; // Limpia la lista actual

        if (this.tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = '¡No hay tareas aún! Añade una nueva.';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.color = '#777';
            emptyMessage.style.justifyContent = 'center';
            this.taskListUl.appendChild(emptyMessage);
            return;
        }

        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id; // Guarda el ID de la tarea en el elemento DOM

            const spanDescription = document.createElement('span');
            spanDescription.classList.add('task-description');
            spanDescription.textContent = task.description;

            const divActions = document.createElement('div');
            divActions.classList.add('task-actions');

            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Editar';

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Eliminar';

            divActions.appendChild(editBtn);
            divActions.appendChild(deleteBtn);

            li.appendChild(spanDescription);
            li.appendChild(divActions);
            this.taskListUl.appendChild(li);
        });
    }
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});