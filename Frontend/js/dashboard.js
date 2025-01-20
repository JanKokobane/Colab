document.addEventListener('DOMContentLoaded', function() {
  // Sidebar Menu Functionality
  const menuItems = document.querySelectorAll('.sidebar nav ul li');
  const sections = {
    'project dashboard': document.querySelector('.dashboard'),
    'chat': document.querySelector('.chat-container'),
    'documents': document.querySelector('.documents-container'),
    'settings': document.querySelector('.settings-section')
  };

  // Function to show the selected section
  const showSection = (section) => {
    Object.values(sections).forEach(s => s.style.display = 'none'); // Hide all sections
    section.style.display = 'block'; // Show the selected section
  };

  // Initialize the Project Dashboard to be always active
  showSection(sections['project dashboard']);

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all menu items
      menuItems.forEach(menuItem => menuItem.classList.remove('active'));

      // Add active class to the clicked menu item
      item.classList.add('active');

      // Get the corresponding section and show it
      const sectionName = item.textContent.trim().toLowerCase();
      if (sections[sectionName]) {
        showSection(sections[sectionName]);
      }
    });
  });

  

  // Modal Functionality
  addTaskBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

 

  // Search Functionality
  const searchInput = document.querySelector('.search-bar input');
  searchInput.addEventListener('input', e => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.task-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const description = card.querySelector('p').textContent.toLowerCase();
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Initialize tooltips and other UI enhancements
  document.querySelectorAll('.member img').forEach(img => {
    img.addEventListener('mouseenter', e => {
      const name = e.target.alt;
      // You could implement a tooltip here
    });
  });


  // Make main content scrollable
  document.querySelector('.main-content').style.overflowY = 'auto';
  document.querySelector('.main-content').style.height = '100vh';
});


//Logout 
document.getElementById('logoutLink').addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.removeItem('authToken'); 
    sessionStorage.clear(); 
    window.location.href = 'login.html';
});


document.addEventListener('DOMContentLoaded', function () {
  const sharedFilesContainer = document.getElementById('shared-files-container');

  // Fetch shared documents from Dexie.js database
  async function fetchSharedDocuments() {
      const documents = await db.documents.toArray();

      // Display shared documents in the "Shared Files" section
      if (documents && documents.length > 0) {
          documents.forEach(doc => {
              const fileElement = document.createElement('div');
              fileElement.className = 'file';

              let fileTypeIcon;
              if (doc.name.endsWith('.pdf')) {
                  fileTypeIcon = '<i class="fas fa-file-pdf" style="color:red;"></i>';
              } else if (doc.name.endsWith('.zip')) {
                  fileTypeIcon = '<i class="fas fa-file-archive" style="color:orange;"></i>';
              } else if (doc.name.endsWith('.doc') || doc.name.endsWith('.docx')) {
                  fileTypeIcon = '<i class="fas fa-file-word" style="color:blue;"></i>';
              } else if (doc.name.endsWith('.xls') || doc.name.endsWith('.xlsx')) {
                  fileTypeIcon = '<i class="fas fa-file-excel" style="color:green;"></i>';
              } else if (doc.name.endsWith('.ppt') || doc.name.endsWith('.pptx')) {
                  fileTypeIcon = '<i class="fas fa-file-powerpoint" style="color:orange;"></i>';
              } else if (doc.name.endsWith('.txt')) {
                  fileTypeIcon = '<i class="fas fa-file-alt" style="color:gray;"></i>';
              } else if (doc.name.endsWith('.jpg') || doc.name.endsWith('.jpeg') || doc.name.endsWith('.png')) {
                  fileTypeIcon = '<i class="fas fa-file-image" style="color:purple;"></i>';
              } else {
                  fileTypeIcon = '<i class="fas fa-file" style="color:black;"></i>';
              }

              fileElement.innerHTML = `${fileTypeIcon} <span>${doc.name}</span>`;
              sharedFilesContainer.appendChild(fileElement);
          });
      } else {
          sharedFilesContainer.innerHTML = '<p>No shared files found.</p>';
      }
  }

  fetchSharedDocuments();
});

document.addEventListener('DOMContentLoaded', function () {
  const teamMembersContainer = document.querySelector('.team-members');

  // Fetch team members from backend
  fetch('http://127.0.0.1:5000/fetch_users')
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          teamMembersContainer.innerHTML = '';

          // Store users in local storage
          localStorage.setItem('users', JSON.stringify(data.users));

          data.users.forEach(user => {
              const memberElement = document.createElement('div');
              memberElement.className = 'member';

              memberElement.innerHTML = `
                  <img src="https://ui-avatars.com/api/?name=${user.name}" alt="${user.name}">
                  <div class="member-info">
                      <span class="name">${user.name}</span>
                  </div>
              `;

              teamMembersContainer.appendChild(memberElement);
          });
      })
      .catch(error => {
          console.error('Error fetching users:', error);
      });
});


