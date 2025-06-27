
let userFilterChoices = null;
let taskUserChoices = null;

// Initialize the filter by users
export function initUserFilterSelect(users) {
  const filterSelect = document.querySelector('#filter-users');
  filterSelect.innerHTML = '';

  if (userFilterChoices) userFilterChoices.destroy();

  userFilterChoices = new Choices(filterSelect, {
    removeItemButton: true,
    searchEnabled: true,
    placeholderValue: 'Filter by user...',
    searchPlaceholderValue: 'Search...'
  });

  userFilterChoices.setChoices(
    users.map(user => ({
      value: user.id,
      label: user.username,
      selected: false
    })),
    'value',
    'label',
    true
  );
}

// Initialize the multimple selector of tasks
export function initTaskUserSelect(users, selectedIds = []) {
  const userSelect = document.querySelector('#task-users');
  userSelect.innerHTML = '';

  if (taskUserChoices) {
    taskUserChoices.destroy();
    taskUserChoices = null;
  }

  taskUserChoices = new Choices(userSelect, {
    removeItemButton: true,
    searchEnabled: true,
    placeholderValue: 'Filter by user...',
    searchPlaceholderValue: 'Search...',
  });

  // ✅ Agregamos directamente los selected aquí
  taskUserChoices.setChoices(
    users.map(user => ({
      value: user.id,
      label: user.username,
      selected: selectedIds.includes(user.id)
    })),
    'value',
    'label',
    true
  );
}


// Get selected task users
export function getSelectedTaskUserIds() {
  return taskUserChoices?.getValue().map(opt => parseInt(opt.value)) || [];
}

// Clear user filter select
export function clearUserFilterSelect() {
  if (userFilterChoices) userFilterChoices.removeActiveItems();
}

// Clear task user select
export function clearTaskUserSelect() {
  if (taskUserChoices) taskUserChoices.removeActiveItems();
}

// Status filter
let statusFilterInstance;

export function initStatusFilterSelect() {
  const el = document.querySelector('#filter-status');
  if (statusFilterInstance) statusFilterInstance.destroy();
  statusFilterInstance = new Choices(el, {
    removeItemButton: true,
    shouldSort: false,
    placeholderValue: 'Select status',
  });
}

export function clearStatusFilterSelect() {
  if (statusFilterInstance) statusFilterInstance.removeActiveItems();
}


// Project users
let projectUserSelectInstance = null;

export function initProjectUserSelect(users, selectedIds = []) {
  const select = document.querySelector('#project-users');
  if (!select) return;

  // Destruir instancia previa si existe
  if (projectUserSelectInstance) {
    projectUserSelectInstance.destroy();
    projectUserSelectInstance = null;
  }

  // Limpiar opciones anteriores
  select.innerHTML = '';

  // Agregar nuevas opciones
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.username;
    if (selectedIds.includes(user.id)) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  // Inicializar Choices
  projectUserSelectInstance = new Choices(select, {
    removeItemButton: true,
    shouldSort: false
  });
}



export function getSelectedProjectUserIds() {
  const select = document.querySelector('#project-users');
  return Array.from(select.selectedOptions).map(opt => parseInt(opt.value));
}

export function clearProjectUserSelect() {
  const select = document.querySelector('#project-users');
  if (projectUserSelectInstance) {
    projectUserSelectInstance.destroy();
    projectUserSelectInstance = null;
  }
  select.innerHTML = '';
}