let currentEditingTaskId = null;
let currentFilter = 'all';

// Initialize todos array to store tasks
let todos = [];
let currentEditId = null;

// Function to add a new todo
function addTodo() {
    const inputElement = document.getElementById('inputTitle');
    const title = inputElement.value.trim();
    
    if (title === '') {
        return; // Don't add empty tasks
    }
    
    // Create new todo object
    const newTodo = {
        id: Date.now(), // Use timestamp as unique ID
        title: title,
        description: '',
        completed: false,
        createdAt: new Date()
    };
    
    // Add to array
    todos.push(newTodo);
    
    // Save to localStorage
    saveTodos();
    
    // Clear input field
    inputElement.value = '';
    
    // Refresh display
    renderTodos();
}

// Function to render todos in the list
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    const filterValue = document.getElementById('filterSelect').value;
    
    // Clear current list
    todoList.innerHTML = '';
    
    // Filter todos based on selection
    let filteredTodos = todos;
    if (filterValue === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    } else if (filterValue === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    }
    
    // Create HTML for each todo
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'todo-item';
        todoItem.innerHTML = `
            <div class="d-flex flex-row align-items-center p-2 m-1 ${todo.completed ? 'completed-task' : ''}">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="toggleTodoStatus(${todo.id})">
                </div>
                <div class="ms-3 flex-grow-1">
                    <h6 class="mb-0 ${todo.completed ? 'text-decoration-line-through' : ''}">${todo.title}</h6>
                    <p class="small text-muted mb-0">${todo.description || ''}</p>
                </div>
                <div class="actions">
                    <a href="#!" class="text-info" data-mdb-toggle="modal" data-mdb-target="#editTaskModal" 
                       onclick="prepareEditTask(${todo.id})">
                        <i class="fas fa-pencil-alt me-3"></i>
                    </a>
                    <a href="#!" class="text-danger" onclick="deleteTodo(${todo.id})">
                        <i class="fas fa-trash-alt"></i>
                    </a>
                </div>
            </div>
        `;
        todoList.appendChild(todoItem);
    });
}

// Toggle todo completed status
function toggleTodoStatus(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// Prepare edit task modal
function prepareEditTask(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        document.getElementById('editTaskTitle').value = todo.title;
        document.getElementById('editTaskDescription').value = todo.description || '';
        currentEditId = id;
    }
}

// Save edited task
function saveEditedTask() {
    if (currentEditId) {
        const title = document.getElementById('editTaskTitle').value.trim();
        const description = document.getElementById('editTaskDescription').value.trim();
        
        if (title === '') return;
        
        todos = todos.map(todo => {
            if (todo.id === currentEditId) {
                return { ...todo, title, description };
            }
            return todo;
        });
        
        saveTodos();
        renderTodos();
        
        // Close modal
        const modalEl = document.getElementById('editTaskModal');
        const modal = mdb.Modal.getInstance(modalEl);
        modal.hide();
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Load todos from localStorage
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
    renderTodos();
}

// Reload app
function reloadApp() {
    loadTodos();
}

// Add event listener for filter changes
document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    
    const filterSelect = document.getElementById('filterSelect');
    filterSelect.addEventListener('change', renderTodos);
    
    // Add event listener for Enter key in input field
    const inputElement = document.getElementById('inputTitle');
    inputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
});

// API呼び出し用のヘルパー関数
async function apiRequest(url, method, data = null) {
    const csrftoken = getCookie("csrftoken");
    try {
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            }
        };
        
        if (data && (method !== "GET")) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error(`APIリクエストに失敗しました: ${url}, ステータス: ${response.status}`);
            return null;
        }
        
        return method === "DELETE" ? true : await response.json();
    } catch (error) {
        console.error(`APIリクエスト中にエラーが発生しました: ${url}`, error);
        return null;
    }
}

// データ操作関数
async function updateTodoStatus(id, completed) {
    await apiRequest(`/unitApp/todos/${id}/`, "PATCH", { completed });
    fetchTodos();
}

async function deleteTask(id) {
    await apiRequest(`/unitApp/todos/deleteTask/`, "DELETE", { id });
    fetchTodos();
}

