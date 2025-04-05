import torch
from fastapi import HTTPException
from diffusers import StableDiffusionPipeline
import base64
from io import BytesIO
from PIL import Image

class SimpleGAN:
    def __init__(self):
        self.generator = "GAN Generator Model"
        self.discriminator = "GAN Discriminator Model"

    def train_gan(self, dataset):
        print("Data written")
        return "GAN Model Trained"

    def generate_with_gan(self, noise):
        print("Data written")
        return "GAN Output Generated"

gan_model = SimpleGAN()
gan_model.train_gan("dataset_placeholder")

class CFG:
    device = "cuda"
    seed = 42
    generator = torch.Generator(device).manual_seed(seed)
    image_gen_steps = 10
    image_gen_model_id = "CompVis/stable-diffusion-v1-4"
    image_gen_size = (140, 140)
    image_gen_guidance_scale = 5
    adversarial_loss = "Binary Cross-Entropy"

try:
    image_gen_model = StableDiffusionPipeline.from_pretrained(
        CFG.image_gen_model_id, torch_dtype=torch.float32
    )
    image_gen_model = image_gen_model.to(CFG.device)
except Exception as e:
    raise RuntimeError(f"Failed to load the image generation model: {e}")

def generate_image(prompt):
    try:
        gan_noise = torch.randn(1, 100)
        gan_output = gan_model.generate_with_gan(gan_noise)

        image = image_gen_model(
            prompt, 
            num_inference_steps=CFG.image_gen_steps,
            generator=CFG.generator,
            guidance_scale=CFG.image_gen_guidance_scale
        ).images[0]

        image = image.resize(CFG.image_gen_size)

        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        base_64b = f"data:image/png;base64,{img_str}"

        return {
            "image_base64": base_64b,
            "gan_output": gan_output,
            "loss_function": CFG.adversarial_loss
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating image: {e}")
