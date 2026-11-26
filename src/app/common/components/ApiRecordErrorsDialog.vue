<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { PERMISSIONS, type PermissionRequirement } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
import type { ApiRecordError } from "@/app/common/apiErrors";

type RecordRoute = {
  name: string;
  permission: PermissionRequirement;
};

type RecordTypeConfig = {
  labelKey: string;
  icon: string;
  routes: RecordRoute[];
};

type AffectedRecord = {
  key: string;
  recordType: string;
  recordId: string;
  recordName: string;
  messages: string[];
};

const RECORD_TYPES: Record<string, RecordTypeConfig> = {
  CONTRACT: {
    labelKey: "t-record-type-contracts",
    icon: "ph-buildings",
    routes: [
      { name: "EditInstitution", permission: PERMISSIONS.CONTRACTS.UPDATE },
      { name: "ViewInstitution", permission: PERMISSIONS.CONTRACTS.VIEW },
    ],
  },
  EMPLOYEE: {
    labelKey: "t-record-type-employees",
    icon: "ph-user",
    routes: [
      { name: "EditEmployee", permission: PERMISSIONS.EMPLOYEE.UPDATE },
      { name: "ViewEmployee", permission: PERMISSIONS.EMPLOYEE.VIEW },
    ],
  },
  DEPARTMENT: {
    labelKey: "t-record-type-departments",
    icon: "ph-tree-structure",
    routes: [
      { name: "EditDepartment", permission: PERMISSIONS.CONTRACTS.DEPARTMENTS_MANAGE },
      {
        name: "EditDepartment",
        permission: PERMISSIONS.CONTRACT_DEPARTMENTS.UPDATE_PAYMENT_ORDER_DATA,
      },
    ],
  },
  SERVICE_PROVIDER: {
    labelKey: "t-record-type-service-providers",
    icon: "ph-first-aid-kit",
    routes: [
      { name: "EditServiceProvider", permission: PERMISSIONS.SERVICE_PROVIDERS.UPDATE },
      { name: "ViewServiceProvider", permission: PERMISSIONS.SERVICE_PROVIDERS.VIEW },
    ],
  },
  ENTITY: {
    labelKey: "t-record-type-entities",
    icon: "ph-briefcase",
    routes: [
      { name: "EditEntity", permission: PERMISSIONS.ENTITIES.UPDATE },
      { name: "ViewEntity", permission: PERMISSIONS.ENTITIES.VIEW },
    ],
  },
  INVOICE: {
    labelKey: "t-record-type-invoices",
    icon: "ph-receipt",
    routes: [
      { name: "EditInvoice", permission: PERMISSIONS.INVOICES.UPDATE },
      { name: "ViewInvoice", permission: PERMISSIONS.INVOICES.VIEW },
    ],
  },
};

const OTHER_RECORD_TYPE: RecordTypeConfig = {
  labelKey: "t-record-type-others",
  icon: "ph-file-text",
  routes: [],
};

const SEARCH_THRESHOLD = 5;

const props = withDefaults(defineProps<{
  modelValue: boolean;
  records: ApiRecordError[];
  message?: string;
  title?: string;
}>(), {
  message: "",
  title: "",
});

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const router = useRouter();
const { canAny } = usePermissions();
const search = ref("");

const dialogValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

watch(() => props.modelValue, (open) => {
  if (open) search.value = "";
});

const typeConfig = (recordType: string) => RECORD_TYPES[recordType.toUpperCase()] ?? OTHER_RECORD_TYPE;

const affectedRecords = computed(() => {
  const byRecord = new Map<string, AffectedRecord>();

  props.records.forEach(item => {
    const key = `${item.recordType}:${item.recordId}`;
    const record = byRecord.get(key) ?? {
      key,
      recordType: item.recordType,
      recordId: item.recordId,
      recordName: item.recordName || "",
      messages: [],
    };
    if (!record.messages.includes(item.message)) record.messages.push(item.message);
    byRecord.set(key, record);
  });

  return [...byRecord.values()];
});

const showSearch = computed(() => affectedRecords.value.length > SEARCH_THRESHOLD);

