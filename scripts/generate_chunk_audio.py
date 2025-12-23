#!/usr/bin/env python3
"""
Generate TTS audio files for HearSay chunk lesson phrases.

Uses OpenAI TTS API to generate audio files for individual phrases.
Output files are saved to backend/media/audio/chunks/

Usage:
    python scripts/generate_chunk_audio.py
"""

import os
from pathlib import Path

# Directory setup
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
CHUNKS_DIR = BACKEND_DIR / "media" / "audio" / "chunks"

# Ensure chunks directory exists
CHUNKS_DIR.mkdir(parents=True, exist_ok=True)


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

# Chunk phrases for TTS generation
CHUNKS = {
    # Spanish phrases
    "buenos-dias": {
        "language": "Spanish",
        "voice": "nova",
        "phrase": "Buenos días",
    },
    "que-desea": {
        "language": "Spanish",
        "voice": "nova",
        "phrase": "¿Qué desea?",
    },
    "cafe-con-leche": {
        "language": "Spanish",
        "voice": "nova",
        "phrase": "Un café con leche, por favor",
    },
    "cuanto-es": {
        "language": "Spanish",
        "voice": "nova",
        "phrase": "¿Cuánto es?",
    },
    "gracias": {
        "language": "Spanish",
        "voice": "nova",
        "phrase": "Gracias",
    },
    # French phrases
    "bonjour-fr": {
        "language": "French",
        "voice": "nova",
        "phrase": "Bonjour",
    },
    "quest-ce-que": {
        "language": "French",
        "voice": "nova",
        "phrase": "Qu'est-ce que je vous sers?",
    },
    "cafe-creme": {
        "language": "French",
        "voice": "nova",
        "phrase": "Un café crème, s'il vous plaît",
    },
    "cest-combien": {
        "language": "French",
        "voice": "nova",
        "phrase": "C'est combien?",
    },
    "merci-fr": {
        "language": "French",
        "voice": "nova",
        "phrase": "Merci",
    },
}


def generate_with_openai(name: str, phrase: str, voice: str = "nova") -> bool:
    """Generate audio using OpenAI TTS API."""
    try:
        from openai import OpenAI

        client = OpenAI()
        output_path = CHUNKS_DIR / f"{name}.mp3"

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
    print("HearSay Chunk Audio Generator")
    print("=" * 40)

    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        print("\n⚠ OPENAI_API_KEY not set in environment")
        print("\nPlease ensure your .env file contains OPENAI_API_KEY")
        return

    print(f"\nOutput directory: {CHUNKS_DIR}")
    print(f"Generating {len(CHUNKS)} phrase audio files...\n")

    success_count = 0
    for name, data in CHUNKS.items():
        print(f"[{data['language']}] {data['phrase']}")
        if generate_with_openai(name, data["phrase"], data["voice"]):
            success_count += 1

    print(f"\n{'=' * 40}")
    print(f"Generated {success_count}/{len(CHUNKS)} audio files")

    if success_count == len(CHUNKS):
        print("\n✓ All chunk audio files generated successfully!")
        print(f"\nFiles saved to: {CHUNKS_DIR}")


if __name__ == "__main__":
    main()
