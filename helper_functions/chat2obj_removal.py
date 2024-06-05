import cv2
import numpy as np
from ultralytics import YOLO
from openai import OpenAI
from json import loads

# Initialize the OpenAI client and model
llm_client = OpenAI(api_key="api-key")
llm_model = "gpt-3.5-turbo-0125"
user_prompt = None
img_src = None

label_list = [
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign",
    "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
    "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard",
    "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
    "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv",
    "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase",
    "scissors", "teddy bear", "hair drier", "toothbrush"
]

def detect_and_save(query, model_path="yolov8n.pt", image_path="person.png"):
    model = YOLO(model_path)
    label_names = label_list

    results = model(image_path)

    for result in results:
        boxes = result.boxes
        class_label = int(boxes.cls[0])
        box = list(boxes.xywh)
        if query == label_names[class_label]:
            x, y, w, h = box[0]
            return int(x), int(y), int(w), int(h)
    return None, None, None, None

def create_transparent_rectangle(image_path, x, y, w, h, output_path):
    image = cv2.imread(image_path)
    mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
    cv2.rectangle(mask, (x - w // 2, y - h // 2), (x + w // 2, y + h // 2), 255, -1)
    mask = mask.astype(np.uint8)
    mask = cv2.bitwise_not(mask)
    result = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    result = cv2.bitwise_and(result, result, mask=mask)
    cv2.imwrite(output_path, result)
    print(f"Image with transparent rectangle saved as '{output_path}'")

def edit_image_with_openai(image_path, mask_path, prompt, output_size="512x512"):
    response = llm_client.images.edit(
        image=open(image_path, "rb"),
        mask=open(mask_path, "rb"),
        prompt=prompt,
        n=1,
        size=output_size
    )
    print(response)
    return response.data[0].url

def get_object_info(data):
    global user_prompt, img_src
    print(user_prompt)
    query_obj = data.get("object_name")
    x, y, w, h = detect_and_save(query_obj)
    if x is not None and y is not None and w is not None and h is not None:
        create_transparent_rectangle(img_src, x, y, w, h, 'transparent_image.png')
        return edit_image_with_openai(img_src, 'transparent_image.png', user_prompt)
    else:
        return "Object not found in the image."

# def refine_prompt(user_content):
#     system_prompt = "Your task is to refine the prompt by excluding the name of the object and retaining the rest of the user's prompt."
#     response = llm_client.chat.completions.create(
#         model="gpt-4",
#         messages=[
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": user_content}
#         ]
#     )
#     return response.choices[0].message.content

def refine_prompt(user_content):
    system_prompt = "Your task is to extract the first sentence of the user's prompt."
    response = llm_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
    )
    return response.choices[0].message.content


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

def predict(image, user_question):
    global user_prompt, img_src
    img_src = image
    user_prompt = refine_prompt(user_question)
    print(user_prompt)
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
            return {"data_url":function_response,"reply": "The image transformation has been applied"}

# Example of Chat Usage
print(predict("person.png", "Fill with the surrounding background of the image. The object name to be replaced is the person"))
