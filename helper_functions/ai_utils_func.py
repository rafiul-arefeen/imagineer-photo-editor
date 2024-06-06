from openai import OpenAI
import cv2
import numpy as np
import requests
import os

llm_client = OpenAI(api_key="api-key")

def load_image_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        image_array = np.asarray(bytearray(response.content), dtype="uint8")
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
    else:
        print("Error: Unable to download image")
        return None

def save_image(image, path):
    image = cv2.resize(image,(512,512))
    cv2.imwrite(path, image)

def create_image_variation(image_path, n=1, size="512x512"):
    image = load_image_from_url(image_path)
    image_path = 'downloaded_image.png'
    save_image(image, image_path)

    with open(image_path, 'rb') as image_file:
        response = llm_client.images.create_variation(
            image=image_file,
            n=n,
            size=size
        )
    return response.data[0].url

def generate_image_from_text(prompt, model="dall-e-3", n=1, size="1024x1024"):
    response = llm_client.images.generate(
        model=model,
        prompt=prompt,
        n=n,
        size=size
    )
    print(response)
    return response.data[0].url

