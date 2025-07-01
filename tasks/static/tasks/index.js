//Import choices-utils
import {
  initUserFilterSelect,
  initTaskUserSelect,
  getSelectedTaskUserIds,
  clearUserFilterSelect,
  clearTaskUserSelect,
  initStatusFilterSelect,
  clearStatusFilterSelect,
  initProjectUserSelect,
  getSelectedProjectUserIds
} from './choices-utils.js';

let projectUserSelectInstance = null;
// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {

  //Load Projects, Tasks, Users
  loadProjects();
  loadTasks();
  loadUsers();

  document.querySelector('#search-title').addEventListener('input', loadTasks);
  document.querySelector('#filter-project').addEventListener('change', loadTasks);
  document.querySelector('#filter-status').addEventListener('change', loadTasks);
  document.querySelector('#filter-users').addEventListener('change', loadTasks);
  

  document.querySelector('#btn-clear-filters').addEventListener('click', () => {
    document.querySelector('#search-title').value = '';
    document.querySelector('#filter-project').value = '';
    Array.from(document.querySelector('#filter-status').options).forEach(opt => opt.selected = false);
    clearUserFilterSelect();
    clearStatusFilterSelect();
    loadTasks();
  });

  document.querySelector('#task-form').addEventListener('submit', e => {
  e.preventDefault();

    const form = e.target;
    const editingId = form.dataset.editing;  // if have ID then we're editing

    const title = document.querySelector('#task-title').value;
    const description = document.querySelector('#task-desc').value;
    const project = document.querySelector('#task-project').value || null;
    const status = document.querySelector('#task-status').value;
    
    const task_users = getSelectedTaskUserIds();
    const objective_date_input = document.querySelector('#task-objective-date').value;
    const objective_date = objective_date_input ? new Date(objective_date_input).toISOString() : null;


    const payload = { title, description, project, status, objective_date, task_users };

    if (status === 'OPEN') {
      payload.closed_date = null;
    }
    if (status === 'CLOSED') {
      payload.closed_date = new Date().toISOString();
    }

    const url = editingId ? `${API_BASE}tasks/${editingId}/` : `${API_BASE}tasks/`;
    const method = editingId ? 'PUT' : 'POST';

    // Create-Edit task
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN
      },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error(editingId ? 'Error editing task' : 'Error creating task');
        return res.json();
      })
      .then(data => {
        form.reset();        
        clearTaskUserSelect();
        delete form.dataset.editing; // Clear edition flag

        bootstrap.Modal.getInstance(document.getElementById('task-modal')).hide();
        loadTasks();
      })
      .catch(err => alert(err.message));
  });

  // Create-Edit Project
  document.querySelector('#project-form').addEventListener('submit', e => {
    e.preventDefault();

    const form = e.target;
    const title = document.querySelector('#project-title').value.trim();
    const description = document.querySelector('#project-description').value.trim();
    const status = document.querySelector('#project-status')?.value || 'OPEN';
    const objective_date_input = document.querySelector('#project-objective-date')?.value;
    const objective_date = objective_date_input ? new Date(objective_date_input).toISOString() : null;
    const project_users = getSelectedProjectUserIds();
                      

    if (!title) {
      alert('Project title is required');
      return;
    }
    const payload = {
      title,
      description,
      status,
      objective_date,
      users: project_users
    };
    const editingId = form.dataset.editing;
    if (editingId && window.currentlyEditingProject) {
      const original = window.currentlyEditingProject;

      if (status === 'CLOSED' && !original.closed_date) {
        payload.closed_date = new Date().toISOString(); 
      }

      if (original.status === 'CLOSED' && status !== 'CLOSED') {
        payload.closed_date = null;
      }
    }
    const url = editingId ? `${API_BASE}projects/${editingId}/` : `${API_BASE}projects/`;
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRF_TOKEN
    },
    body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error(editingId ? 'Error editing project' : 'Error creating project');
      return res.json();
    })
    .then(() => {
      form.reset();
      delete form.dataset.editing;
      bootstrap.Modal.getInstance(document.getElementById('project-modal')).hide();
      loadProjects();
    })
    .catch(err => alert(err.message));
  });
  // Toggle views from navbar
  document.querySelector('#nav-tasks')?.addEventListener('click', e => {
    e.preventDefault();
    const projectsView = document.querySelector('#project-view');
    const tasksView = document.querySelector('#page-view');

    projectsView.classList.add('hide');
    setTimeout(() => {
      projectsView.classList.add('d-none');
      tasksView.classList.remove('d-none');
      setTimeout(() => tasksView.classList.remove('hide'), 10);
    }, 400);
    Array.from(document.querySelector('#filter-status').options).forEach(opt => opt.selected = false);
    clearUserFilterSelect();
    clearStatusFilterSelect();
    loadTasks();
    setActiveNav('tasks');
      

  });
    document.querySelector('#nav-projects')?.addEventListener('click', e => {
    e.preventDefault();
    const projectsView = document.querySelector('#project-view');
    const tasksView = document.querySelector('#page-view');
    
    // Fade animation
    tasksView.classList.add('hide');
    setTimeout(() => {
      tasksView.classList.add('d-none');
      projectsView.classList.remove('d-none');
      setTimeout(() => projectsView.classList.remove('hide'), 10);
    }, 400);

    setActiveNav('projects');
  });
    // Show the task
    const projectsView = document.querySelector('#project-view');
    const tasksView = document.querySelector('#page-view');

    projectsView.classList.add('d-none');        // Hide Proyects
    tasksView.classList.remove('d-none');        // Show Tasks
    setTimeout(() => tasksView.classList.remove('hide'), 10);

    setActiveNav('tasks'); // Marca la nav activa

});

