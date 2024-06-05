import cv2
import numpy as np
from openai import OpenAI
llm_client = OpenAI(api_key='api-key')


def process_image(image_path, x, y, w, h, prompt):
    image = cv2.imread(image_path)
    image = cv2.resize(image,(512,512))
    mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
    cv2.rectangle(mask, (x - w // 2, y - h // 2), (x + w // 2, y + h // 2), 255, -1)
    mask = mask.astype(np.uint8)
    mask = cv2.bitwise_not(mask)

    # Create the transparent image
    result = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    result = cv2.bitwise_and(result, result, mask=mask)

    # Save the transparent image
    transparent_image_path = 'transparent_image.png'
    cv2.imwrite(transparent_image_path, result)
    print(f"Image with transparent rectangle saved as '{transparent_image_path}'")

    # Edit the image using client API
    response = llm_client.images.edit(
        image=open(image_path, "rb"),
        mask=open(transparent_image_path, "rb"),
        prompt=prompt,
        n=1,
        size="512x512"
    )

    # Return the URL of the edited image
    return response.data[0].url


# Example usage
image_url = process_image('person.png', 284, 336, 138, 350, "Fill with the background of the image")
print(image_url)
