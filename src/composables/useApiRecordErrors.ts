import { ref } from "vue";
import { getApiRecordErrors, getFirstApiErrorMessage, type ApiRecordError } from "@/app/common/apiErrors";

// Abre o diálogo de registos afectados quando a API devolve inconsistências por registo.
export const useApiRecordErrors = () => {
  const recordErrorsDialog = ref(false);
  const recordErrors = ref<ApiRecordError[]>([]);
  const recordErrorsMessage = ref("");

  const showRecordErrors = (error: unknown): boolean => {
    const records = getApiRecordErrors(error);
    if (!records.length) return false;

    recordErrors.value = records;
    recordErrorsMessage.value = getFirstApiErrorMessage(error) ?? "";
    recordErrorsDialog.value = true;
    return true;
  };

  return {
    recordErrorsDialog,
    recordErrors,
    recordErrorsMessage,
    showRecordErrors,
  };
};
