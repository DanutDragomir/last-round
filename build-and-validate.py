#!/usr/bin/env python3
"""
Last Round APK Build & Validate Pipeline
Builds APK and triggers Command Center validation with Casey Hart.
"""

import subprocess
import json
import os
import requests
import sys
from pathlib import Path
from datetime import datetime

# Build configuration
PROJECT_ROOT = Path(__file__).parent
BUILD_OUTPUT_DIR = PROJECT_ROOT / "android" / "app" / "build" / "outputs" / "apk" / "release"
KEYSTORE_PATH = PROJECT_ROOT / "lastround.keystore"
COMMAND_CENTER_URL = "http://localhost:5000"

# Environment
FIREBASE_ADMIN_SDK = Path("D:/Home/Vault/last-round-card-game-firebase-adminsdk-fbsvc-90cef74420.json")


def log(level: str, message: str):
    """Print timestamped log message."""
    timestamp = datetime.now().isoformat()
    print(f"[{timestamp}] [{level}] {message}")


def run_command(cmd: list, cwd: str = None) -> tuple[bool, str]:
    """Run shell command and return (success, output)."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd or str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            timeout=600,
            shell=os.name == "nt"
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, "Build timeout (10 minutes exceeded)"
    except Exception as e:
        return False, str(e)


def build_apk() -> tuple[bool, str]:
    """Build Android APK with Gradle."""
    log("INFO", "Starting APK build...")

    # Check keystore
    if not KEYSTORE_PATH.exists():
        return False, f"Keystore not found: {KEYSTORE_PATH}"

    # Run Gradle build (use gradlew.bat on Windows)
    android_dir = PROJECT_ROOT / "android"
    if os.name == "nt":
        gradle_path = str(android_dir / "gradlew.bat")
    else:
        gradle_path = str(android_dir / "gradlew")

    success, output = run_command(
        [gradle_path, "bundleRelease"],
        cwd=str(android_dir)
    )

    if not success:
        log("ERROR", "Gradle build failed")
        return False, output

    # Find generated APK
    apk_files = list(BUILD_OUTPUT_DIR.glob("*.apk"))
    if not apk_files:
        return False, "No APK generated"

    apk_path = apk_files[-1]
    apk_size_mb = apk_path.stat().st_size / (1024 * 1024)

    log("OK", f"APK built: {apk_path.name} ({apk_size_mb:.1f} MB)")
    return True, str(apk_path)


def send_to_command_center(apk_path: str, build_metadata: dict) -> bool:
    """Send build result to Command Center for Casey validation."""
    log("INFO", "Sending to Command Center...")

    # Prepare command
    payload = {
        "agent": "Casey",
        "command": "/validate_build",
        "payload": {
            "build_id": f"last-round-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "apk_path": apk_path,
            "metadata": build_metadata
        }
    }

    try:
        response = requests.post(
            f"{COMMAND_CENTER_URL}/command",
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            log("OK", f"Command sent to Casey: {result.get('success', False)}")
            return True
        else:
            log("ERROR", f"Command Center response: {response.status_code} {response.text}")
            return False

    except Exception as e:
        log("ERROR", f"Failed to reach Command Center: {e}")
        return False


def get_build_info() -> dict:
    """Gather build metadata."""
    return {
        "timestamp": datetime.now().isoformat(),
        "project": "Last Round Card Game",
        "build_type": "release",
        "version_code": 2,
        "version_name": "1.1",
        "signed": True,
        "firebase_ready": FIREBASE_ADMIN_SDK.exists()
    }


def main():
    """Main build pipeline."""
    log("INFO", "=== Last Round APK Build Pipeline ===")

    # Step 1: Build APK
    build_ok, apk_result = build_apk()
    if not build_ok:
        log("ERROR", f"Build failed: {apk_result}")
        sys.exit(1)

    apk_path = apk_result

    # Step 2: Get build metadata
    metadata = get_build_info()
    log("INFO", f"Build metadata: {json.dumps(metadata, indent=2)}")

    # Step 3: Send to Command Center
    cc_ok = send_to_command_center(apk_path, metadata)
    if not cc_ok:
        log("WARN", "Failed to notify Command Center (continuing anyway)")

    # Step 4: Log completion
    log("OK", "=== Build pipeline complete ===")
    log("INFO", f"APK: {apk_path}")
    log("INFO", f"Next: Casey Hart will validate and benchmark")

    return 0


if __name__ == "__main__":
    sys.exit(main())
