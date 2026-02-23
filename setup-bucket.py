#!/usr/bin/env python3
"""
S3 Bucket configuration script for MinIO using boto3.
Ensures the medicine-store bucket has proper permissions and CORS for image uploads.
"""

import sys
import json
from base64 import b64encode

try:
    import boto3
    import requests
except ImportError:
    print("\n❌ Missing dependencies!")
    print("   Install with: pip install boto3 requests\n")
    sys.exit(1)


def setup_s3_bucket():
    """Configure S3 bucket with CORS and public read policy"""
    
    # Configuration
    endpoint = "http://localhost:9000"
    bucket_name = "medicine-store"
    access_key = "admin"
    secret_key = "password"
    
    print(f"\n🔧 Setting up S3 bucket: {bucket_name}")
    print(f"📍 Endpoint: {endpoint}")
    print(f"🔐 Credentials: {access_key}/{secret_key}\n")
    
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name='us-east-1',
        )
        
        # Check if bucket exists, create if not
        print("✓ Checking bucket existence...")
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            print(f"✓ Bucket '{bucket_name}' exists\n")
        except s3_client.exceptions.NoSuchBucket:
            print(f"ℹ Bucket not found, creating...")
            s3_client.create_bucket(Bucket=bucket_name)
            print(f"✓ Bucket '{bucket_name}' created\n")
        
        # Set CORS policy
        print("✓ Applying CORS policy...")
        cors_policy = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    'AllowedOrigins': ['*'],
                    'ExposeHeaders': ['ETag', 'x-amz-version-id'],
                    'MaxAgeSeconds': 3000,
                }
            ]
        }
        s3_client.put_bucket_cors(Bucket=bucket_name, CORSConfiguration=cors_policy)
        print("✓ CORS policy applied\n")
        
        # Set bucket policy (PUBLIC READ)
        print("✓ Applying public read policy...")
        policy = {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Sid': 'PublicReadGetObject',
                    'Effect': 'Allow',
                    'Principal': '*',
                    'Action': ['s3:GetObject'],
                    'Resource': [f'arn:aws:s3:::{bucket_name}/*'],
                }
            ]
        }
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(policy)
        )
        print("✓ Public read policy applied\n")
        
        print("✅ S3 bucket setup complete!\n")
        print("You can now:")
        print("  1. Upload images using the test component")
        print("  2. Access images directly at: http://localhost:9000/medicine-store/products/{key}\n")
        
    except Exception as error:
        print(f"\n❌ Error setting up S3 bucket:")
        print(f"   {error}\n")
        print("⚠️  Troubleshooting:")
        print("   1. Ensure MinIO/rustfs is running on http://localhost:9000")
        print("   2. Check that credentials (admin/password) are correct")
        print("   3. Verify the S3 endpoint is accessible\n")
        sys.exit(1)


if __name__ == '__main__':
    setup_s3_bucket()