// Load Projects
function loadProjects() {
  fetch(`${API_BASE}projects/`)
    .then(res => res.json())
    .then(projects => {
      const filterSelect = document.querySelector('#filter-project');
      const modalSelect = document.querySelector('#task-project');

      [filterSelect, modalSelect].forEach(select => {
        select.innerHTML = '<option value="">All Projects</option>';
        projects.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.title;
          select.append(opt.cloneNode(true));
        });
      });
      renderProjectCards(projects);
    });
}

// Load Tasks
function loadTasks() {
  Promise.all([
    fetch(`${API_BASE}tasks/`).then(res => res.json()),
    fetch(`${API_BASE}users/`).then(res => res.json())
  ]).then(([tasks, users]) => {
    const titleFilter = document.querySelector('#search-title').value.toLowerCase();
    const projectFilter = document.querySelector('#filter-project').value;
    // Multiple selection for status and users
    const statusFilterValues = Array.from(document.querySelector('#filter-status').selectedOptions)
    .map(opt => opt.value);
    const userFilterValues = Array.from(document.querySelector('#filter-users').selectedOptions)
    .map(opt => parseInt(opt.value));

    // Clean views
    const allTasksContainer = document.querySelector('#all-tasks');
    allTasksContainer.classList.add('hide');
    // Fade
    setTimeout(() => {
      allTasksContainer.innerHTML = '';
      tasks
      .filter(task => {
        const matchesTitle = task.title.toLowerCase().includes(titleFilter);
        const matchesProject = !projectFilter || task.project == projectFilter;
        const matchesStatus = statusFilterValues.length === 0 || statusFilterValues.includes(task.status);
        const matchesUser =
      userFilterValues.length === 0 ||
      (
        (task.task_users_data && task.task_users_data.some(user => userFilterValues.includes(user.id))) ||
        (task.project_users_data && task.project_users_data.some(user => userFilterValues.includes(user.id)))
      );

        return matchesTitle && matchesProject && matchesStatus && matchesUser;
        
      })

      
      .forEach(task => {
        const card = renderTaskCard(task);
        allTasksContainer.append(card);

        
      });
      setTimeout(() => {
        allTasksContainer.classList.remove('hide');
      }, 10);
    }, 300);

  });
}

