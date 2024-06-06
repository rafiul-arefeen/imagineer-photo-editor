from flask import Flask, request, jsonify, url_for
from openai import OpenAI
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv
from PIL import Image
import numpy as np
import cv2
from functions import resize_image, create_image_variation, generate_image_from_text
from chat2obj_removal import predict

folder_name = r"F:\Work\Web Development\imagineer-photo-editor\images"


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})






@app.route('/style-variation-endpoint', methods=['POST'])
@cross_origin()
def style_variation():
    image_file = request.form['image']
    prompt = request.form['prompt']

    print(image_file)
    print(prompt)

    name = os.path.join(folder_name, image_file)
    # print(name)

    try:
        url = create_image_variation(name)
        print(url)
        return jsonify({'url': url})
    except Exception as e:
        print("My bad")
        return jsonify({'error': str(e)}), 500
    # if 'image' not in request.files or 'prompt' not in request.form:
    #     return jsonify({'error': 'Image file and prompt are required'}), 400

    



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



@app.route('/object-removal-endpoint', methods=['POST'])
@cross_origin()
def remove_object():
    image_file = request.form['image']
    prompt = request.form['prompt']

    print(image_file)
    print(prompt)

    name = os.path.join(folder_name, image_file)
    print(name)

    try:
        url = predict(name, prompt)
        print(url)
        return jsonify({'url': url})
    except Exception as e:
        print(jsonify({'error': str(e)}))
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
