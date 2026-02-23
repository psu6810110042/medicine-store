# Quick Setup Guide

## Prerequisites
Ensure you have running locally:
- **PostgreSQL** on `localhost:5432` (user: admin, password: adminpassword)
- **Redis** on `localhost:6379`
- **MinIO/rustfs** on `localhost:9000` (optional for S3 access)

## Option 1: Using Docker (Recommended)
Run just the services you need:

```bash
# From .devcontainer directory
docker-compose -f .devcontainer/docker-compose.yml up -d db redis rustfs
```

Then rebuild the backend:
```bash
cd backend
npm run build
node dist/main
```

## Option 2: Manual Installation
Install PostgreSQL, Redis, and MinIO locally, then:

```bash
cd backend
npm install
npm run build
node dist/main
```

## Configure S3 Bucket

After starting MinIO, run one of these to configure public access:

### Python (Recommended)
```bash
pip install boto3 requests
python setup-bucket.py
```

### Or use AWS CLI
```bash
aws --endpoint-url http://localhost:9000 s3api put-bucket-policy \
  --bucket medicine-store \
  --policy '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":"*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::medicine-store/*"]
    }]
  }'
```

## Test Upload
1. Go to frontend and navigate to the ImageUpload test component
2. Select an image and upload
3. The returned URL should be accessible in your browser

## Troubleshooting

**"Cannot connect to database"**
- Ensure PostgreSQL is running on localhost:5432
- Update .env file with correct credentials

**"Cannot connect to redis"**
- Ensure Redis is running on localhost:6379

**"AccessDenied on image URL"**
- Run the bucket configuration script above
