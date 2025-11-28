import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user's ID for organizing files
 * @param folder - Optional subfolder name (e.g., 'backgrounds', 'logos')
 * @returns The public URL of the uploaded image
 */
export const uploadImageToStorage = async (
  file: File,
  userId: string,
  folder: string = 'general'
): Promise<string> => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La taille du fichier dépasse 5MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${timestamp}-${randomString}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('campaign-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Erreur d'upload: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/campaign-images\/(.+)$/);
    
    if (!pathMatch) {
      throw new Error('Invalid image URL');
    }

    const filePath = pathMatch[1];

    const { error } = await supabase.storage
      .from('campaign-images')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Image delete error:', error);
    // Don't throw - deletion failure shouldn't block operations
  }
};

/**
 * Convert base64 image to File object
 * @param base64String - The base64 encoded image
 * @param fileName - Name for the file
 * @returns File object
 */
export const base64ToFile = (base64String: string, fileName: string = 'image.jpg'): File => {
  // Extract data and mime type
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Convert base64 to binary
  const byteString = atob(base64Data);
  const byteArray = new Uint8Array(byteString.length);
  
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  // Create blob and file
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
};

/**
 * Migrate base64 image to Supabase Storage
 * @param base64Image - The base64 encoded image
 * @param userId - The user's ID
 * @param folder - Optional subfolder
 * @returns The public URL of the uploaded image, or the original base64 if migration fails
 */
export const migrateBase64ToStorage = async (
  base64Image: string,
  userId: string,
  folder: string = 'migrated'
): Promise<string> => {
  try {
    // Check if it's actually a base64 image
    if (!base64Image.startsWith('data:image/')) {
      return base64Image; // Already a URL
    }

    const file = base64ToFile(base64Image, 'migrated-image.jpg');
    const publicUrl = await uploadImageToStorage(file, userId, folder);
    
    return publicUrl;
  } catch (error) {
    console.error('Base64 migration error:', error);
    // Return original base64 if migration fails
    return base64Image;
  }
};
