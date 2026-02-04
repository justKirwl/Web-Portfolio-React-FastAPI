import random

async def generate_random_hex_color() -> str:
    red = random.randint(0, 255)
    green = random.randint(0, 255)
    blue = random.randint(0, 255)

    hex_color = f'{red:02x}{green:02x}{blue:02x}'
    return hex_color