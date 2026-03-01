import {
  createDataRecord,
  deleteDataRecord,
  listDataRecords,
  updateDataRecord,
} from "../../data/repositories/dataRepository";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export async function getManagedDataRecords() {
  try {
    return await listDataRecords();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createManagedDataRecord({ key, value }) {
  await sleep(350);

  if (!key || !value) {
    return { success: false, message: "Campo obligatorio" };
  }

  try {
    const created = await createDataRecord({
      key: key.trim(),
      value: value.trim(),
    });

    return {
      success: true,
      message: "Dato registrado correctamente.",
      record: created,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible registrar el dato."),
    };
  }
}

export async function updateManagedDataRecord({ id, key, value }) {
  await sleep(350);

  if (!key || !value) {
    return { success: false, message: "Campo obligatorio" };
  }

  try {
    const updated = await updateDataRecord({
      id,
      key: key.trim(),
      value: value.trim(),
    });

    if (!updated) {
      return { success: false, message: "No fue posible actualizar el dato." };
    }

    return {
      success: true,
      message: "Dato actualizado correctamente.",
      record: updated,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible actualizar el dato."),
    };
  }
}

export async function removeManagedDataRecord(id) {
  await sleep(250);

  try {
    const removed = await deleteDataRecord(id);

    if (!removed) {
      return { success: false, message: "No fue posible eliminar el dato." };
    }

    return { success: true, message: "Dato eliminado correctamente." };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "No fue posible eliminar el dato."),
    };
  }
}
