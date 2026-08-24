/**
 * ============================================================================
 * TaskSphere - Frontend Application Controller
 * Dynamic state management, rich animations, Kanban & List views, and metrics.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // STATE STORE
  // ==========================================================================
  const state = {
    currentUser: null,
    tasks: [],
    activeFilter: 'all', // 'all' | 'pending' | 'completed'
    searchQuery: '',
    activeView: 'kanban', // 'kanban' | 'list'
    pendingDeleteTarget: null, // { type: 'task' | 'user', id: number, name?: string }
    isSubmitting: false,
  };

  // ==========================================================================
  // DOM ELEMENT REFERENCES
  // ==========================================================================
  const dom = {
    // Layout Sections
    authSection: document.getElementById('authSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    headerSearchBox: document.getElementById('headerSearchBox'),
    searchInput: document.getElementById('searchInput'),
    userMenuWrapper: document.getElementById('userMenuWrapper'),
    userProfileBtn: document.getElementById('userProfileBtn'),
    userDropdownMenu: document.getElementById('userDropdownMenu'),
    navUserAvatar: document.getElementById('navUserAvatar'),
    navUserName: document.getElementById('navUserName'),
    dropdownFullName: document.getElementById('dropdownFullName'),
    dropdownEmail: document.getElementById('dropdownEmail'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    brandLogo: document.getElementById('brandLogo'),

    // Auth Forms & Tabs
    tabLoginBtn: document.getElementById('tabLoginBtn'),
    tabRegisterBtn: document.getElementById('tabRegisterBtn'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    authSubtitle: document.getElementById('authSubtitle'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginSubmitBtn: document.getElementById('loginSubmitBtn'),
    regName: document.getElementById('regName'),
    regEmail: document.getElementById('regEmail'),
    regUsername: document.getElementById('regUsername'),
    regPassword: document.getElementById('regPassword'),
    registerSubmitBtn: document.getElementById('registerSubmitBtn'),
    btnAutoDemo: document.getElementById('btnAutoDemo'),

    // Dashboard Hero & Metrics
    greetingTimeText: document.getElementById('greetingTimeText'),
    userDisplayName: document.getElementById('userDisplayName'),
    statTotalCount: document.getElementById('statTotalCount'),
    statPendingCount: document.getElementById('statPendingCount'),
    statCompletedCount: document.getElementById('statCompletedCount'),
    statRatePercent: document.getElementById('statRatePercent'),
    statRateSubtitle: document.getElementById('statRateSubtitle'),
    progressRingCircle: document.getElementById('progressRingCircle'),
    progressRingText: document.getElementById('progressRingText'),
    btnOpenCreateTask: document.getElementById('btnOpenCreateTask'),
    btnEmptyCreateTask: document.getElementById('btnEmptyCreateTask'),
    btnRefreshTasks: document.getElementById('btnRefreshTasks'),

    // Filter & View Controls
    filterPills: document.querySelectorAll('.filter-pill'),
    pillAllCount: document.getElementById('pillAllCount'),
    pillPendingCount: document.getElementById('pillPendingCount'),
    pillCompletedCount: document.getElementById('pillCompletedCount'),
    viewKanbanBtn: document.getElementById('viewKanbanBtn'),
    viewListBtn: document.getElementById('viewListBtn'),
    kanbanViewContainer: document.getElementById('kanbanViewContainer'),
    listViewContainer: document.getElementById('listViewContainer'),
    stackPending: document.getElementById('stackPending'),
    stackCompleted: document.getElementById('stackCompleted'),
    listTaskStack: document.getElementById('listTaskStack'),
    colBadgePending: document.getElementById('colBadgePending'),
    colBadgeCompleted: document.getElementById('colBadgeCompleted'),
    emptyStatePlaceholder: document.getElementById('emptyStatePlaceholder'),
    emptyStateMsg: document.getElementById('emptyStateMsg'),

    // Modals
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    taskForm: document.getElementById('taskForm'),
    taskEditId: document.getElementById('taskEditId'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskDescInput: document.getElementById('taskDescInput'),
    taskCompletedToggle: document.getElementById('taskCompletedToggle'),
    closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
    cancelTaskModalBtn: document.getElementById('cancelTaskModalBtn'),
    saveTaskBtn: document.getElementById('saveTaskBtn'),

    // Delete Confirmation Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteModalMessage: document.getElementById('deleteModalMessage'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // User Profile Modal
    profileModal: document.getElementById('profileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    closeProfileBtn2: document.getElementById('closeProfileBtn2'),
    menuViewProfile: document.getElementById('menuViewProfile'),
    menuLogout: document.getElementById('menuLogout'),
    modalUserAvatar: document.getElementById('modalUserAvatar'),
    modalFullName: document.getElementById('modalFullName'),
    modalUsername: document.getElementById('modalUsername'),
    modalEmail: document.getElementById('modalEmail'),
    btnDeleteAccountTrigger: document.getElementById('btnDeleteAccountTrigger'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer'),
  };

  // ==========================================================================
  // THEME MANAGEMENT (Dark / Light)
  // ==========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('tasksphere_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('tasksphere_theme', nextTheme);
    updateThemeIcon(nextTheme);
    showToast('Theme Changed', `Switched to ${nextTheme === 'dark' ? 'Cosmic Dark' : 'Clean Light'} theme`, 'info', 2000);
  }

  function updateThemeIcon(theme) {
    if (dom.themeIcon) {
      if (theme === 'dark') {
        dom.themeIcon.className = 'fa-solid fa-moon';
      } else {
        dom.themeIcon.className = 'fa-solid fa-sun';
      }
    }
  }

  // ==========================================================================
  // TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  function showToast(title, message, type = 'info', duration = 3500) {
    if (!dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        <div class="toast-msg">${escapeHtml(message)}</div>
      </div>
      <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.9rem;" onclick="this.parentElement.remove()">&times;</button>
    `;

    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================================================
  // INITIALIZATION & SESSION RESTORATION
  // ==========================================================================
  async function initApp() {
    initTheme();
    setupEventListeners();
    updateGreetingTime();

    if (api.isAuthenticated()) {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          state.currentUser = user;
          renderAuthenticatedView();
          await loadTasks();
          showToast('Welcome Back', `Signed in as @${user.username}`, 'success');
          return;
        }
      } catch (err) {
        console.warn('Session verification failed:', err);
        api.clearToken();
      }
    }

    renderUnauthenticatedView();
  }

  function updateGreetingTime() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    if (dom.greetingTimeText) dom.greetingTimeText.textContent = greeting;
  }

  function renderAuthenticatedView() {
    dom.authSection.style.display = 'none';
    dom.dashboardSection.style.display = 'block';
    dom.headerSearchBox.style.display = 'block';
    dom.userMenuWrapper.style.display = 'block';

    const user = state.currentUser;
    if (user) {
      const initial = (user.name || user.username || 'U')[0].toUpperCase();
      dom.navUserAvatar.textContent = initial;
      dom.navUserName.textContent = user.username || user.name;
      dom.userDisplayName.textContent = user.name || user.username;
      dom.dropdownFullName.textContent = user.name;
      dom.dropdownEmail.textContent = user.email || `${user.username}@example.com`;
    }
  }

  function renderUnauthenticatedView() {
    dom.authSection.style.display = 'flex';
    dom.dashboardSection.style.display = 'none';
    dom.headerSearchBox.style.display = 'none';
    dom.userMenuWrapper.style.display = 'none';
    dom.userDropdownMenu.classList.remove('active');
    state.currentUser = null;
    state.tasks = [];
  }

  // ==========================================================================
  // TASK FETCHING & RENDERING
  // ==========================================================================
  async function loadTasks() {
    try {
      const tasks = await api.getAllTasks();
      state.tasks = Array.isArray(tasks) ? tasks : [];
      renderTasks();
      updateMetrics();
    } catch (err) {
      showToast('Error Loading Tasks', err.message, 'error');
    }
  }

  function getFilteredTasks() {
    return state.tasks.filter(task => {
      // Filter by tab
      if (state.activeFilter === 'pending' && task.is_completed) return false;
      if (state.activeFilter === 'completed' && !task.is_completed) return false;

      // Filter by search query
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(query);
        const matchDesc = (task.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }

  function renderTasks() {
    const filtered = getFilteredTasks();
    const pendingTasks = filtered.filter(t => !t.is_completed);
    const completedTasks = filtered.filter(t => t.is_completed);

    // Update column count badges
    if (dom.colBadgePending) dom.colBadgePending.textContent = `${pendingTasks.length} task${pendingTasks.length === 1 ? '' : 's'}`;
    if (dom.colBadgeCompleted) dom.colBadgeCompleted.textContent = `${completedTasks.length} task${completedTasks.length === 1 ? '' : 's'}`;

    // Check empty state
    if (filtered.length === 0) {
      dom.emptyStatePlaceholder.style.display = 'flex';
      if (state.searchQuery.trim()) {
        dom.emptyStateMsg.textContent = `No tasks found matching "${state.searchQuery}".`;
      } else if (state.activeFilter === 'completed') {
        dom.emptyStateMsg.textContent = 'No completed tasks yet. Finish a task to see it here!';
      } else if (state.activeFilter === 'pending') {
        dom.emptyStateMsg.textContent = 'All caught up! No pending tasks.';
      } else {
        dom.emptyStateMsg.textContent = 'You have not created any tasks yet. Get started by clicking "+ New Task"!';
      }
    } else {
      dom.emptyStatePlaceholder.style.display = 'none';
    }

    // Render Kanban Columns
    if (dom.stackPending) {
      dom.stackPending.innerHTML = pendingTasks.length > 0
        ? pendingTasks.map(task => createTaskCardHtml(task)).join('')
        : `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem;">No tasks in progress</div>`;
    }

    if (dom.stackCompleted) {
      dom.stackCompleted.innerHTML = completedTasks.length > 0
        ? completedTasks.map(task => createTaskCardHtml(task)).join('')
        : `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem;">No completed tasks yet</div>`;
    }

    // Render List View
    if (dom.listTaskStack) {
      dom.listTaskStack.innerHTML = filtered.length > 0
        ? filtered.map(task => createListRowHtml(task)).join('')
        : '';
    }

    attachCardEventListeners();
  }

  function createTaskCardHtml(task) {
    const isCompleted = Boolean(task.is_completed);
    const safeTitle = escapeHtml(task.title || 'Untitled Task');
    const safeDesc = escapeHtml(task.description || 'No description provided.');
    
    return `
      <div class="task-card ${isCompleted ? 'is-completed' : 'is-pending'}" data-task-id="${task.id}">
        <div class="task-card-header">
          <span class="task-meta-tag">#${task.id}</span>
          <button class="task-quick-toggle btn-toggle-status" data-id="${task.id}" title="${isCompleted ? 'Mark as Pending' : 'Mark as Completed'}">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>

        <div class="task-card-body" data-action="edit" data-id="${task.id}">
          <h4>${safeTitle}</h4>
          <p>${safeDesc}</p>
        </div>

        <div class="task-card-footer">
          <div class="task-owner-info">
            <i class="fa-solid fa-calendar-check"></i> Task ID: ${task.id}
          </div>
          <div class="task-action-btns">
            <button class="btn-card-action btn-edit-task" data-id="${task.id}" title="Edit Task">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn-card-action btn-delete btn-delete-task" data-id="${task.id}" data-title="${safeTitle}" title="Delete Task">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function createListRowHtml(task) {
    const isCompleted = Boolean(task.is_completed);
    const safeTitle = escapeHtml(task.title || 'Untitled Task');
    const safeDesc = escapeHtml(task.description || '—');

    return `
      <div class="list-task-row ${isCompleted ? 'is-completed' : 'is-pending'}" data-task-id="${task.id}">
        <div>
          <button class="task-quick-toggle btn-toggle-status" data-id="${task.id}">
            <i class="fa-solid fa-check"></i>
          </button>
        </div>
        <div class="col-id" style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">#${task.id}</div>
        <div class="list-task-title">${safeTitle}</div>
        <div class="list-task-desc">${safeDesc}</div>
        <div>
          <span class="badge-status ${isCompleted ? 'completed' : 'pending'}">
            <i class="fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-clock'}"></i>
            ${isCompleted ? 'Completed' : 'In Progress'}
          </span>
        </div>
        <div style="text-align: right; display:flex; justify-content: flex-end; gap: 0.35rem;">
          <button class="btn-card-action btn-edit-task" data-id="${task.id}" title="Edit Task">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="btn-card-action btn-delete btn-delete-task" data-id="${task.id}" data-title="${safeTitle}" title="Delete Task">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }

  function attachCardEventListeners() {
    // Quick Status Toggle Checkmarks
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        await toggleTaskStatus(id);
      });
    });

    // Edit Task Buttons
    document.querySelectorAll('.btn-edit-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        openEditTaskModal(id);
      });
    });

    // Delete Task Buttons
    document.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const title = btn.dataset.title || 'this task';
        openDeleteModal('task', id, title);
      });
    });

    // Card Body Click for Quick Edit
    document.querySelectorAll('.task-card-body').forEach(body => {
      body.addEventListener('click', () => {
        const id = parseInt(body.dataset.id, 10);
        openEditTaskModal(id);
      });
    });
  }

  // ==========================================================================
  // METRICS & PROGRESS RING CALCULATION
  // ==========================================================================
  function updateMetrics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.is_completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Stat card counters
    if (dom.statTotalCount) dom.statTotalCount.textContent = total;
    if (dom.statPendingCount) dom.statPendingCount.textContent = pending;
    if (dom.statCompletedCount) dom.statCompletedCount.textContent = completed;
    if (dom.statRatePercent) dom.statRatePercent.textContent = `${rate}%`;

    // Filter pill count badges
    if (dom.pillAllCount) dom.pillAllCount.textContent = total;
    if (dom.pillPendingCount) dom.pillPendingCount.textContent = pending;
    if (dom.pillCompletedCount) dom.pillCompletedCount.textContent = completed;

    // Subtitle feedback
    if (dom.statRateSubtitle) {
      if (total === 0) dom.statRateSubtitle.textContent = "Let's get started!";
      else if (rate === 100) dom.statRateSubtitle.textContent = '🎉 All tasks finished!';
      else if (rate >= 50) dom.statRateSubtitle.textContent = '🚀 More than halfway!';
      else dom.statRateSubtitle.textContent = '⚡ Keep crushing it!';
    }

    // Circular SVG Progress Ring
    if (dom.progressRingCircle && dom.progressRingText) {
      const radius = 22;
      const circumference = 2 * Math.PI * radius; // ~138.2
      const offset = circumference - (rate / 100) * circumference;
      dom.progressRingCircle.style.strokeDashoffset = offset;
      dom.progressRingText.textContent = `${rate}%`;
    }
  }

  // ==========================================================================
  // TASK CRUD ACTIONS
  // ==========================================================================
  async function toggleTaskStatus(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = !task.is_completed;
    // Optimistic UI update
    task.is_completed = newStatus;
    renderTasks();
    updateMetrics();

    try {
      await api.updateTask(taskId, {
        title: task.title,
        description: task.description,
        is_completed: newStatus
      });
      showToast(
        newStatus ? 'Task Completed' : 'Task Reopened',
        `"${task.title}" marked as ${newStatus ? 'completed' : 'in progress'}.`,
        newStatus ? 'success' : 'info',
        2500
      );
    } catch (err) {
      // Revert on error
      task.is_completed = !newStatus;
      renderTasks();
      updateMetrics();
      showToast('Update Failed', err.message, 'error');
    }
  }

  function openCreateTaskModal() {
    dom.taskModalTitle.innerHTML = '<i class="fa-solid fa-plus-circle gradient-text"></i> Create New Task';
    dom.taskEditId.value = '';
    dom.taskTitleInput.value = '';
    dom.taskDescInput.value = '';
    dom.taskCompletedToggle.checked = false;
    dom.saveTaskBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Task';
    dom.taskModal.classList.add('active');
    setTimeout(() => dom.taskTitleInput.focus(), 100);
  }

  function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    dom.taskModalTitle.innerHTML = '<i class="fa-solid fa-pencil gradient-text"></i> Edit Task';
    dom.taskEditId.value = task.id;
    dom.taskTitleInput.value = task.title || '';
    dom.taskDescInput.value = task.description || '';
    dom.taskCompletedToggle.checked = Boolean(task.is_completed);
    dom.saveTaskBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Task';
    dom.taskModal.classList.add('active');
    setTimeout(() => dom.taskTitleInput.focus(), 100);
  }

  function closeTaskModal() {
    dom.taskModal.classList.remove('active');
    dom.taskForm.reset();
  }

  async function handleTaskFormSubmit(e) {
    e.preventDefault();
    if (state.isSubmitting) return;

    const title = dom.taskTitleInput.value.trim();
    const description = dom.taskDescInput.value.trim();
    const isCompleted = dom.taskCompletedToggle.checked;
    const editId = dom.taskEditId.value;

    if (!title) {
      showToast('Validation Error', 'Task title is required.', 'warning');
      return;
    }

    state.isSubmitting = true;
    dom.saveTaskBtn.disabled = true;

    try {
      if (editId) {
        // Update Task
        const updated = await api.updateTask(parseInt(editId, 10), {
          title,
          description,
          is_completed: isCompleted
        });
        showToast('Task Updated', 'Changes saved successfully.', 'success');
      } else {
        // Create Task
        await api.createTask({
          title,
          description,
          is_completed: isCompleted
        });
        showToast('Task Created', 'New task added to your board.', 'success');
      }

      closeTaskModal();
      await loadTasks();
    } catch (err) {
      showToast('Save Failed', err.message, 'error');
    } finally {
      state.isSubmitting = false;
      dom.saveTaskBtn.disabled = false;
    }
  }

  function openDeleteModal(type, id, name) {
    state.pendingDeleteTarget = { type, id, name };
    if (type === 'task') {
      dom.deleteModalMessage.innerHTML = `Are you sure you want to permanently delete task <strong>"${escapeHtml(name)}"</strong>?`;
    } else if (type === 'user') {
      dom.deleteModalMessage.innerHTML = `Are you sure you want to permanently delete your account <strong>@${escapeHtml(name)}</strong>? All your tasks will be permanently removed.`;
    }
    dom.deleteModal.classList.add('active');
  }

  function closeDeleteModal() {
    dom.deleteModal.classList.remove('active');
    state.pendingDeleteTarget = null;
  }

  async function handleConfirmDelete() {
    if (!state.pendingDeleteTarget) return;
    const { type, id } = state.pendingDeleteTarget;

    try {
      if (type === 'task') {
        await api.deleteTask(id);
        showToast('Task Deleted', 'Task removed successfully.', 'info');
        closeDeleteModal();
        await loadTasks();
      } else if (type === 'user') {
        await api.deleteAccount(id);
        showToast('Account Deleted', 'Your account has been deleted.', 'info');
        closeDeleteModal();
        closeProfileModal();
        renderUnauthenticatedView();
      }
    } catch (err) {
      showToast('Delete Failed', err.message, 'error');
    }
  }

  // ==========================================================================
  // AUTHENTICATION HANDLERS (Login, Register, Logout)
  // ==========================================================================
  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (state.isSubmitting) return;

    const username = dom.loginUsername.value.trim();
    const password = dom.loginPassword.value;

    if (!username || !password) {
      showToast('Validation Error', 'Please enter your username and password.', 'warning');
      return;
    }

    state.isSubmitting = true;
    dom.loginSubmitBtn.disabled = true;
    dom.loginSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

    try {
      await api.login({ username, password });
      const user = await api.getCurrentUser();
      state.currentUser = user;
      renderAuthenticatedView();
      await loadTasks();
      showToast('Welcome!', `Logged in successfully as @${user.username}`, 'success');
    } catch (err) {
      showToast('Login Failed', err.message || 'Invalid username or password', 'error');
    } finally {
      state.isSubmitting = false;
      dom.loginSubmitBtn.disabled = false;
      dom.loginSubmitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Workspace';
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (state.isSubmitting) return;

    const name = dom.regName.value.trim();
    const email = dom.regEmail.value.trim();
    const username = dom.regUsername.value.trim();
    const password = dom.regPassword.value;

    if (!name || !email || !username || !password) {
      showToast('Validation Error', 'All registration fields are required.', 'warning');
      return;
    }

    state.isSubmitting = true;
    dom.registerSubmitBtn.disabled = true;
    dom.registerSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

    try {
      await api.register({ name, email, username, password });
      showToast('Account Created!', 'Logging you in automatically...', 'success');
      
      // Auto-login after registration
      await api.login({ username, password });
      const user = await api.getCurrentUser();
      state.currentUser = user;
      renderAuthenticatedView();
      await loadTasks();
    } catch (err) {
      showToast('Registration Failed', err.message, 'error');
    } finally {
      state.isSubmitting = false;
      dom.registerSubmitBtn.disabled = false;
      dom.registerSubmitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create My Account';
    }
  }

  function handleLogout() {
    api.clearToken();
    renderUnauthenticatedView();
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  }

  function openProfileModal() {
    const user = state.currentUser;
    if (!user) return;

    const initial = (user.name || user.username || 'U')[0].toUpperCase();
    dom.modalUserAvatar.textContent = initial;
    dom.modalFullName.textContent = user.name || 'User';
    dom.modalUsername.textContent = `@${user.username}`;
    dom.modalEmail.textContent = user.email || 'No email attached';
    dom.userDropdownMenu.classList.remove('active');
    dom.profileModal.classList.add('active');
  }

  function closeProfileModal() {
    dom.profileModal.classList.remove('active');
  }

  // ==========================================================================
  // EVENT LISTENERS BINDING
  // ==========================================================================
  function setupEventListeners() {
    // Theme Toggle
    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    // Auth Mode Switching
    dom.tabLoginBtn.addEventListener('click', () => {
      dom.tabLoginBtn.classList.add('active');
      dom.tabRegisterBtn.classList.remove('active');
      dom.loginForm.style.display = 'flex';
      dom.registerForm.style.display = 'none';
      dom.authSubtitle.textContent = 'Log in to organize, track, and complete your tasks';
    });

    dom.tabRegisterBtn.addEventListener('click', () => {
      dom.tabRegisterBtn.classList.add('active');
      dom.tabLoginBtn.classList.remove('active');
      dom.registerForm.style.display = 'flex';
      dom.loginForm.style.display = 'none';
      dom.authSubtitle.textContent = 'Join TaskSphere and supercharge your productivity';
    });

    // Password Visibility Toggles
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.querySelector('i').className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      });
    });

    // Quick Demo Autofill
    dom.btnAutoDemo.addEventListener('click', () => {
      const demoNum = Math.floor(Math.random() * 900) + 100;
      if (dom.tabRegisterBtn.classList.contains('active')) {
        dom.regName.value = `Demo User ${demoNum}`;
        dom.regEmail.value = `demo${demoNum}@tasksphere.dev`;
        dom.regUsername.value = `demouser${demoNum}`;
        dom.regPassword.value = 'Secret@123';
        showToast('Demo Details Filled', 'Click "Create My Account" to register instantly!', 'info');
      } else {
        dom.loginUsername.value = `demouser${demoNum}`;
        dom.loginPassword.value = 'Secret@123';
        showToast('Tip', 'Switch to "Create Account" if this demo user is not registered yet.', 'info');
      }
    });

    // Form Submissions
    dom.loginForm.addEventListener('submit', handleLoginSubmit);
    dom.registerForm.addEventListener('submit', handleRegisterSubmit);
    dom.taskForm.addEventListener('submit', handleTaskFormSubmit);

    // User Profile Dropdown Toggle
    dom.userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.userDropdownMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!dom.userMenuWrapper.contains(e.target)) {
        dom.userDropdownMenu.classList.remove('active');
      }
    });

    // User Dropdown Actions
    dom.menuViewProfile.addEventListener('click', openProfileModal);
    dom.menuLogout.addEventListener('click', handleLogout);
    dom.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    dom.closeProfileBtn2.addEventListener('click', closeProfileModal);

    // Trigger Account Delete
    dom.btnDeleteAccountTrigger.addEventListener('click', () => {
      if (state.currentUser) {
        openDeleteModal('user', state.currentUser.id, state.currentUser.username);
      }
    });

    // Search Input with Debounce
    let searchTimer = null;
    dom.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        renderTasks();
      }, 200);
    });

    // Filter Pills
    dom.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        dom.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFilter = pill.dataset.filter;
        renderTasks();
      });
    });

    // View Switchers (Kanban vs List)
    dom.viewKanbanBtn.addEventListener('click', () => {
      dom.viewKanbanBtn.classList.add('active');
      dom.viewListBtn.classList.remove('active');
      dom.kanbanViewContainer.style.display = 'grid';
      dom.listViewContainer.style.display = 'none';
      state.activeView = 'kanban';
    });

    dom.viewListBtn.addEventListener('click', () => {
      dom.viewListBtn.classList.add('active');
      dom.viewKanbanBtn.classList.remove('active');
      dom.kanbanViewContainer.style.display = 'none';
      dom.listViewContainer.style.display = 'flex';
      state.activeView = 'list';
    });

    // Refresh Button
    dom.btnRefreshTasks.addEventListener('click', async () => {
      dom.btnRefreshTasks.querySelector('i').classList.add('fa-spin');
      await loadTasks();
      setTimeout(() => dom.btnRefreshTasks.querySelector('i').classList.remove('fa-spin'), 600);
      showToast('Refreshed', 'Task data updated from server.', 'info', 1800);
    });

    // Modal Triggers & Closes
    dom.btnOpenCreateTask.addEventListener('click', openCreateTaskModal);
    dom.btnEmptyCreateTask.addEventListener('click', openCreateTaskModal);
    dom.closeTaskModalBtn.addEventListener('click', closeTaskModal);
    dom.cancelTaskModalBtn.addEventListener('click', closeTaskModal);

    dom.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    dom.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    dom.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTaskModal();
        closeDeleteModal();
        closeProfileModal();
        dom.userDropdownMenu.classList.remove('active');
      }

      // Quick search shortcut (press "/" when not in input)
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        dom.searchInput.focus();
      }

      // Submit modal on Ctrl + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (dom.taskModal.classList.contains('active')) {
          dom.taskForm.requestSubmit();
        }
      }
    });
  }

  // Helper to escape HTML characters
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run app
  initApp();
});
