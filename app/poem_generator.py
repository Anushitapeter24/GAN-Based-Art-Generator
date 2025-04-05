import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential

AZURE_KEY_CREDENTIAL = "API_KEY" #ANU
 

client = ChatCompletionsClient(
    endpoint="https://models.inference.ai.azure.com",
    credential=AzureKeyCredential(AZURE_KEY_CREDENTIAL)
)

def generate_poem(prompt):
    try:
        response = client.complete(
            messages=[
                SystemMessage("You are a creative poet."),
                UserMessage(f"Write a creative poem about {prompt}."),
            ],
            model="Llama-3.3-70B-Instruct", 
            temperature=0.7,
            max_tokens=150,
            top_p=0.9
        )

        # Check if the response contains a single choice with a message content
        if response.choices and response.choices[0].message and response.choices[0].message.content:
            # Extract and return the poem from the response
            return response.choices[0].message.content.strip()
        else:
            print("Error: Invalid response from the model.")
            return None

    except Exception as e:
        print(f"Error generating poem: {e}")
        return None


# Example usage
if __name__ == "__main__":
    prompt = "the beauty of nature"
    poem = generate_poem(prompt)
    if poem:
        print("Generated Poem:\n", poem)
    else:
        print("Failed to generate a poem.")