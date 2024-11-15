import { SimpleDocumentStore, VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";

export const STORAGE_CACHE_DIR = ".cache";

export async function getDataSource(params?: any) {
  const storageContext = await storageContextFromDefaults({
    persistDir: STORAGE_CACHE_DIR,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    return null;
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}
