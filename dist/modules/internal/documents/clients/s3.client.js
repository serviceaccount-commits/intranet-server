"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
require("dotenv/config"); // Make sure environment variables are loaded
// import appConfig from '../../../../shared/config/appConfig';
const region = 'us-east-2';
const bucketName = 'paricus-api-intranet-uploads-2025';
exports.bucketName = bucketName;
if (!region || !bucketName) {
    throw new Error('AWS_REGION and S3_BUCKET_NAME must be set in environment variables');
}
// The SDK will automatically use the IAM Role from the EC2 instance.
const s3Client = new client_s3_1.S3Client({ region });
exports.s3Client = s3Client;
//# sourceMappingURL=s3.client.js.map