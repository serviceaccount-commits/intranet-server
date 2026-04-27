import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config'; // Make sure environment variables are loaded
// import appConfig from '../../../../shared/config/appConfig';

const region = 'us-east-2';
const bucketName = 'paricus-api-intranet-uploads-2025';

if (!region || !bucketName) {
  throw new Error(
    'AWS_REGION and S3_BUCKET_NAME must be set in environment variables',
  );
}

// The SDK will automatically use the IAM Role from the EC2 instance.
const s3Client = new S3Client({ region });

export { s3Client, bucketName };
