/* eslint-disable no-console */
import "../env";
import axios, { AxiosInstance } from "axios";
import { chunk } from "lodash";
import { Record, FieldSet, Attachment } from "airtable";
import {
  createCloudinaryClient,
  uploadCloudinaryImage,
  CloudinaryUploadResponse,
} from "../lib/cloudinary";
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "../lib/constants";
import { pause } from "../lib/skylark/saas/utils";
import { getTable } from "../lib/airtable";

interface ImageRecord extends Record<FieldSet> {
  fields: {
    cloudinary_url?: string;
    title?: string;
  };
}

const getImageAirtableUrl = (record: Record<FieldSet>) => {
  if (!record?.fields?.image) {
    return null;
  }

  const attachments = record.fields.image as Attachment[];

  if (!attachments.length || !attachments?.[0].url) {
    return null;
  }

  return attachments?.[0].url;
};

/**
 * Updates an Airtable record with new cloudinary URL
 */
const updateAirtableRecord = async (
  recordId: string,
  cloudinaryUrl: string,
): Promise<void> => {
  try {
    await axios.patch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/images/${recordId}`,
      {
        fields: {
          cloudinary_url: cloudinaryUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`✓ Updated record ${recordId} with Cloudinary URL`);
  } catch (error) {
    console.error(`✗ Failed to update record ${recordId}:`, error);
    throw error;
  }
};

/**
 * Processes a single image: uploads to Cloudinary and updates Airtable
 */
const processImage = async (
  cloudinaryClient: AxiosInstance,
  cloudinaryPreset: string,
  imageRecord: ImageRecord,
): Promise<void> => {
  const { id, fields } = imageRecord;
  const { cloudinary_url: cloudinaryUrl, title } = fields;
  const url = getImageAirtableUrl(imageRecord);

  // Skip if already has cloudinary URL
  if (cloudinaryUrl) {
    console.log(`⏭ Skipping ${title || id} - already has Cloudinary URL`);
    return;
  }

  // Skip if no URL to upload
  if (!url) {
    console.log(`⏭ Skipping ${title || id} - no URL to upload`);
    return;
  }

  try {
    console.log(`📤 Uploading ${title || id} to Cloudinary...`);

    // Upload to Cloudinary
    const cloudinaryResponse: CloudinaryUploadResponse =
      await uploadCloudinaryImage(cloudinaryClient, cloudinaryPreset, url);

    console.log(`✓ Uploaded to Cloudinary: ${cloudinaryResponse.secure_url}`);

    // Update Airtable with new URL
    await updateAirtableRecord(id, cloudinaryResponse.secure_url);

    console.log(`✅ Successfully processed ${title || id}\n`);
  } catch (error) {
    console.error(`❌ Failed to process ${title || id}:`, error);
    throw error;
  }
};

/**
 * Main function that orchestrates the entire process
 */
const main = async (): Promise<void> => {
  console.log("🚀 Starting Airtable Images to Cloudinary migration...\n");

  // Validate environment variables
  const requiredEnvVars = [
    "CLIENT_CLOUDINARY_ENV",
    "CLIENT_CLOUDINARY_PRESET",
    "AIRTABLE_API_KEY",
    "AIRTABLE_BASE_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );
  if (missingVars.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missingVars.join(", ")}`,
    );
    process.exit(1);
  }

  try {
    // Fetch all tables from Airtable
    console.log("📊 Fetching images from Airtable...");
    const images = await getTable("images");
    console.log(images[0].fields.image);

    console.log(`Found ${images.length} image records\n`);

    if (images.length === 0) {
      console.log("ℹ No images found to process");
      return;
    }

    // Filter images that need processing (have URL but no cloudinary_url)
    const imagesToProcess = images.filter(
      (img) => getImageAirtableUrl(img) && !img.fields.cloudinary_url,
    );

    console.log(`📋 ${imagesToProcess.length} images need Cloudinary upload`);
    console.log(
      `⏭ ${images.length - imagesToProcess.length} images already processed\n`,
    );

    if (imagesToProcess.length === 0) {
      console.log("✨ All images already have Cloudinary URLs!");
      return;
    }

    // Create Cloudinary client
    const cloudinaryClient = createCloudinaryClient(
      process.env.CLIENT_CLOUDINARY_ENV as string,
    );

    const cloudinaryPreset = process.env.CLIENT_CLOUDINARY_PRESET as string;

    // Process images in chunks to avoid rate limits
    const chunkedImages = chunk(imagesToProcess, 5); // Process 5 at a time
    let processedCount = 0;

    console.log(
      `🔄 Processing ${imagesToProcess.length} images in ${chunkedImages.length} batches...\n`,
    );

    for (let i = 0; i < chunkedImages.length; i += 1) {
      const batch = chunkedImages[i];

      console.log(
        `📦 Processing batch ${i + 1}/${chunkedImages.length} (${batch.length} images)...`,
      );

      // Process batch concurrently
      const promises = batch.map((imageRecord) =>
        processImage(cloudinaryClient, cloudinaryPreset, imageRecord),
      );

      try {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(promises);
        processedCount += batch.length;
        console.log(
          `✅ Batch ${i + 1} completed. Progress: ${processedCount}/${imagesToProcess.length}\n`,
        );
      } catch (error) {
        console.error(`❌ Batch ${i + 1} failed:`, error);
        // Continue with next batch rather than failing completely
        console.log("⏭ Continuing with next batch...\n");
      }

      // Rate limiting pause between batches
      if (i < chunkedImages.length - 1) {
        console.log("⏱ Pausing between batches...");
        // eslint-disable-next-line no-await-in-loop
        await pause(2000); // 2 second pause between batches
      }
    }

    console.log(
      `🎉 Migration completed! Processed ${processedCount}/${imagesToProcess.length} images`,
    );
  } catch (error) {
    console.error("💥 Fatal error during migration:", error);
    process.exit(1);
  }
};

// Run the script
main().catch((error) => {
  console.error("💥 Unhandled error:", error);
  process.exit(1);
});

/* eslint-enable no-console */