async function updateTodo(id, newTitle, newDescription) {
    await apiRequest(`/unitApp/todos/updateTask/`, "POST", { 
        id, 
        title: newTitle, 
        description: newDescription 
    });
    fetchTodos();
}

// モーダル関連の関数
function openEditModal(id, currentTitle, currentDescription) {
    currentEditingTaskId = id;
    document.getElementById('editTaskTitle').value = currentTitle;
    document.getElementById('editTaskDescription').value = currentDescription;
    const editTaskModal = new mdb.Modal(document.getElementById('editTaskModal'));
    editTaskModal.show();
}

// Todoリストの取得と表示
async function fetchTodos() {
    const todos = await apiRequest("/unitApp/todos/", "GET");
    if (!todos) return;
    
    const sortedTodos = todos.sort((a, b) => a.order - b.order);
    const todoList = document.getElementById("todo-list");
        
    todoList.innerHTML = sortedTodos
        .filter(todo => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'completed') return todo.completed;
            if (currentFilter === 'active') return !todo.completed;
        })
        .map(todo => {
            const safeTitle = (todo.title || '').replace(/'/g, "\\'");
            const safeDescription = (todo.description || '').replace(/'/g, "\\'");
            return `
                <ul class="list-group list-group-horizontal rounded-0 bg-transparent mb-2" 
                    draggable="true" data-id="${todo.id}">
                    <li class="list-group-item d-flex align-items-center ps-0 pe-3 py-1 rounded-0 border-0 bg-transparent">
                        <div class="form-check">
                            <input class="form-check-input me-0" type="checkbox" id="todo-${todo.id}"
                                ${todo.completed ? "checked" : ""} onchange="updateTodoStatus(${todo.id}, this.checked)">
                        </div>
                    </li>
                    <li class="list-group-item px-3 py-1 d-flex align-items-center flex-grow-1 border-0 bg-transparent">
                        <p class="lead fw-normal mb-0">${safeTitle}</p>
                    </li>
                    <li class="list-group-item ps-3 pe-0 py-1 rounded-0 border-0 bg-transparent">
                        <div class="d-flex flex-row justify-content-end mb-1">
                            <a class="text-info me-2" data-mdb-tooltip-init title="タスクを編集" onclick="openEditModal(${todo.id}, '${safeTitle}', '${safeDescription}')"><i class="fas fa-pencil-alt"></i></a>
                            <a class="text-danger me-2" data-mdb-tooltip-init title="タスクを削除" onclick="deleteTask(${todo.id})"><i class="fas fa-trash-alt"></i></a>
                            <a class="text-muted task-description" data-mdb-tooltip-init title="${safeDescription || '説明なし'}">
                                <i class="fas fa-info-circle"></i>
                            </a>
                        </div>
                    </li>
                </ul>
            `;
        }).join('');

    attachDragAndDropListeners();
    
    // ツールチップを初期化
    document.querySelectorAll('[data-mdb-tooltip-init]').forEach(el => new mdb.Tooltip(el));
}

// ドラッグ＆ドロップ機能
function attachDragAndDropListeners() {
    const items = document.querySelectorAll('#todo-list ul');
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', e => {
            draggedItem = e.target;
            e.target.style.opacity = "0.5";
        });

        item.addEventListener('dragend', e => {
            e.target.style.opacity = "";
        });

        item.addEventListener('dragover', e => e.preventDefault());

        item.addEventListener('drop', e => {
            e.preventDefault();
            if (e.target.closest('ul') && e.target.closest('ul') !== draggedItem) {
                const target = e.target.closest('ul');
                const parent = target.parentNode;

                parent.insertBefore(
                    draggedItem, 
                    Array.from(parent.children).indexOf(draggedItem) > Array.from(parent.children).indexOf(target)
                        ? target
                        : target.nextSibling
                );

                updateOrder();
            }
        });
    });
}

async function updateOrder() {
    const reorderedIds = Array.from(document.querySelectorAll('#todo-list ul')).map(
        item => item.dataset.id
    );

    await apiRequest("/unitApp/todos/updateOrder/", "POST", { order: reorderedIds });
}
