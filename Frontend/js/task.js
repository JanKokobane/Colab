// Fetch users and populate assignee dropdown
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:5000/users')
        .then(response => response.json())
        .then(users => {

            const assigneeSelect = document.getElementById('assignee');
            assigneeSelect.innerHTML = '<option value="">Select team member</option>'; // Clear existing options

            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                assigneeSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
});

// Validation Function
function validateForm() {
    // Clear previous error messages
    clearMessages();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const assignee = document.getElementById('assignee').value;
    const due_date = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;

    let hasError = false;

    if (!title) {
        document.getElementById('title-error').textContent = 'Title is required.';
        hasError = true;
    }
    if (!description) {
        document.getElementById('description-error').textContent = 'Description is required.';
        hasError = true;
    }
    if (!assignee) {
        document.getElementById('assignee-error').textContent = 'Assignee is required.';
        hasError = true;
    }
    if (!due_date) {
        document.getElementById('due-date-error').textContent = 'Due date is required.';
        hasError = true;
    }
    if (!priority) {
        document.getElementById('priority-error').textContent = 'Priority is required.';
        hasError = true;
    }

    if (hasError) {
        document.getElementById('form-error').textContent = 'Please add all required fields.';
        return false;
    }
    return true;
}

// Function to show notifications
const showNotification = (message, isError = false) => {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : ''} show`;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Form Submission Function
function submitForm(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const assignee = document.getElementById('assignee').value;
    const due_date = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;

    fetch('http://127.0.0.1:5000/add-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            description: description,
            assignee: assignee,
            due_date: due_date,
            priority: priority
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showNotification('Error adding task: ' + data.error, true);
        } else {
            showNotification('Task added successfully!');

            // Clear form fields
            document.getElementById('addTaskForm').reset();

            // Set a 3-second delay before closing the modal
            setTimeout(() => {
                modal.style.display = 'none';
                clearMessages();
            }, 3000);
        }
    })
    .catch(error => {
        showNotification('An unexpected error occurred: ' + error.message, true);
    });
}

// Function to clear messages
function clearMessages() {
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('form-error').textContent = '';
    document.getElementById('success-message').textContent = '';
}

// Event Listener for Form Submission
document.getElementById('addTaskForm').addEventListener('submit', submitForm);

// Other Task Management Logic
const taskLists = document.querySelectorAll('.task-list');
const addTaskBtn = document.querySelector('.add-task-btn');
const modal = document.getElementById('addTaskModal');
const cancelBtn = document.querySelector('.cancel-btn');

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    clearMessages();
});

addTaskBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/tasks');
        const tasks = await response.json();

        const todoColumn = document.getElementById('todo-column').querySelector('.task-list');
        const progressColumn = document.getElementById('progress-column').querySelector('.task-list');
        const doneColumn = document.getElementById('done-column').querySelector('.task-list');

        const getInitials = (name) => {
            const initials = name.split(' ').map(word => word.charAt(0)).join('');
            return initials.toUpperCase();
        };

        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            taskCard.draggable = true;

            // Extract only the date part of the due_date
            const dueDate = new Date(task.due_date).toISOString().split('T')[0];
            const initials = getInitials(task.assignee);

            taskCard.innerHTML = `
                <div class="task-tags">
                    <span class="tag ${task.priority.toLowerCase()}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                </div>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <div class="task-meta">
                    <span class="due-date">Due ${dueDate}</span>
                </div>
                <i class="fas fa-trash delete-task-btn" data-task-id="${task.id}"></i>
            `;

            // Categorize tasks based on priority and due date
            const today = new Date().toISOString().split('T')[0];
            if (new Date(task.due_date) < new Date(today)) {
                doneColumn.appendChild(taskCard);
            } else if (task.priority.toLowerCase() === 'high') {
                progressColumn.appendChild(taskCard);
            } else {
                todoColumn.appendChild(taskCard);
            }

            // Add delete functionality
            taskCard.querySelector('.delete-task-btn').addEventListener('click', async (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                try {
                    const deleteResponse = await fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
                        method: 'DELETE',
                    });
                    if (deleteResponse.ok) {
                        taskCard.remove();
                        showNotification('Task deleted successfully!');
                    } else {
                        showNotification('Error deleting task', true);
                    }
                } catch (error) {
                    showNotification('Error deleting task: ' + error.message, true);
                }
            });
        });

        // Update task counts
        document.querySelectorAll('.column').forEach(column => {
            const count = column.querySelectorAll('.task-card').length;
            column.querySelector('.task-count').textContent = count;
        });

        // Drag and Drop Functionality
        const taskLists = document.querySelectorAll('.task-list');

        taskLists.forEach(taskList => {
            taskList.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingCard = document.querySelector('.dragging');
                const cards = [...taskList.querySelectorAll('.task-card:not(.dragging)')];
                const closestCard = cards.reduce((closest, card) => {
                    const box = card.getBoundingClientRect();
                    const offset = e.clientY - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset, element: card };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;

                if (closestCard) {
                    taskList.insertBefore(draggingCard, closestCard);
                } else {
                    taskList.appendChild(draggingCard);
                }
            });
        });

        // Make task cards draggable
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', () => {
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

    } catch (error) {
        showNotification('Error fetching tasks: ' + error.message, true);
    }
});



