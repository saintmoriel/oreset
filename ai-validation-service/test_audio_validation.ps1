# Audio Validation Test Script - PowerShell 5.1 Compatible
# Usage: .\test_audio_validation.ps1 -AudioPath "path\to\audio.m4a" -TestType "complete"

param(
    [Parameter(Mandatory=$true)]
    [string]$AudioPath,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("complete", "truncated")]
    [string]$TestType
)

# Verify audio file exists
if (-not (Test-Path $AudioPath)) {
    Write-Error "Audio file not found: $AudioPath"
    exit 1
}

# Metadata JSON
$metadata = @{
    session_id = "test_$(Get-Random)"
    contributor_id = "contrib_amy"
    language = "english"
    consent_given = $true
    consent_timestamp = (Get-Date).ToString("o")
    target_prompt = "This is a complete audio recording test"
    client_device = "sound_recorder"
} | ConvertTo-Json -Compress

Write-Host "Testing: $TestType audio" -ForegroundColor Cyan
Write-Host "File: $AudioPath" -ForegroundColor Cyan
Write-Host "Metadata: $metadata" -ForegroundColor Gray
Write-Host ""

# Create proper multipart form data
$boundary = "----WebKitFormBoundary$(Get-Random)"
$filename = Split-Path -Leaf $AudioPath
$CRLF = "`r`n"

# Build the body with proper CRLF line endings
$bodyArray = @()
$bodyArray += "--$boundary"
$bodyArray += "Content-Disposition: form-data; name=`"metadata_json`""
$bodyArray += ""
$bodyArray += $metadata
$bodyArray += "--$boundary"
$bodyArray += "Content-Disposition: form-data; name=`"file`"; filename=`"$filename`""
$bodyArray += "Content-Type: audio/mp4"
$bodyArray += ""

# Join with CRLF
$body = $bodyArray -join $CRLF

# Read the audio file as bytes
$fileBytes = [System.IO.File]::ReadAllBytes($AudioPath)

# Convert body string to bytes
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)

# Create the end boundary
$endBoundary = $CRLF + "--$boundary--" + $CRLF
$endBoundaryBytes = [System.Text.Encoding]::UTF8.GetBytes($endBoundary)

# Combine all parts
$fullBody = $bodyBytes + $fileBytes + $endBoundaryBytes

try {
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/v1/validate-audio" `
        -Method Post `
        -Body $fullBody `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -ErrorAction Stop

    Write-Host "✅ Request Successful (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host ""
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor Green
}
catch {
    Write-Host "❌ Request Failed" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $streamReader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Error Response:" -ForegroundColor Red
        Write-Host $errorBody -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