document.addEventListener('DOMContentLoaded', function () {
  const searchBar = document.getElementById('search-bar');
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'search-results';
  document.body.appendChild(resultsContainer);

  searchBar.addEventListener('input', function () {
      const query = searchBar.value.trim();

      if (query.length > 0) {
          fetch(`http://127.0.0.1:5000/search?query=${encodeURIComponent(query)}`)
              .then(response => response.json())
              .then(data => {
                  resultsContainer.innerHTML = '';

                  // Display tasks
                  if (data.tasks.length > 0) {
                      const tasksTitle = document.createElement('h3');
                      tasksTitle.textContent = 'Tasks';
                      resultsContainer.appendChild(tasksTitle);

                      data.tasks.forEach(task => {
                          const taskElement = document.createElement('div');
                          taskElement.className = 'task';
                          taskElement.innerHTML = `
                              <strong>${task.title}</strong>
                              <p>${task.description}</p>
                          `;
                          resultsContainer.appendChild(taskElement);
                      });
                  }

                  // Display users
                  if (data.users.length > 0) {
                      const usersTitle = document.createElement('h3');
                      usersTitle.textContent = 'Users';
                      resultsContainer.appendChild(usersTitle);

                      data.users.forEach(user => {
                          const userElement = document.createElement('div');
                          userElement.className = 'user';
                          userElement.innerHTML = `
                              <strong>${user.current_position || 'Position'}</strong>
                              <p>${user.current_employer || 'Employer'}</p>
                          `;
                          resultsContainer.appendChild(userElement);
                      });
                  }
              })
              .catch(error => {
                  console.error('Error during search:', error);
              });
      } else {
          resultsContainer.innerHTML = '';
      }
  });
});
document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById('search-bar');
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    document.body.appendChild(resultsContainer);

    searchBar.addEventListener('input', function () {
        const query = searchBar.value.trim();

        if (query.length > 0) {
            // Fetch tasks and users from backend
            fetch(`http://127.0.0.1:5000/search?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    resultsContainer.innerHTML = '';

                    // Display tasks
                    if (data.tasks && data.tasks.length > 0) {
                        const tasksTitle = document.createElement('h3');
                        tasksTitle.textContent = 'Tasks';
                        resultsContainer.appendChild(tasksTitle);

                        data.tasks.forEach(task => {
                            const taskElement = document.createElement('div');
                            taskElement.className = 'task';
                            taskElement.innerHTML = `
                                <strong>${task.title}</strong>
                                <p>${task.description}</p>
                            `;
                            resultsContainer.appendChild(taskElement);
                        });
                    }

                    // Display users
                    if (data.users && data.users.length > 0) {
                        const usersTitle = document.createElement('h3');
                        usersTitle.textContent = 'Users';
                        resultsContainer.appendChild(usersTitle);

                        data.users.forEach(user => {
                            const userElement = document.createElement('div');
                            userElement.className = 'user';
                            userElement.innerHTML = `
                                <strong>${user.current_position || 'Position'}</strong>
                                <p>${user.current_employer || 'Employer'}</p>
                            `;
                            resultsContainer.appendChild(userElement);
                        });
                    }

                    // Search documents in local storage
                    const documents = JSON.parse(localStorage.getItem('documents')) || [];
                    const filteredDocuments = documents.filter(doc => 
                        (doc.name && doc.name.includes(query)) || (doc.content && doc.content.includes(query))
                    );

                    if (filteredDocuments.length > 0) {
                        const docsTitle = document.createElement('h3');
                        docsTitle.textContent = 'Documents';
                        resultsContainer.appendChild(docsTitle);

                        filteredDocuments.forEach(doc => {
                            const docElement = document.createElement('div');
                            docElement.className = 'document';
                            docElement.innerHTML = `
                                <strong>${doc.name}</strong>
                                <p>${doc.content}</p>
                            `;
                            resultsContainer.appendChild(docElement);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error during search:', error);
                });
        } else {
            resultsContainer.innerHTML = '';
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const notificationBadge = document.getElementById('notification-badge');
  let notifications = [];
  let notificationQueue = [];
  let isNotificationVisible = false;

  const displayNotification = (message) => {
      // Store notification in queue
      notificationQueue.push(message);
      updateNotificationBadge();

      // Show notification if no other notification is currently visible
      if (!isNotificationVisible) {
          showNextNotification();
      }
  };

  const updateNotificationBadge = () => {
      const notificationCount = notificationQueue.length;
      notificationBadge.textContent = notificationCount;
      notificationBadge.style.display = notificationCount > 0 ? 'inline' : 'none';
  };

  const showNextNotification = () => {
      if (notificationQueue.length > 0) {
          isNotificationVisible = true;
          const message = notificationQueue.shift();
          showInAppNotification(message);

          // Update badge
          updateNotificationBadge();
      } else {
          isNotificationVisible = false;
      }
  };

  const showInAppNotification = (message) => {
      const inAppNotification = document.createElement('div');
      inAppNotification.className = 'in-app-notification';
      inAppNotification.innerHTML = `<p>${message}</p>`;
      document.body.appendChild(inAppNotification);

      // Remove the notification after 10 seconds and show the next one
      setTimeout(() => {
          inAppNotification.remove();
          showNextNotification();
      }, 5000);
  };

  const fetchNotifications = () => {
      notifications = []; // Reset notifications array before fetching new notifications
      notificationQueue = []; // Reset notification queue
      isNotificationVisible = false; // Reset visibility state

      // Fetch tasks from backend
      fetch('http://127.0.0.1:5000/fetch_tasks')
          .then(response => response.json())
          .then(data => {
              data.tasks.forEach(task => {
                  displayNotification(`New task added`);
              });
          })
          .catch(error => console.error('Error fetching tasks:', error));

      // Fetch messages from local storage
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      messages.forEach(message => {
          displayNotification(`New message: ${message.text}`);
      });

      // Fetch documents from local storage
      const documents = JSON.parse(localStorage.getItem('documents')) || [];
      documents.forEach(doc => {
          displayNotification(`New document uploaded`);
      });

      updateNotificationBadge(); // Ensure badge updates after all notifications are processed
  };

  fetchNotifications();
});
