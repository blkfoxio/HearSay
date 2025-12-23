#!/usr/bin/env python3
"""
Generate TTS audio files for HearSay lessons.

Uses OpenAI TTS API to generate audio files for lesson conversations.
Output files are saved to backend/media/audio/

Usage:
    # Set your OpenAI API key
    export OPENAI_API_KEY="your-key-here"

    # Run the script
    python scripts/generate_audio.py

Alternative (if no API key):
    The script will generate placeholder info and you can use
    free online TTS services manually.
"""

import os
import sys
from pathlib import Path

# Add backend to path for settings access
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
AUDIO_DIR = BACKEND_DIR / "media" / "audio"

# Ensure audio directory exists
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def load_env():
    """Load environment variables from .env file."""
    # Check both project root and backend directory for .env
    env_locations = [
        PROJECT_ROOT / ".env",
        BACKEND_DIR / ".env",
    ]

    for env_file in env_locations:
        if env_file.exists():
            print(f"Loading environment from: {env_file}")
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, value = line.split("=", 1)
                        os.environ[key] = value
            break


# Load .env file
load_env()

# Lesson conversation scripts
CONVERSATIONS = {
    "cafe-order-es": {
        "language": "Spanish",
        "voice": "nova",  # OpenAI voice - good for Spanish
        "description": "Customer ordering coffee at a Madrid café",
        "script": """
Cliente: Hola, buenos días.
Camarero: ¡Buenos días! ¿Qué desea?
Cliente: Un café con leche, por favor.
Camarero: Muy bien. ¿Algo más?
Cliente: No, gracias. ¿Cuánto es?
Camarero: Son dos euros cincuenta.
Cliente: Aquí tiene. Gracias.
Camarero: ¡Gracias a usted!
        """.strip(),
    },
    "cafe-snack-es": {
        "language": "Spanish",
        "voice": "nova",
        "description": "Customer ordering a snack at a café",
        "script": """
Cliente: Perdón, ¿tienen algo para comer?
Camarero: Sí, tenemos tostadas, croissants, y bocadillos.
Cliente: Una tostada con tomate, por favor.
Camarero: Perfecto, ahora se la traigo.
        """.strip(),
    },
    "cafe-order-fr": {
        "language": "French",
        "voice": "nova",  # Also works well for French
        "description": "Customer ordering coffee at a Parisian café",
        "script": """
Client: Bonjour!
Serveur: Bonjour! Qu'est-ce que je vous sers?
Client: Un café crème, s'il vous plaît.
Serveur: Très bien. Ce sera tout?
Client: Oui, merci. C'est combien?
Serveur: Trois euros cinquante.
Client: Voilà. Merci!
Serveur: Merci à vous!
        """.strip(),
    },
}


def generate_with_openai(name: str, script: str, voice: str = "nova") -> bool:
    """Generate audio using OpenAI TTS API."""
    try:
        from openai import OpenAI

        client = OpenAI()
        output_path = AUDIO_DIR / f"{name}.mp3"

        print(f"  Generating {name}.mp3 with OpenAI TTS...")

        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=script,
        )

        response.stream_to_file(str(output_path))
        print(f"  ✓ Saved to {output_path}")
        return True

    except ImportError:
        print("  ✗ openai package not installed. Run: pip install openai")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def print_manual_instructions():
    """Print instructions for manual TTS generation."""
    print("\n" + "=" * 60)
    print("MANUAL TTS GENERATION INSTRUCTIONS")
    print("=" * 60)
    print("\nIf you don't have an OpenAI API key, you can generate")
    print("audio files manually using free TTS services:\n")
    print("1. Google Translate TTS: https://translate.google.com")
    print("2. Natural Readers: https://www.naturalreaders.com/online/")
    print("3. TTSMaker: https://ttsmaker.com/\n")

    for name, data in CONVERSATIONS.items():
        print(f"\n--- {name}.mp3 ({data['language']}) ---")
        print(f"Description: {data['description']}")
        print(f"\nScript:\n{data['script']}")
        print(f"\nSave as: {AUDIO_DIR / f'{name}.mp3'}")

    print("\n" + "=" * 60)


def main():
    print("HearSay Audio Generator")
    print("=" * 40)

    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        print("\n⚠ OPENAI_API_KEY not set in environment")
        print_manual_instructions()
        return

    print(f"\nOutput directory: {AUDIO_DIR}")
    print(f"Generating {len(CONVERSATIONS)} audio files...\n")

    success_count = 0
    for name, data in CONVERSATIONS.items():
        print(f"\n[{name}] - {data['language']}")
        if generate_with_openai(name, data["script"], data["voice"]):
            success_count += 1

    print(f"\n{'=' * 40}")
    print(f"Generated {success_count}/{len(CONVERSATIONS)} audio files")

    if success_count < len(CONVERSATIONS):
        print("\nFor failed files, you can generate manually:")
        print_manual_instructions()
    else:
        print("\n✓ All audio files generated successfully!")
        print(f"\nFiles saved to: {AUDIO_DIR}")
        print("\nNext steps:")
        print("1. Start the Django backend: cd backend && python manage.py runserver")
        print("2. Audio will be available at: http://localhost:8000/media/audio/")


if __name__ == "__main__":
    main()