// Render Task Card
function renderTaskCard(task) {
  const template = document.querySelector('#task-card-template');
  const card = template.content.cloneNode(true);
  const isCreator = task.user?.username === USERNAME;
  const isAssigned = task.task_users_data?.some(u => u.username === USERNAME);

  card.querySelector('.task-card').dataset.id = task.id;
  card.querySelector('.task-title').textContent = task.title;
  const titleEl = card.querySelector('.task-title');
  titleEl.style.cursor = 'pointer';
  titleEl.title = 'View task details';
  titleEl.addEventListener('click', () => openTaskDetailModal(task.id));

  card.querySelector('.task-desc').textContent = task.description || 'No description';
  card.querySelector('.task-project').textContent = task.project_title || 'Unassigned';
  card.querySelector('.task-status').textContent = task.status;
  card.querySelector('.tasks-created-by').textContent = task.user.username;
  const statusSpan = card.querySelector('.task-status');
  statusSpan.textContent = task.status;
  getStatusBadgeClass(task.status).split(' ').forEach(cls => {
    statusSpan.classList.add(cls);
  });

// Change status from card view
if (isCreator || isAssigned) {
    statusSpan.style.cursor = 'pointer';
    statusSpan.title = 'Click to change status';

    statusSpan.addEventListener('click', () => {
      const select = document.createElement('select');
      select.className = 'form-select form-select-sm';
      select.style.width = 'auto';
      select.innerHTML = `
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="CLOSED">Closed</option>
      `;
      select.value = task.status;

      statusSpan.replaceWith(select);

      select.addEventListener('change', () => {
        const newStatus = select.value;

        const payload = {
          title: task.title,
          description: task.description,
          project: task.project || null,
          status: newStatus,
          task_users: task.task_users_data.map(u => u.id),
        };

        // Set or clear closed_date based on status change
        if (newStatus === 'CLOSED' && !task.closed_date) {
          payload.closed_date = new Date().toISOString();
        }
        if (task.status === 'CLOSED' && newStatus !== 'CLOSED') {
          payload.closed_date = null;
        }

        fetch(`${API_BASE}tasks/${task.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': CSRF_TOKEN
          },
          body: JSON.stringify(payload)
        })
          .then(res => {
            if (!res.ok) throw new Error('Error updating status');
            return res.json();
          })
          .then(() => loadTasks())
          .catch(err => alert(err.message));
      });
    });
  }


  // Assigned users
  
  const usersSpan = card.querySelector('.task-users-list');
  if (usersSpan) {
    if (task.task_users_data && task.task_users_data.length > 0) {
      const usernames = task.task_users_data.map(u => u.username).join(', ');
      usersSpan.textContent = usernames;
      usersSpan.classList.remove('fw-light');
    } else {
      usersSpan.textContent = 'Unassigned';
      usersSpan.classList.add('fw-light');
    }
  }

  // Objective and Closed dates
  const { objectiveFormatted, closedFormatted } = convertDates(task.objective_date, task.closed_date);
  card.querySelector('.task-objective-date').textContent = objectiveFormatted;
  card.querySelector('.task-closed-date').textContent = closedFormatted;

  if (objectiveFormatted === 'Unassigned'){
    card.querySelector('.task-objective-date').classList.add('fw-light');
  }


  // Edit/Close Button - Only can edit/close the creator or assigned users
  const editButton = card.querySelector('.btn-edit-task');
  const closeButton = card.querySelector('.btn-close-task');
  const canEdit = isCreator || isAssigned;

  // Show if can edit
  if (canEdit) {
    editButton.style.display = 'inline-block';
    editButton.onclick = () => edit_task(task);

    if (task.status !== 'CLOSED') {
      closeButton.style.display = 'inline-block';
      closeButton.onclick = () => close_task(task);
    } else {
      closeButton.style.display = 'none';
    }
  } else {
    editButton.style.display = 'none';
    closeButton.style.display = 'none';
  }

  // Show or hide close button based on task status
  if (isCreator || isAssigned) {
    editButton.style.display = 'inline-block';
    editButton.onclick = () => edit_task(task);

    if (task.status === 'CLOSED') {
      closeButton.style.display = 'none';
    } else {
      closeButton.style.display = 'inline-block';
      closeButton.onclick = () => close_task(task);
    }

  } else {
    editButton.style.display = 'none';
    closeButton.style.display = 'none';
  }
  const deleteButton = card.querySelector('.btn-delete-task');

  //Delete Task
  if (isCreator) {
    deleteButton.style.display = 'inline-block';
    deleteButton.onclick = () => {
      if (!confirm('Are you sure you want to delete this task?')) return;
      fetch(`${API_BASE}tasks/${task.id}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': CSRF_TOKEN }
      })
      .then(res => {
        if (!res.ok) throw new Error('Error deleting task');
        loadTasks();
      })
      .catch(err => alert(err.message));
    };
  } else {
    deleteButton.style.display = 'none';
  }

  return card;
}

// Element for each status
function getStatusBadgeClass(status) {
  switch (status) {
    case 'OPEN': return 'bg-success';
    case 'IN_PROGRESS': return 'bg-warning text-dark';
    case 'CLOSED': return 'bg-secondary';
    default: return 'bg-light';
  }
}

// Load Users
function loadUsers() {
  fetch(`${API_BASE}users/`)
  .then(res => res.json())
  .then(users => {
    initStatusFilterSelect();
    initUserFilterSelect(users);
    initTaskUserSelect(users);
    initProjectUserSelect(users, []);
  })
  .catch(err => console.error('Error loading users:', err));
}


// Edit Task
function edit_task(task) {
  // Change modal title
  document.querySelector('#modal-title').textContent = 'Edit Task';

  // Complete fields
  document.querySelector('#task-title').value = task.title;
  document.querySelector('#task-desc').value = task.description || '';
  document.querySelector('#task-project').value = task.project || '';
  document.querySelector('#task-status').value = task.status;




  // Save actual ID in dataset
  document.querySelector('#task-form').dataset.editing = task.id;

  // Saved date
  document.querySelector('#task-objective-date').value = task.objective_date 
  ? new Date(task.objective_date).toISOString().slice(0,16) 
  : '';

  // Select assigned users
  const selectedIds = task.task_users_data?.map(u => u.id) || [];


  fetch(`${API_BASE}users/`)
    .then(res => res.json())
    .then(users => {
      initTaskUserSelect(users, selectedIds);
    });

  // Show modal
  new bootstrap.Modal(document.getElementById('task-modal')).show();
}


function close_task(task) {
  const url = `${API_BASE}tasks/${task.id}/`;

  // Payload with the fields expected by serializer
  const payload = {
    title: task.title,
    description: task.description,
    project: task.project || null,
    status: 'CLOSED',
    task_users: task.task_users_data.map(u => u.id), // IDs array 
    closed_date: new Date().toISOString()
  };

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRF_TOKEN,
    },
    body: JSON.stringify(payload),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error closing task');
      return res.json();
    })
    .then(() => {
      loadTasks();
    })
    .catch(err => alert(err.message));
}


