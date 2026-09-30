const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

// Splits picked files into ones that pass all checks and error messages for
// the ones that don't, so the caller can accept the former and surface the latter.
export function validateImageFiles(files: File[]): { valid: File[]; errors: string[] } {
  const valid: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      errors.push(`"${file.name}" is not an image.`);
    } else if (file.size > MAX_IMAGE_SIZE_BYTES) {
      errors.push(`"${file.name}" is larger than 2MB.`);
    } else {
      valid.push(file);
    }
  }

  return { valid, errors };
}
