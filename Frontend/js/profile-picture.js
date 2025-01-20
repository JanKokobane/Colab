document.addEventListener('DOMContentLoaded', function () {
    const profilePic = document.getElementById('profile-pic');
    const profileInitials = document.getElementById('profile-initials');
    const uploadPic = document.getElementById('upload-pic');
    const logoutBtn = document.getElementById('logout-btn');

    // Fetch user data from localStorage
    let user = JSON.parse(localStorage.getItem('user'));

    // Display profile picture or initials on page load
    if (user) {
        const initials = user.name.split(' ').map(word => word[0]).join('');
        profileInitials.textContent = initials;

        if (user.profile_picture) {
            // Display the profile picture from localStorage
            profilePic.src = user.profile_picture;
            profilePic.style.display = 'block';
            profileInitials.style.display = 'none';
        } else {
            // Display initials if no profile picture exists
            profilePic.style.display = 'none';
            profileInitials.style.display = 'block';
        }
    }

    // Trigger file upload when profile picture or initials are clicked
    profilePic.addEventListener('click', () => uploadPic.click());
    profileInitials.addEventListener('click', () => uploadPic.click());

    // Handle file upload and save the profile picture in localStorage
    uploadPic.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onloadend = function () {
                const base64String = reader.result;

                // Update profile picture in localStorage
                user.profile_picture = base64String;
                localStorage.setItem('user', JSON.stringify(user));

                // Display the uploaded profile picture
                profilePic.src = base64String;
                profilePic.style.display = 'block';
                profileInitials.style.display = 'none';

                console.log('Profile picture saved to localStorage!');
            };

            reader.readAsDataURL(file); // Convert the file to a Base64 string
        }
    });

});
