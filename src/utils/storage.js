// App-facing data API. Screens import from here and never touch the database directly.
// Every function works on the CURRENT user's closet, so accounts stay separate.
import { getCurrentUserId } from '../db/session';
import {
  getClothesByUser,
  getClothingById,
  addClothing,
  updateClothing,
  deleteClothing,
  clearClothesForUser,
  getClothingStats,
} from '../db/clothes';

// Reads never crash the app: on any error they return an empty result instead.
export const getClothes = async () => {
  try {
    return await getClothesByUser(getCurrentUserId());
  } catch (e) {
    console.error('Error reading clothes', e);
    return [];
  }
};

export const getItemById = async (id) => {
  try {
    return await getClothingById(getCurrentUserId(), id);
  } catch (e) {
    console.error('Error reading item', e);
    return null;
  }
};

export const getStats = async () => {
  try {
    return await getClothingStats(getCurrentUserId());
  } catch (e) {
    console.error('Error reading stats', e);
    return { total: 0, clean: 0, laundry: 0 };
  }
};

// Writes throw on failure so the screen can show an error message.
export const addClothingItem = (item) => addClothing(getCurrentUserId(), item);

export const updateItem = (id, fields) => updateClothing(id, fields);

export const updateItemStatus = (id, status) => updateClothing(id, { status });

export const deleteItemById = (id) => deleteClothing(id);

export const clearClothes = async () => {
  try {
    await clearClothesForUser(getCurrentUserId());
    return true;
  } catch (e) {
    console.error('Error clearing clothes', e);
    return false;
  }
};
