// src/FacebookUploader.js
import React, { useEffect } from 'react';

const FacebookUploader = () => {
  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: 'YOUR_APP_ID', // Replace with your Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });

      window.FB.AppEvents.logPageView();
    };
  }, []);

  const handleLogin = () => {
    window.FB.login(
      function(response) {
        if (response.authResponse) {
          console.log('Welcome! Fetching your information.... ');
          window.FB.api('/me', function(response) {
            console.log('Good to see you, ' + response.name + '.');
            // Now you can post the photo
            postPhoto(response.authResponse.accessToken);
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      { scope: 'publish_to_groups,publish_actions' }
    );
  };

  const postPhoto = (accessToken) => {
    const formData = new FormData();
    const imageFile = new Blob([/* Your image data */], { type: 'image/jpeg' }); // Replace with your image file
    formData.append('source', imageFile);
    formData.append('caption', 'Your photo caption here');

    fetch(`https://graph.facebook.com/v12.0/me/photos?access_token=${accessToken}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          console.log('Photo uploaded successfully, ID: ' + data.id);
        } else {
          console.error('Error uploading photo:', data);
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div>
      <button onClick={handleLogin}>Share Photo to Facebook</button>
    </div>
  );
};

export default FacebookUploader;
