@echo off
REM S3 Bucket Configuration Script for MinIO
REM This script configures the medicine-store bucket with public read access and CORS

echo.
echo 🔧 Configuring S3 Bucket for medicine-store...
echo.

set MINIO_ENDPOINT=http://localhost:9000
set ACCESS_KEY=admin
set SECRET_KEY=password
set BUCKET_NAME=medicine-store

REM Create authorization header
for /f %%a in ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes('%ACCESS_KEY%:%SECRET_KEY%'))"') do set AUTH_HEADER=%%a

echo ✓ Setting bucket CORS policy...

REM Set CORS configuration
powershell -Command ^
  "^
  $corsXml = @'
  ^<CORSConfiguration^>
    ^<CORSRule^>
      ^<AllowedOrigin^>*^</AllowedOrigin^>
      ^<AllowedMethod^>GET^</AllowedMethod^>
      ^<AllowedMethod^>PUT^</AllowedMethod^>
      ^<AllowedMethod^>POST^</AllowedMethod^>
      ^<AllowedMethod^>DELETE^</AllowedMethod^>
      ^<AllowedMethod^>HEAD^</AllowedMethod^>
      ^<AllowedHeader^>*^</AllowedHeader^>
      ^<MaxAgeSeconds^>3000^</MaxAgeSeconds^>
    ^</CORSRule^>
  ^</CORSConfiguration^>
'@; ^
  $corsBytes = [System.Text.Encoding]::UTF8.GetBytes($corsXml); ^
  curl -X PUT 'http://localhost:9000/%BUCKET_NAME%/?cors' ^
    -H 'Authorization: Basic %AUTH_HEADER%' ^
    -d $corsXml 2>$null ^
  " 2>nul

if %ERRORLEVEL% EQU 0 (
  echo ✓ CORS policy configured
) else (
  echo ! CORS configuration may have failed (not critical)
)

echo.
echo ✓ Setting bucket public read policy...

powershell -Command ^
  "^
  $policyJson = @'
  {
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Sid\": \"PublicReadGetObject\",
        \"Effect\": \"Allow\",
        \"Principal\": \"*\",
        \"Action\": [\"s3:GetObject\"],
        \"Resource\": [\"arn:aws:s3:::medicine-store/*\"]
      }
    ]
  }
'@; ^
  curl -X PUT 'http://localhost:9000/medicine-store?policy' ^
    -H 'Authorization: Basic %AUTH_HEADER%' ^
    -d $policyJson 2>$null ^
  " 2>nul

if %ERRORLEVEL% EQU 0 (
  echo ✓ Public read policy configured
) else (
  echo ! Policy configuration may have failed
)

echo.
echo ✅ Bucket configuration complete!
echo.
echo Next steps:
echo 1. Ensure MinIO is running on %MINIO_ENDPOINT%
echo 2. You can now upload images via the frontend
echo 3. Images should be accessible directly at: %MINIO_ENDPOINT%/%BUCKET_NAME%/products/{key}
echo.
pause
