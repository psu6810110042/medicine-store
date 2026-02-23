#!/usr/bin/env node

const { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

async function setupS3Bucket() {
  const bucketName = 'medicine-store';
  const endpoint = 'http://localhost:9000';
  const region = 'us-east-1';
  const accessKeyId = 'admin';
  const secretAccessKey = 'password';

  console.log(`\n🔧 Setting up S3 bucket: ${bucketName}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🔐 Credentials: ${accessKeyId}/${secretAccessKey}\n`);

  const s3Client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  try {
    // Check if bucket exists
    console.log('✓ Checking bucket existence...');
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`✓ Bucket "${bucketName}" exists\n`);
    } catch (error) {
      console.log(`ℹ Bucket not found, creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`✓ Bucket "${bucketName}" created\n`);
    }

    // Set CORS policy
    console.log('✓ Applying CORS policy...');
    const corsPolicy = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag', 'x-amz-version-id'],
          MaxAgeSeconds: 3000,
        },
      ],
    };
    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: corsPolicy,
      })
    );
    console.log(`✓ CORS policy applied\n`);

    // Set bucket policy (PUBLIC READ)
    console.log('✓ Applying public read policy...');
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
    console.log(`✓ Public read policy applied\n`);

    console.log('✅ S3 bucket setup complete!\n');
    console.log('You can now:');
    console.log('1. Upload images using the test component');
    console.log('2. Open the returned URLs in your browser\n');
  } catch (error) {
    console.error('\n❌ Error setting up S3 bucket:');
    console.error(`   ${error.message}`);
    console.error('\n⚠️  Troubleshooting:');
    console.error('   1. Ensure MinIO/rustfs is running on http://localhost:9000');
    console.error('   2. Check that credentials (admin/password) are correct');
    console.error('   3. Verify the S3 endpoint is accessible\n');
    process.exit(1);
  }
}

setupS3Bucket();
