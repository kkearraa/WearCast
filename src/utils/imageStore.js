import { File, Directory, Paths } from 'expo-file-system';

// Clothing photos are copied into the app's permanent documents folder.
// The database stores only a RELATIVE path like "clothes/abc123.jpg" (not the full
// address), because the full address of the app's folder can change between app updates.
const FOLDER = 'clothes';

const isFullUri = (path) => /^(file|content|https?):/i.test(path);

const getFolder = () => {
  const dir = new Directory(Paths.document, FOLDER);
  if (!dir.exists) dir.create();
  return dir;
};

// Copies a picked/taken photo (temporary cache file) into permanent storage.
// Returns the relative path to save in the database.
export async function saveImageFile(sourceUri) {
  const rawExt = (sourceUri.split('?')[0].split('.').pop() || '').toLowerCase();
  const ext = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : 'jpg';
  const name = `${Date.now()}${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const destination = new File(getFolder(), name);
  await new File(sourceUri).copy(destination);
  return `${FOLDER}/${name}`;
}

// relative path -> full URI that <Image> can display
export function resolveImageUri(path) {
  if (!path) return null;
  if (isFullUri(path)) return path;
  try {
    return new File(Paths.document, ...path.split('/')).uri;
  } catch (e) {
    return null;
  }
}

// Removes a stored photo (does nothing if it's already gone)
export async function deleteImageFile(path) {
  if (!path || isFullUri(path)) return;
  try {
    const file = new File(Paths.document, ...path.split('/'));
    if (file.exists) await file.delete();
  } catch (e) {
    console.warn('Could not delete image', e);
  }
}
