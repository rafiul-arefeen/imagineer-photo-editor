# Imagineer | Photo Editor with AI

Imagineer is a web-based photo editor built using HTML, CSS, and JavaScript. It allows users to apply various filters and effects to their images, providing a simple yet powerful editing experience right in the browser.

## General Features

- **Filter Options**: Adjust brightness, contrast, saturation, grayscale and more properties of images using intuitive sliders.
- **Rotate & Flip**: Rotate images left or right, and flip them horizontally or vertically with the click of a button.
- **Reset Settings**: Easily reset all filter settings to their default values.
- **Save Image**: Save edited images directly from the browser.

## AI Features
- **Style Variation**
- **Object Removal**
- **Generate Image**

## Running and Using Imagineer

### Setting Up the Environment
1.	Make sure you have [NodeJS](https://nodejs.org/en) installed on your system.
2.	Clone the repo to your local machine.
3.	Navigate to `Frontend` > `Imagineer Frontend`.
4.	Open a terminal there and run `npm install`. This will install all the required node packages.
5.	Navigate to the .env file.
6.	Type your OpenAI API Key in the <openaikey> field in the .env file and save it.
7.	Navigate to the Backend directory.
8.	Open a terminal and run `my_venv/Scripts/Activate` to activate the virtual environment.
9.	Open another terminal and run `pip install -r requirements.txt`. This will install the required dependencies.

### Running the Project
1.	Open a new terminal and navigate to the `Backend` directory.
2.	Run `python app.py` to start the backend.
3.	Open another terminal and navigate to `Frontend` > `Imagineer Frontend`.
4.	Run `npm run dev` to start the frontend.
5.	Go to the link provided in the terminal.

### Using Imagineer
1.	The window on the left side is the canvas, here is where the image is loaded for editing.
2.	On the right is the editing panel.
3.	Click `Choose Image` on the bottom of the editing panel to load an image.
4.	Play around with the sliders and other settings to adjust the image.
5.	Finally hit `Save Image` to save the edited image to your local device.
6.	For AI functionality, choose AI at the top of the editing panel. This will take you to the AI Editing Menu.
7.	From here you can select and play around with 3 different options:
  -	Style Variation: To create different versions of your current image.
  -	Generate Image: To generate a completely new image based on your text prompt.
  -	Object Removal: To remove an object from your photo.
