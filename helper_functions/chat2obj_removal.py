from ultralytics import YOLO
import cv2
import numpy as np
from openai import OpenAI
from json import loads

llm_client = OpenAI(api_key="api-key")
llm_model = "gpt-3.5-turbo-0125"
user_prompt = None

label_list = [
        "person",
        "bicycle",
        "car",
        "motorcycle",
        "airplane",
        "bus",
        "train",
        "truck",
        "boat",
        "traffic light",
        "fire hydrant",
        "stop sign",
        "parking meter",
        "bench",
        "bird",
        "cat",
        "dog",
        "horse",
        "sheep",
        "cow",
        "elephant",
        "bear",
        "zebra",
        "giraffe",
        "backpack",
        "umbrella",
        "handbag",
        "tie",
        "suitcase",
        "frisbee",
        "skis",
        "snowboard",
        "sports ball",
        "kite",
        "baseball bat",
        "baseball glove",
        "skateboard",
        "surfboard",
        "tennis racket",
        "bottle",
        "wine glass",
        "cup",
        "fork",
        "knife",
        "spoon",
        "bowl",
        "banana",
        "apple",
        "sandwich",
        "orange",
        "broccoli",
        "carrot",
        "hot dog",
        "pizza",
        "donut",
        "cake",
        "chair",
        "couch",
        "potted plant",
        "bed",
        "dining table",
        "toilet",
        "tv",
        "laptop",
        "mouse",
        "remote",
        "keyboard",
        "cell phone",
        "microwave",
        "oven",
        "toaster",
        "sink",
        "refrigerator",
        "book",
        "clock",
        "vase",
        "scissors",
        "teddy bear",
        "hair drier",
        "toothbrush"
    ]
def detect_and_save(query, model_path="yolov8n.pt", image_path="person.png"):
    # Load a model
    model = YOLO(model_path)  # pretrained YOLOv8n model
    label_names = label_list

    def predict():
        # Run inference on the image
        results = model(image_path)  # return a list of Results objects

        # Process results list
        for result in results:
            boxes = result.boxes  # Boxes object for bounding box outputs
            class_label = int(boxes.cls[0])
            box = list(boxes.xywh)
            if query == label_names[class_label]:
                x, y, w, h = box[0]
                return int(x), int(y), int(w), int(h)

    return predict()


def create_transparent_rectangle(image_path, x, y, w, h, output_path):
    """
    Creates a transparent rectangle on an image and saves the result.

    Parameters:
    - image_path: Path to the input image.
    - x, y: Top-left coordinates of the rectangle.
    - w, h: Width and height of the rectangle.
    - output_path: Path to save the output image.
    """
    # Load the image
    image = cv2.imread(image_path)

    # Create a black mask with the same size as the image
    mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)

    # Draw rectangle on the mask
    cv2.rectangle(mask, (x - w // 2, y - h // 2), (x + w // 2, y + h // 2), 255, -1)

    # Ensure mask has uint8 data type and invert it
    mask = mask.astype(np.uint8)
    mask = cv2.bitwise_not(mask)

    # Convert the image to BGRA to add an alpha channel
    result = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)

    # Apply bitwise manipulation to create transparency
    result = cv2.bitwise_and(result, result, mask=mask)

    # Save the result
    cv2.imwrite(output_path, result)
    print(f"Image with transparent rectangle saved as '{output_path}'")


def edit_image_with_openai(image_path, mask_path, prompt, output_size="512x512"):
    """
    Edits the image using OpenAI's image API.

    Parameters:
    - image_path: Path to the input image.
    - mask_path: Path to the mask image.
    - prompt: Text prompt for the editing.
    - output_size: Size of the output image.
    """
    response = llm_client.images.edit(
        image=open(image_path, "rb"),
        mask=open(mask_path, "rb"),
        prompt=prompt,
        n=1,
        size=output_size
    )

    # Process and save the response
    print(response)
    return response.data[0].url


def get_object_info(data):
    global user_prompt
    print(user_prompt)
    query_obj = data.get("object_name")
    x, y, w, h = detect_and_save(query_obj)
    create_transparent_rectangle('person.png', x, y, w, h, 'transparent_image.png')
    return edit_image_with_openai('person.png', 'transparent_image.png', user_prompt)


func_tools = [
    {
        "type": "function",
        "function": {
            "name": "get_object_info",
            "description": "When the user asks about inserting an object in an image or removing an object from an image",
            "parameters": {
                "type": "object",
                "properties": {
                    "object_name": {
                        "type": "string",
                        "enum": label_list,
                        "description": "The name of the object the user is trying to edit"
                    }
                }
            }
        }
    }
]


def ask_gpt(models=llm_model, history=None, tool_option="auto", tool_list=None):
    response = llm_client.chat.completions.create(
        model=models,
        max_tokens=256,
        messages=history,
        tools=tool_list,
        tool_choice="auto",
    )
    if tool_option is None:
        return response.choices[0].message.content.split("\n")[0]
    else:
        return response.choices[0].message


message_history = []

def predict(user_question):
    global user_prompt
    user_prompt = user_question
    message_history.append({'role': 'user', 'content': user_question})
    response = ask_gpt(models=llm_model, history=message_history, tool_list=func_tools)
    if response.tool_calls:
        available_functions = {
            "get_object_info": get_object_info
        }
        function_name = response.tool_calls[0].function.name
        print(function_name)
        function_to_call = available_functions[function_name]
        function_args = loads(response.tool_calls[0].function.arguments)
        print("Arguments", function_args)
        function_response = function_to_call(function_args)
        if function_response is not None:
            return function_response



# Example of Chat Usage
print(predict("Fill with the surrounding background locating the person"))