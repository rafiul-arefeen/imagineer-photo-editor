from flask import Flask, request, jsonify, url_for
from openai import OpenAI
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv
from PIL import Image
import numpy as np
import cv2
from functions import resize_image, create_image_variation, generate_image_from_text



app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})



def read_image_from_blob(blob):
    # Convert Blob to bytes
    blob_bytes = blob.read()

    # Convert bytes to numpy array
    nparr = np.frombuffer(blob_bytes, np.uint8)

    # Decode the image using OpenCV
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    return img


@app.route('/style-variation-endpoint', methods=['POST'])
@cross_origin()
def style_variation():
    if 'image' not in request.files or 'prompt' not in request.form:
        return jsonify({'error': 'Image file and prompt are required'}), 400

    image_file = request.files['image']
    prompt = request.form['prompt']

    print(image_file)
    print(prompt)

    # with open('your_blob_data', 'rb') as blob:
    image = read_image_from_blob(image_file)
    print(image)
        # Now 'image' contains the image data and you can process it using OpenCV
    cv2.imwrite("image.png",image)

    



    



@app.route('/generate-image-from-text', methods=['POST'])
@cross_origin()
def handle_generate_image_from_text():
    
    prompt = request.json.get('prompt')
    if not prompt:
        print("No prompt")
        return jsonify({'error': 'Prompt is required'}), 400

    print(prompt)

    try:
        url = generate_image_from_text(prompt)
        print(url)
        return jsonify({'url': url})
    except Exception as e:
        print("My bad")
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
