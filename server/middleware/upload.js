import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadsRoot = path.resolve(fileURLToPath(new URL('../uploads', import.meta.url)));
export const listingUploadsDir = path.join(uploadsRoot, 'listings');

fs.mkdirSync(listingUploadsDir, { recursive: true });

const allowedMimeTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, listingUploadsDir);
  },
  filename(_req, file, cb) {
    const extension = allowedMimeTypes.get(file.mimetype) || '';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

function imageFileFilter(_req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(
      new ApiError(422, 'Only JPG, PNG, and WebP images are allowed.', {
        code: 'INVALID_IMAGE_TYPE',
      })
    );
  }
  return cb(null, true);
}

export const uploadListingImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: env.maxImageSizeMb * 1024 * 1024,
    files: env.maxImagesPerListing,
  },
}).array('images', env.maxImagesPerListing);

export function uploadedImageUrls(files = []) {
  return files.map((file) => `/uploads/listings/${file.filename}`);
}

export function removeUploadedFiles(files = []) {
  for (const file of files) {
    if (!file?.path) continue;
    fs.promises.unlink(file.path).catch(() => {});
  }
}

export function deleteStoredImage(imageUrl) {
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) return;
  const relative = imageUrl.replace('/uploads/', '').replaceAll('/', path.sep);
  const target = path.resolve(uploadsRoot, relative);
  const rootWithSeparator = uploadsRoot.endsWith(path.sep) ? uploadsRoot : `${uploadsRoot}${path.sep}`;
  if (!target.startsWith(rootWithSeparator)) return;
  fs.promises.unlink(target).catch(() => {});
}

export function deleteStoredImages(imageUrls = []) {
  imageUrls.forEach(deleteStoredImage);
}
