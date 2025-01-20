document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Render stats
  const statsGrid = document.querySelector('.stats-grid');
  statsGrid.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-icon" style="background-color: ${stat.color}">
          <i data-lucide="${stat.icon}"></i>
        </div>
        <div>
          <div class="text-sm text-gray-500">${stat.label}</div>
          <div class="text-lg font-semibold">${stat.value}</div>
        </div>
      </div>
    </div>
  `).join('');

  // Render projects
  const projectsGrid = document.querySelector('.projects-grid');
  projectsGrid.innerHTML = projects.map(project => `
    <div class="project-card">
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${project.progress}%"></div>
      </div>
      <div class="project-meta">
        <div class="flex items-center">
          <i data-lucide="users" class="w-4 h-4 mr-1"></i>
          <span>${project.teamSize} members</span>
        </div>
        <div class="flex items-center">
          <i data-lucide="calendar" class="w-4 h-4 mr-1"></i>
          <span>Due ${project.dueDate}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Reinitialize icons for dynamically added content
  lucide.createIcons();

  // Handle navigation
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Handle search
  const searchInput = document.querySelector('.search-container input');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      const title = card.querySelector('.project-title').textContent.toLowerCase();
      const description = card.querySelector('.project-description').textContent.toLowerCase();
      
      if (title.includes(query) || description.includes(query)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Handle sign out
  const signOutBtn = document.querySelector('.sign-out-btn');
  signOutBtn.addEventListener('click', () => {
    window.location.href = '/login.html';
  });
});