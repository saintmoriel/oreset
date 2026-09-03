import requests

url = "http://localhost:8000/api/v1/calibrate-operator"
data = {
    "language": "somali",
    "word_count": 125,
    "duration_sec": 60.0
}

response = requests.post(url, json=data)
print("Status Code:", response.status_code)
print("Response Body:", response.json())
