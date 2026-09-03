#!/usr/bin/env python3
"""Audio validation test script"""

import requests
import json
import sys
from datetime import datetime
from pathlib import Path

def test_audio(audio_path: str, test_type: str):
    """Test audio validation endpoint"""
    
    audio_file = Path(audio_path)
    if not audio_file.exists():
        print(f"❌ Audio file not found: {audio_path}")
        sys.exit(1)
    
    # Prepare metadata
    metadata = {
        "session_id": f"test_{hash(datetime.now())%10000}",
        "contributor_id": "contrib_amy",
        "language": "english",
        "consent_given": True,
        "consent_timestamp": datetime.now().isoformat(),
        "target_prompt": "This is a complete audio recording test",
        "client_device": "sound_recorder"
    }
    
    print(f"🎵 Testing: {test_type} audio")
    print(f"📁 File: {audio_path}")
    print(f"📋 Metadata: {json.dumps(metadata, indent=2)}")
    print()
    
    # Prepare multipart form data
    files = {
        'file': (audio_file.name, open(audio_file, 'rb'), 'audio/m4a')
    }
    data = {
        'metadata_json': json.dumps(metadata)
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/v1/validate-audio',
            files=files,
            data=data,
            timeout=30
        )
        
        # Close the file
        files['file'][1].close()
        
        if response.status_code == 200:
            print("✅ Request Successful (Status: 200)")
            result = response.json()
            print("\nResponse:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Request Failed (Status: {response.status_code})")
            print("\nError Response:")
            print(response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_audio.py <audio_path> <test_type>")
        print("  test_type: 'complete' or 'truncated'")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    test_type = sys.argv[2]
    
    if test_type not in ["complete", "truncated"]:
        print("❌ test_type must be 'complete' or 'truncated'")
        sys.exit(1)
    
    test_audio(audio_path, test_type)
