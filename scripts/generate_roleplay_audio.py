#!/usr/bin/env python3
"""
Generate TTS audio files for HearSay roleplay lesson prompts.

Uses OpenAI TTS API to generate audio files for roleplay prompts.
Output files are saved to backend/media/audio/roleplay/

Usage:
    python scripts/generate_roleplay_audio.py
"""

import os
from pathlib import Path

# Directory setup
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
ROLEPLAY_DIR = BACKEND_DIR / "media" / "audio" / "roleplay"

# Ensure roleplay directory exists
ROLEPLAY_DIR.mkdir(parents=True, exist_ok=True)


def load_env():
    """Load environment variables from .env file."""
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

# Roleplay prompts for TTS generation
# These are what the "other person" says in the roleplay scenario
ROLEPLAY_PROMPTS = {
    # Spanish cafe roleplay
    "es-cafe-prompt-1": {
        "language": "Spanish",
        "voice": "onyx",  # Male voice for waiter
        "phrase": "¡Buenos días! ¿Qué le puedo servir?",
    },
    "es-cafe-prompt-2": {
        "language": "Spanish",
        "voice": "onyx",
        "phrase": "Muy bien. ¿Algo más?",
    },
    "es-cafe-prompt-3": {
        "language": "Spanish",
        "voice": "onyx",
        "phrase": "Son cuatro euros con cincuenta.",
    },
    # French cafe roleplay
    "fr-cafe-prompt-1": {
        "language": "French",
        "voice": "onyx",  # Male voice for server
        "phrase": "Bonjour! Qu'est-ce que je vous sers?",
    },
    "fr-cafe-prompt-2": {
        "language": "French",
        "voice": "onyx",
        "phrase": "Très bien. Avec ça?",
    },
    "fr-cafe-prompt-3": {
        "language": "French",
        "voice": "onyx",
        "phrase": "Ça vous a plu?",
    },
}


def generate_with_openai(name: str, phrase: str, voice: str = "onyx") -> bool:
    """Generate audio using OpenAI TTS API."""
    try:
        from openai import OpenAI

        client = OpenAI()
        output_path = ROLEPLAY_DIR / f"{name}.mp3"

        print(f"  Generating {name}.mp3...")

        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=phrase,
        )

        response.stream_to_file(str(output_path))
        print(f"  ✓ Saved: {output_path.name}")
        return True

    except ImportError:
        print("  ✗ openai package not installed. Run: pip install openai")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def main():
    print("HearSay Roleplay Audio Generator")
    print("=" * 40)

    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        print("\n⚠ OPENAI_API_KEY not set in environment")
        print("\nPlease ensure your .env file contains OPENAI_API_KEY")
        return

    print(f"\nOutput directory: {ROLEPLAY_DIR}")
    print(f"Generating {len(ROLEPLAY_PROMPTS)} roleplay prompt audio files...\n")

    success_count = 0
    for name, data in ROLEPLAY_PROMPTS.items():
        print(f"[{data['language']}] {data['phrase']}")
        if generate_with_openai(name, data["phrase"], data["voice"]):
            success_count += 1

    print(f"\n{'=' * 40}")
    print(f"Generated {success_count}/{len(ROLEPLAY_PROMPTS)} audio files")

    if success_count == len(ROLEPLAY_PROMPTS):
        print("\n✓ All roleplay audio files generated successfully!")
        print(f"\nFiles saved to: {ROLEPLAY_DIR}")


if __name__ == "__main__":
    main()
