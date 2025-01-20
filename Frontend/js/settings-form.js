document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const personalEmail = document.getElementById('personalEmail').value.trim();
    const highSchool = document.getElementById('highSchool').value.trim();
    const college = document.getElementById('college').value.trim();
    const areaOfStudy = document.getElementById('areaOfStudy').value.trim();
    const additionalEducationDetails = document.getElementById('additionalEducationDetails').value.trim();
    const currentEmployer = document.getElementById('currentEmployer').value.trim();
    const currentPosition = document.getElementById('currentPosition').value.trim();
    const currentDuration = document.getElementById('currentDuration').value.trim();
    const previousEmployer = document.getElementById('previousEmployer').value.trim();
    const previousPosition = document.getElementById('previousPosition').value.trim();
    const previousDuration = document.getElementById('previousDuration').value.trim();
    const additionalWorkExperience = document.getElementById('additionalWorkExperience').value.trim();
  
    fetch('http://127.0.0.1:5000/save_profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName, 
        phoneNumber, 
        personalEmail,
        highSchool,
        college,
        areaOfStudy,
        additionalEducationDetails,
        currentEmployer,
        currentPosition,
        currentDuration,
        previousEmployer,
        previousPosition,
        previousDuration,
        additionalWorkExperience
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error('An error occurred:', data.error);
      } else {
        console.log('Profile saved successfully!');
        // Store data in local storage
        localStorage.setItem('userProfile', JSON.stringify(data.userProfile));
      }
    })
    .catch(error => {
      console.error('An unexpected error occurred:', error);
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
  
    if (userProfile) {
      document.getElementById('fullName').value = userProfile.fullName;
      document.getElementById('phoneNumber').value = userProfile.phoneNumber;
      document.getElementById('personalEmail').value = userProfile.personalEmail;
      document.getElementById('highSchool').value = userProfile.highSchool;
      document.getElementById('college').value = userProfile.college;
      document.getElementById('areaOfStudy').value = userProfile.areaOfStudy;
      document.getElementById('additionalEducationDetails').value = userProfile.additionalEducationDetails;
      document.getElementById('currentEmployer').value = userProfile.currentEmployer;
      document.getElementById('currentPosition').value = userProfile.currentPosition;
      document.getElementById('currentDuration').value = userProfile.currentDuration;
      document.getElementById('previousEmployer').value = userProfile.previousEmployer;
      document.getElementById('previousPosition').value = userProfile.previousPosition;
      document.getElementById('previousDuration').value = userProfile.previousDuration;
      document.getElementById('additionalWorkExperience').value = userProfile.additionalWorkExperience;
    }
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    // Fetch user info from the backend
    fetch('http://127.0.0.1:5000/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.fullName) {
          document.getElementById('fullName').value = data.fullName;
          document.getElementById('personalEmail').value = data.personalEmail;
        } else {
          console.error('User not found or error occurred:', data.error);
        }
      })
      .catch(error => {
        console.error('An unexpected error occurred:', error);
      });
  });

  
  document.addEventListener('DOMContentLoaded', function () {
    const profilePic = document.querySelector('.profile-header img');

    // Fetch user initials from backend
    fetch('http://127.0.0.1:5000/get_user_name')
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                const initials = data.name.split(' ').map(word => word[0]).join('');
                profilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}`;
            } else {
                console.error('User not found or error occurred:', data.error);
            }
        })
        .catch(error => {
            console.error('An unexpected error occurred:', error);
        });
});
