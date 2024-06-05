from flask import Flask, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

# Replace with your actual OpenAI API key
llm_client = OpenAI()

# Creating variation of the input image
def create_image_variation(image_path, n=1, size="512x512"):
    response = llm_client.images.create_variation(
        image=open(image_path, "rb"),
        n=n,
        size=size
    )
    return response.data[0].url

def generate_image_from_text(prompt, model="dall-e-3", n=1, size="512x512"):
    response = llm_client.images.generate(
        model=model,
        prompt=prompt,
        n=n,
        size=size
    )
    return response.data[0].url

@app.route('/create-image-variation', methods=['POST'])
def handle_create_image_variation():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image = request.files['image']
    n = request.form.get('n', default=1, type=int)
    size = request.form.get('size', default="512x512")

    # Save the uploaded image to a temporary file
    image_path = os.path.join("/tmp", image.filename)
    image.save(image_path)

    try:
        url = create_image_variation(image_path, n, size)
        return jsonify({'url': url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(image_path)

@app.route('/generate-image-from-text', methods=['POST'])
def handle_generate_image_from_text():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    model = request.json.get('model', 'dall-e-3')
    n = request.json.get('n', 1)
    size = request.json.get('size', '512x512')

    try:
        url = generate_image_from_text(prompt, model, n, size)
        return jsonify({'url': url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
