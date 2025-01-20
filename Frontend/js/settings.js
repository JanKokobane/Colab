// Settings Sidebar Functionality
const settingsItems = document.querySelectorAll('.settings-sidebar ul li');
const settingsSections = {
  profile: document.querySelector('.profile-settings'),
  notifications: document.querySelector('.notifications-settings'),
  privacy: document.querySelector('.privacy-settings'),
  account: document.querySelector('.account-settings'),
  security: document.querySelector('.security-settings')
};

// Function to show the selected settings section
const showSettingsSection = (section) => {
  Object.values(settingsSections).forEach(s => s.style.display = 'none'); // Hide all settings sections
  section.style.display = 'block'; // Show the selected settings section
};

// Initialize the Profile settings to be always active
showSettingsSection(settingsSections.profile);

settingsItems.forEach(item => {
  item.addEventListener('click', () => {
    // Remove active class from all settings items
    settingsItems.forEach(settingsItem => settingsItem.classList.remove('active'));

    // Add active class to the clicked settings item
    item.classList.add('active');

    // Get the corresponding settings section and show it
    const sectionName = item.textContent.trim().toLowerCase();
    if (settingsSections[sectionName]) {
      showSettingsSection(settingsSections[sectionName]);
    }
  });
});

