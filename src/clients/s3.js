import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';
if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET) {
  throw new Error('AWS credentials are not properly configured');
}
const s3Client = new S3Client({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  }
});

export async function getByGuid(bucket, guid) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: guid,
    });
    
    const response = await s3Client.send(command);
    const str = await response.Body.transformToString();
    return str;
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
}

export async function generateMd5HashFromImage(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

export async function uploadImage(imageBuffer, bucket) {
  try {
    // Generate MD5 hash for the image
    const md5Hash = await generateMd5HashFromImage(imageBuffer);
    const key = `${md5Hash}.png`;

    // Check if image already exists
    try {
      const checkCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(checkCommand);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        // Upload the image if it doesn't exist
        const uploadCommand = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: imageBuffer,
          ContentType: 'image/png',
        });
        
        await s3Client.send(uploadCommand);
      } else {
        throw error;
      }
    }

    // Return the URL of the image
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export async function uploadPdf(pdfBuffer, filename, bucket) {
  try {
    const fileExtension = '.pdf';
    const randomId = crypto.randomBytes(8).toString('hex');
    const key = `${randomId}-${filename}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    });
    
    await s3Client.send(uploadCommand);

    return `https://${bucket}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
} 