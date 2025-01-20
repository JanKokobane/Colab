let activeChatUser = ""; // Track the active user for direct messaging
let activeChannel = "General"; // Set a default active channel
const channelMessages = JSON.parse(localStorage.getItem('channelMessages')) || {
  General: [],
  Development: [],
  Marketing: []
};
const directMessages = JSON.parse(localStorage.getItem('directMessages')) || {}; // Store for direct messages
const chatMessages = document.getElementById('chatMessages');
const channelList = document.getElementById('channelList');
const newChannelNameInput = document.getElementById('newChannelName');
const createChannelButton = document.getElementById('createChannelButton');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessage');
const activeChannelDisplay = document.getElementById('activeChannelDisplay');
const directMessagesList = document.querySelector('.direct-messages ul'); // Direct message list

// Fetch logged-in user's name (dummy implementation for now)
function getStoredLoggedInUser() {
  return localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user')).name 
    : 'Anonymous';
}

// Render messages for the current channel or direct chat
function renderMessages() {
  const loggedInUser = getStoredLoggedInUser();  // Get the logged-in user

  let messages;
  if (activeChatUser) {
    // Display direct messages
    messages = directMessages[activeChatUser] || [];
  } else {
    // Display channel messages
    messages = channelMessages[activeChannel] || [];
  }

  chatMessages.innerHTML = messages.map((msg, index) => `
    <div class="message ${msg.private && msg.user !== loggedInUser ? 'hidden' : ''}" data-message-index="${index}">
      <div class="message-header">
        <span class="message-user">${msg.user}</span>
        <span class="message-time">${msg.time}</span>
      </div>
      <div class="message-content">${msg.private ? (msg.user === loggedInUser ? msg.message : 'This message is private') : msg.message}</div>
      <div class="message-actions">
        ${msg.user === loggedInUser ? `
          <i class="fas fa-edit edit-icon" onclick="editMessage(${index}, '${activeChatUser ? 'direct' : 'channel'}')" style="margin-right: 8px;"></i>
          <i class="fas fa-trash delete-icon" onclick="deleteMessage(${index}, '${activeChatUser ? 'direct' : 'channel'}')"></i>
        ` : ''}
      </div>
    </div>
  `).join('');

  chatMessages.scrollTop = chatMessages.scrollHeight;  // Scroll to the bottom
}

// Add a message to the current chat (channel or direct message)
function addMessage(message) {
  const now = new Date();
  const userName = getStoredLoggedInUser();
  const newMessage = {
    user: userName,
    message: message,
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (activeChatUser) {
    // Add direct message
    if (!directMessages[activeChatUser]) {
      directMessages[activeChatUser] = [];
    }
    directMessages[activeChatUser].push(newMessage);
    localStorage.setItem('directMessages', JSON.stringify(directMessages));
  } else {
    // Add message to the active channel
    if (!channelMessages[activeChannel]) {
      channelMessages[activeChannel] = [];
    }
    channelMessages[activeChannel].push(newMessage);
    localStorage.setItem('channelMessages', JSON.stringify(channelMessages));
  }
  renderMessages(); // Re-render the messages
}

// Edit a message
function editMessage(index, type) {
  const loggedInUser = getStoredLoggedInUser(); // Get the logged-in user
  let messageOwner = type === 'direct' ? directMessages[activeChatUser][index].user : channelMessages[activeChannel][index].user;

  // Check if the logged-in user is the owner of the message
  if (messageOwner !== loggedInUser) {
    alert("You can only edit messages that you sent.");
    return;
  }

  const newMessage = prompt(
    'Edit your message:',
    type === 'direct'
      ? directMessages[activeChatUser][index].message
      : channelMessages[activeChannel][index].message
  );

  if (newMessage !== null) {
    if (type === 'direct') {
      directMessages[activeChatUser][index].message = newMessage;
      localStorage.setItem('directMessages', JSON.stringify(directMessages));
    } else {
      channelMessages[activeChannel][index].message = newMessage;
      localStorage.setItem('channelMessages', JSON.stringify(channelMessages));
    }
    renderMessages(); // Re-render the messages
  }
}

// Delete a message
function deleteMessage(index, type) {
  if (confirm('Are you sure you want to delete this message?')) {
    if (type === 'direct') {
      directMessages[activeChatUser].splice(index, 1);
      localStorage.setItem('directMessages', JSON.stringify(directMessages));
    } else {
      channelMessages[activeChannel].splice(index, 1);
      localStorage.setItem('channelMessages', JSON.stringify(channelMessages));
    }
    renderMessages(); // Re-render the messages
  }
}

// Create a new channel
createChannelButton.addEventListener('click', function () {
  const newChannelName = newChannelNameInput.value.trim();
  if (newChannelName && !channelMessages[newChannelName]) {
    channelMessages[newChannelName] = []; // Add new channel
    const newChannelElement = document.createElement('li');
    newChannelElement.setAttribute('data-channel', newChannelName);
    newChannelElement.textContent = `# ${newChannelName}`;
    channelList.appendChild(newChannelElement);
    newChannelNameInput.value = ''; // Clear input field
    localStorage.setItem('channelMessages', JSON.stringify(channelMessages)); // Save to localStorage
  }
});

// Switch channels when a channel is clicked
channelList.addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    // Remove active class from all channels
    document.querySelectorAll('#channelList li').forEach(li => li.classList.remove('active'));
    // Set the clicked channel as active
    event.target.classList.add('active');
    activeChannel = event.target.getAttribute('data-channel');
    activeChatUser = ""; // Clear active chat user
    activeChannelDisplay.textContent = `# ${activeChannel}`;
    renderMessages(); // Render messages for the active channel
  }
});

// Switch to Direct Message when a user is clicked
directMessagesList.addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    activeChatUser = event.target.textContent.trim(); // Set active user for direct message
    activeChannel = ""; // Clear active channel
    activeChannelDisplay.textContent = `@ ${activeChatUser}`; // Display active user
    renderMessages(); // Render messages for the active direct chat
  }
});

// Send a message
sendMessageButton.addEventListener('click', function () {
  const message = messageInput.value.trim();
  if (message) {
    addMessage(message);
    messageInput.value = ''; // Clear the input field
  }
});

// Send a message on Enter key
messageInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    const message = messageInput.value.trim();
    if (message) {
      addMessage(message);
      messageInput.value = ''; // Clear the input field
    }
  }
});

// Fetch users from the database or a local data source
function fetchUsers() {
  return fetch('http://localhost:5000/users') 
    .then(response => response.json())  
    .then(users => users)
    .catch(error => {
      console.error('Error fetching users:', error);
      return [];
    });
}

// Display users in the Direct Messages section
function displayUsers(users) {
  directMessagesList.innerHTML = ''; // Clear the list
  const loggedInUser = getStoredLoggedInUser(); // Get the logged-in user

  // Display all users including the logged-in user
  users.forEach(user => {
    const listItem = document.createElement('li');
    listItem.textContent = user.name;
    directMessagesList.appendChild(listItem);
  });
}



// Call the function to populate the Direct Messages list when the page loads
fetchUsers().then(users => {
  displayUsers(users);  
});

renderMessages(); 
