import React from 'react';
import FacebookUploader from '../Components/FacebookUploader'; 

const Post = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Photo Editor</h1>
        <FacebookUploader />
      </header>
    </div>
  );
};                  

export default Post;