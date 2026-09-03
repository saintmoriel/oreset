# Use an official lightweight Python image
FROM python:3.12-slim

# Install system dependencies (ffmpeg is required for librosa and whisper audio processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the Whisper tiny model to speed up startup time
RUN python -c "import whisper; whisper.load_model('tiny')"

# Copy the rest of the application code
COPY ./app /app/app

# Expose port 8000
EXPOSE 8000

# Start the FastAPI app using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
