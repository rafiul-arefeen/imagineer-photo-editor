from openai import OpenAI

llm_client = OpenAI(api_key="api-key")

# Creating variation of the input image
def create_image_variation(image_path, n=1, size="512x512"):

    response = llm_client.images.create_variation(
        image=open(image_path, "rb"),
        n=n,
        size=size
    )
    return response.data[0].url