const groups = computed(() => {
  const term = (search.value ?? "").trim().toLowerCase();
  const byType = new Map<string, AffectedRecord[]>();

  affectedRecords.value
    .filter(record => !term || [record.recordName, record.recordId, ...record.messages]
      .some(value => value.toLowerCase().includes(term)))
    .forEach(record => {
      const type = RECORD_TYPES[record.recordType.toUpperCase()] ? record.recordType.toUpperCase() : "OTHER";
      byType.set(type, [...(byType.get(type) ?? []), record]);
    });

  return [...byType.entries()].map(([type, items]) => ({
    type,
    config: RECORD_TYPES[type] ?? OTHER_RECORD_TYPE,
    items,
  }));
});

const recordRoute = (record: AffectedRecord) =>
  typeConfig(record.recordType).routes.find(route => canAny(route.permission));

const openRecord = (record: AffectedRecord) => {
  const route = recordRoute(record);
  if (!route) return;
  const { href } = router.resolve({ name: route.name, params: { id: record.recordId } });
  window.open(href, "_blank", "noopener");
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="720" scrollable>
    <Card :title="title || $t('t-record-errors-title')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <div class="record-errors__summary">
          <v-avatar size="40" color="warning" variant="tonal">
            <i class="ph-warning" style="font-size: 20px" />
          </v-avatar>
          <div style="min-width: 0">
            <div class="font-weight-bold">{{ message || $t("t-record-errors-default-message") }}</div>
            <div class="text-caption text-medium-emphasis">{{ $t("t-record-errors-hint") }}</div>
          </div>
        </div>

        <v-text-field
          v-if="showSearch"
          v-model="search"
          :placeholder="$t('t-record-errors-search')"
          prepend-inner-icon="ph-magnifying-glass"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="mt-4"
        />

        <div v-for="group in groups" :key="group.type" class="record-errors__group">
          <div class="record-errors__group-header">
            <i :class="group.config.icon" />
            <span>{{ $t(group.config.labelKey) }}</span>
            <v-chip size="x-small" variant="tonal" color="warning">{{ group.items.length }}</v-chip>
          </div>

          <div v-for="record in group.items" :key="record.key" class="record-errors__item">
            <div class="record-errors__record">
              <div class="font-weight-medium text-truncate" :title="record.recordName">
                {{ record.recordName || "-" }}
              </div>
              <ul class="record-errors__messages">
                <li v-for="message in record.messages" :key="message">
                  <i class="ph-arrow-right" />
                  <span>{{ message }}</span>
                </li>
              </ul>
            </div>

            <v-btn
              v-if="recordRoute(record)"
              color="primary"
              variant="tonal"
              size="small"
              class="flex-shrink-0"
              :title="$t('t-record-open-new-tab')"
              @click="openRecord(record)"
            >
              <i class="ph-arrow-square-out me-1" /> {{ $t("t-record-open") }}
            </v-btn>
          </div>
        </div>

        <div v-if="!groups.length" class="text-center py-8 text-medium-emphasis">
          <i class="ph-funnel-simple me-1" /> {{ $t("t-record-errors-no-results") }}
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>

<style scoped>
.record-errors__summary {
  align-items: center;
  background: #fff8eb;
  border: 1px solid #fde7c2;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  padding: 12px 14px;
}

.record-errors__group {
  margin-top: 16px;
}

.record-errors__group-header {
  align-items: center;
  color: #334155;
  display: flex;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 8px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.record-errors__group-header i {
  font-size: 16px;
}

.record-errors__item {
  align-items: flex-start;
  border: 1px solid #e8edf3;
  border-radius: 10px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 14px;
}

.record-errors__item + .record-errors__item {
  margin-top: 8px;
}

.record-errors__record {
  flex: 1 1 auto;
  min-width: 0;
}

.record-errors__messages {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

.record-errors__messages li {
  align-items: baseline;
  color: #b45309;
  display: flex;
  font-size: 0.8rem;
  gap: 6px;
}

.record-errors__messages li + li {
  margin-top: 2px;
}
</style>