// Convert Dates
function convertDates(objective_date, closed_date){
  let objectiveFormatted, closedFormatted;

  if (objective_date) {
    const date = new Date(objective_date);
    objectiveFormatted = date.toLocaleString('en-EN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    objectiveFormatted = 'Unassigned';
  }

  if (closed_date) {
    const date = new Date(closed_date);
    closedFormatted = date.toLocaleString('en-EN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    closedFormatted = '';
  }

  return {
    objectiveFormatted,
    closedFormatted
  };
}

function renderProjectCards(projects) {
  const container = document.querySelector('#project-board');
  container.innerHTML = '';

  const template = document.querySelector('#project-card-template');

  projects.forEach(project => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4 mb-3';

    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.card');

    clone.querySelector('.project-title').textContent = project.title;
    clone.querySelector('.project-description').textContent = project.description || 'No description';

    const creationDate = new Date(project.creation_date).toLocaleDateString();
    const objectiveDate = project.objective_date ? new Date(project.objective_date).toLocaleDateString() : '—';
    const closedDate = project.closed_date ? new Date(project.closed_date).toLocaleDateString() : '—';

    clone.querySelector('.project-created-date').textContent = creationDate;
    clone.querySelector('.project-objective-date').textContent = objectiveDate;
    clone.querySelector('.project-closed-date').textContent = closedDate;
    // Check if current user is the creator
    const isCreator = project.creator === USERNAME;
    const statusSpan = clone.querySelector('.project-status');
    statusSpan.textContent = project.status;
    getStatusBadgeClass(project.status).split(' ').forEach(cls => statusSpan.classList.add(cls));
    // Creator
    clone.querySelector('.project-creator').textContent = project.creator || '—';

    // Users Assigned
    const usersSpan = clone.querySelector('.project-users');
    if (project.users_data && project.users_data.length > 0) {
      usersSpan.textContent = project.users_data.map(u => u.username).join(', ');
    } else {
      usersSpan.textContent = 'Unassigned';
      usersSpan.classList.add('fw-light');
    }
    const editBtn = clone.querySelector('.btn-edit-project');
    const closeBtn = clone.querySelector('.btn-close-project');

    // Show only if is creator
    if (isCreator) {
      editBtn.style.display = 'inline-block';
      editBtn.addEventListener('click', () => {
        edit_project(project);
      });

      if (project.status !== 'CLOSED') {
        closeBtn.style.display = 'inline-block';
        closeBtn.addEventListener('click', () => {
          if (!confirm('Are you sure you want to close this project?')) return;
          close_project(project);
        });
      } else {
        closeBtn.style.display = 'none';
      }
    } else {
      editBtn.style.display = 'none';
      closeBtn.style.display = 'none';
    }
    //Delete project
    const deleteBtn = clone.querySelector('.btn-delete-project');
    if (isCreator) {
      deleteBtn.style.display = 'inline-block';
      deleteBtn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        fetch(`${API_BASE}projects/${project.id}/`, {
          method: 'DELETE',
          headers: { 'X-CSRFToken': CSRF_TOKEN }
        })
        .then(res => {
          if (!res.ok) throw new Error('Error deleting project');
          loadProjects();
        })
        .catch(err => alert(err.message));
      });
    } else {
      deleteBtn.style.display = 'none';
    }



    // View Tasks button
    clone.querySelector('.btn-view-tasks').addEventListener('click', () => {
    const projectsView = document.querySelector('#project-view');
    const tasksView = document.querySelector('#page-view');
    const selectedUserIds = (project.users_data || []).map(u => u.id);
    fetch(`${API_BASE}users/`)
      .then(res => res.json())
      .then(users => {
        initProjectUserSelect(users, selectedUserIds);
      });

    document.querySelector('#filter-project').value = project.id;

    // Fade Transition
    projectsView.classList.add('hide');
    setTimeout(() => {
      projectsView.classList.add('d-none');
      tasksView.classList.remove('d-none');
      setTimeout(() => tasksView.classList.remove('hide'), 10);
      loadTasks(); 
    }, 400);

    setActiveNav('tasks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


    col.appendChild(clone);
    container.appendChild(col);
  });
}


function setActiveNav(activeId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  const activeLink = document.querySelector(`#nav-${activeId}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function edit_project(project) {
  // Change modal title
  document.querySelector('#project-modal-title').textContent = 'Edit Project';

  // Complete Fields
  document.querySelector('#project-title').value = project.title;
  document.querySelector('#project-description').value = project.description || '';
  document.querySelector('#project-status').value = project.status;

  document.querySelector('#project-objective-date').value = project.objective_date
    ? new Date(project.objective_date).toISOString().slice(0, 16)
    : '';

  document.querySelector('#project-form').dataset.editing = project.id;

  const selectedUserIds = (project.users_data || []).map(u => u.id);

  // Get the users assigneds
  fetch(`${API_BASE}users/`)
    .then(res => res.json())
    .then(users => {
      initProjectUserSelect(users, selectedUserIds);

      // Show the modal
      new bootstrap.Modal(document.getElementById('project-modal')).show();
    })
    .catch(err => {
      console.error('Error fetching users for edit_project:', err);
      alert('Error loading users');
    });
}


//Close Project
function close_project(project) {
  const url = `${API_BASE}projects/${project.id}/`;

  const payload = {
    title: project.title,
    description: project.description || '',
    status: 'CLOSED',
    objective_date: project.objective_date,
    users: (project.users_data || []).map(u => u.id),
    closed_date: new Date().toISOString()
  };

  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRF_TOKEN,
    },
    body: JSON.stringify(payload),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error closing project');
      return res.json();
    })
    .then(() => loadProjects())
    .catch(err => alert(err.message));
}



// Task detail view
function openTaskDetailModal(taskId) {
  fetch(`/api/tasks/${taskId}/`)
    .then(res => res.json())
    .then(task => {
      document.querySelector('#detail-modal-title').textContent = task.title;
      document.querySelector('#detail-desc').textContent = task.description || 'No description';
      document.querySelector('#detail-project').textContent = task.project_title || 'Unassigned';
      document.querySelector('#detail-status').textContent = task.status;
      document.querySelector('#detail-status').className = `badge ${getStatusBadgeClass(task.status)}`;
      document.querySelector('#detail-objective-date').textContent = task.objective_date || '—';
      document.querySelector('#detail-closed-date').textContent = task.closed_date || '—';
      document.querySelector('#detail-users').textContent = (task.task_users_data || []).map(u => u.username).join(', ') || 'Unassigned';

      document.querySelector('#btn-post-comment').onclick = () => postComment(taskId);
      loadComments(taskId);

      new bootstrap.Modal(document.getElementById('task-detail-modal')).show();
    });
}

// Load Comments
function loadComments(taskId) {
  fetch('/api/comments/')
    .then(res => res.json())
    .then(comments => {
      const list = document.querySelector('#comment-list');
      list.innerHTML = '';
      comments
        .filter(c => c.task === taskId)
        .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
        .forEach(c => {
          const div = document.createElement('div');
          div.className = 'mb-2 border-bottom pb-2';
          div.innerHTML = `
            <strong>${c.author_username}</strong>
            <span class="text-muted small">(${new Date(c.creation_date).toLocaleString()})</span>
            <p class="mb-0">${c.content}</p>
          `;
          list.appendChild(div);
        });
    });
}

function postComment(taskId) {
  const content = document.querySelector('#new-comment-content').value.trim();
  if (!content) return;

  fetch('/api/comments/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': CSRF_TOKEN
    },
    body: JSON.stringify({
      task: taskId,
      content: content
    })
  })
    .then(res => {
      if (!res.ok) throw new Error('Error posting comment');
      return res.json();
    })
    .then(() => {
      document.querySelector('#new-comment-content').value = '';
      loadComments(taskId);
    })
    .catch(err => alert(err.message));
}