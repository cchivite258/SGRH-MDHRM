<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { HospitalProcedureListingType } from "@/components/institution/types";
import { limitTypeDefinitionOptions } from "@/components/institution/create/utils";

type ProcedureGroup = {
  group: string;
  procedures: HospitalProcedureListingType[];
  categories: {
    category: string;
    procedures: HospitalProcedureListingType[];
  }[];
};

const props = defineProps<{
  items: HospitalProcedureListingType[];
  selectedProcedures: HospitalProcedureListingType[];
  colspan: number;
  groupOptions?: { id?: string | number; name?: string }[];
}>();

const emit = defineEmits<{
  toggleSelection: [item: HospitalProcedureListingType];
}>();

const { t } = useI18n();

const getLimitTypeLabel = (value: string | undefined) => {
  const option = limitTypeDefinitionOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const firstDefined = (...values: Array<string | number | null | undefined>) =>
  values.find(value => value !== null && value !== undefined && value !== "");

const getHospitalProcedureGroupName = (item: HospitalProcedureListingType) => {
  if (!item.belongsToGroup) return "Sem grupo";

  const group = item.hospitalProcedureGroup as string | number | { name?: string; id?: string | number } | null | undefined;
  if (!group) return "Grupo sem nome";

  if (typeof group === "object" && group.name) return group.name;
  if (typeof group === "string" && Number.isNaN(Number(group))) return group;

  const groupId = typeof group === "object" ? group.id : group;
  const matchingGroup = props.groupOptions?.find(option => String(option.id) === String(groupId));

  return matchingGroup?.name || (groupId != null ? String(groupId) : "Grupo sem nome");
};

const getProcedureCategoryName = (item: HospitalProcedureListingType) =>
  item.hospitalProcedureType?.categoryName || t("t-procedures");

const compareText = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: "base", numeric: true });

const getProcedureCode = (item: HospitalProcedureListingType) =>
  item.hospitalProcedureType?.code || item.hospitalProcedureType?.name || "";

const hasDisplayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return false;
  const numericValue = Number(String(value).replace(",", "."));
  return Number.isNaN(numericValue) ? true : numericValue !== 0;
};

const hasProcedureValues = (item: HospitalProcedureListingType) =>
  item.belongsToGroup
    ? [item.groupFixedAmount, item.groupPercentage, item.allowedFrequencyUse, item.frequencyInterval].some(hasDisplayValue)
    : [item.fixedAmount, item.percentage, item.allowedFrequencyUse, item.frequencyInterval].some(hasDisplayValue);

const getCategoryKey = (item: HospitalProcedureListingType) =>
  `${getHospitalProcedureGroupName(item)}::${getProcedureCategoryName(item)}`;

const orderedItems = computed(() => {
  const categoryValueMap = props.items.reduce((map, item) => {
    const categoryKey = getCategoryKey(item);
    map.set(categoryKey, (map.get(categoryKey) || false) || hasProcedureValues(item));
    return map;
  }, new Map<string, boolean>());

  return [...props.items].sort((left, right) => {
    const groupComparison = compareText(getHospitalProcedureGroupName(left), getHospitalProcedureGroupName(right));
    if (groupComparison !== 0) return groupComparison;

    const leftHasValues = categoryValueMap.get(getCategoryKey(left)) || false;
    const rightHasValues = categoryValueMap.get(getCategoryKey(right)) || false;
    if (leftHasValues !== rightHasValues) return leftHasValues ? -1 : 1;

    const categoryComparison = compareText(getProcedureCategoryName(left), getProcedureCategoryName(right));
    if (categoryComparison !== 0) return categoryComparison;

    return compareText(getProcedureCode(left), getProcedureCode(right));
  });
});

const groupedProcedures = computed<ProcedureGroup[]>(() => {
  const groupMap: Record<string, HospitalProcedureListingType[]> = orderedItems.value.reduce((groups, procedure) => {
    const group = getHospitalProcedureGroupName(procedure);
    if (!groups[group]) groups[group] = [];

    groups[group].push(procedure);
    return groups;
  }, {} as Record<string, HospitalProcedureListingType[]>);

  return Object.entries(groupMap).sort(([leftGroup], [rightGroup]) => compareText(leftGroup, rightGroup)).map(([group, procedures]: [string, HospitalProcedureListingType[]]) => {
    const categoryMap: Record<string, HospitalProcedureListingType[]> = procedures.reduce((categories, procedure) => {
      const category = getProcedureCategoryName(procedure);
      if (!categories[category]) categories[category] = [];

      categories[category].push(procedure);
      return categories;
    }, {} as Record<string, HospitalProcedureListingType[]>);

    return {
      group,
      procedures,
      categories: Object.entries(categoryMap)
        .sort(([leftCategory, leftProcedures], [rightCategory, rightProcedures]) => {
          const leftHasValues = leftProcedures.some(hasProcedureValues);
          const rightHasValues = rightProcedures.some(hasProcedureValues);
          if (leftHasValues !== rightHasValues) return leftHasValues ? -1 : 1;
          return compareText(leftCategory, rightCategory);
        })
        .map(([category, categoryProcedures]: [string, HospitalProcedureListingType[]]) => ({
          category,
          procedures: [...categoryProcedures].sort((left, right) => compareText(getProcedureCode(left), getProcedureCode(right)))
        }))
    };
  });
});

const isSelected = (item: HospitalProcedureListingType) =>
  props.selectedProcedures.some(selected => selected.id === item.id);

const getDisplayFixedAmount = (item: HospitalProcedureListingType) => {
  const value = item.belongsToGroup ? item.groupFixedAmount : item.fixedAmount;
  return value ?? "-";
};

const getDisplayPercentage = (item: HospitalProcedureListingType) => {
  const value = item.belongsToGroup ? item.groupPercentage : item.percentage;
  return value !== null && value !== undefined ? `${value}%` : "-";
};

const getDisplayLimitType = (item: HospitalProcedureListingType) => {
  const limitType = item.belongsToGroup ? item.hospitalProcedureGroupLimit : item.limitTypeDefinition;
  return getLimitTypeLabel(limitType || "") || "-";
};

const getDisplayUsageFrequency = (item: HospitalProcedureListingType) => {
  const allowedFrequencyUse = firstDefined(item.allowedFrequencyUse);
  const frequencyInterval = firstDefined(item.frequencyInterval);
  if (!allowedFrequencyUse && !frequencyInterval) return "-";
  return `${allowedFrequencyUse || "-"}/${frequencyInterval || "-"}`;
};

const getDisplayWaitingPeriodDays = (item: HospitalProcedureListingType) =>
  firstDefined(item.waitingPeriodDays) ?? "-";

const groupUsesGroupLimit = (procedures: HospitalProcedureListingType[]) =>
  procedures.some(procedure => procedure.belongsToGroup);

const getGroupLimitProcedure = (procedures: HospitalProcedureListingType[]) =>
  procedures.find(procedure => procedure.belongsToGroup) || procedures[0];

const getGroupLimitType = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getDisplayLimitType(procedure) : "-";
};

const getGroupFixedAmount = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getDisplayFixedAmount(procedure) : "-";
};

const getGroupPercentage = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getDisplayPercentage(procedure) : "-";
};

const getGroupUsageFrequency = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getDisplayUsageFrequency(procedure) : "-";
};

const getGroupWaitingPeriodDays = (procedures: HospitalProcedureListingType[]) => {
  const procedure = getGroupLimitProcedure(procedures);
  return procedure ? getDisplayWaitingPeriodDays(procedure) : "-";
};
</script>

<template>
  <template v-for="group in groupedProcedures" :key="group.group">
    <tr class="procedure-group-row">
      <td :colspan="colspan">
        <div class="d-flex align-center justify-space-between">
          <span>
            <i class="ph-stack me-2" />
            {{ group.group }}
          </span>
          <v-chip color="secondary" variant="flat" size="x-small">
            {{ group.procedures.length }}
          </v-chip>
        </div>
      </td>
    </tr>

    <tr v-if="groupUsesGroupLimit(group.procedures)" class="procedure-group-limit-row">
      <td colspan="2">Limite do grupo</td>
      <td>{{ getGroupLimitType(group.procedures) }}</td>
      <td>{{ getGroupFixedAmount(group.procedures) }}</td>
      <td>{{ getGroupPercentage(group.procedures) }}</td>
      <td>{{ getGroupUsageFrequency(group.procedures) }}</td>
      <td>{{ getGroupWaitingPeriodDays(group.procedures) }}</td>
      <td></td>
    </tr>

    <template
      v-for="category in group.categories"
      :key="`${group.group}-${category.category}`"
    >
      <tr class="procedure-category-row">
        <td :colspan="colspan">
          <div class="d-flex align-center justify-space-between">
            <span>
              <i class="ph-folder-open me-2" />
              {{ category.category }}
            </span>
            <span class="text-caption">
              {{ category.procedures.length }} {{ $t('t-procedures').toLowerCase() }}
            </span>
          </div>
        </td>
      </tr>

      <tr
        v-for="item in category.procedures"
        :key="item.id"
        class="procedure-row"
        height="50"
      >
        <td>
          <v-checkbox
            :model-value="isSelected(item)"
            @update:model-value="emit('toggleSelection', item)"
            hide-details
            density="compact"
          />
        </td>
        <td class="procedure-type-cell">
          {{ item.hospitalProcedureType?.code ? `${item.hospitalProcedureType.code} - ` : "" }}{{ item.hospitalProcedureType?.name || "-" }}
        </td>
        <template v-if="item.belongsToGroup">
          <td class="text-muted">-</td>
          <td class="text-muted">-</td>
          <td class="text-muted">-</td>
          <td class="text-muted">-</td>
          <td class="text-muted">-</td>
        </template>
        <template v-else>
          <td>{{ getDisplayLimitType(item) }}</td>
          <td>{{ getDisplayFixedAmount(item) }}</td>
          <td>{{ getDisplayPercentage(item) }}</td>
          <td>{{ getDisplayUsageFrequency(item) }}</td>
          <td>{{ getDisplayWaitingPeriodDays(item) }}</td>
        </template>
        <td>
          <slot name="action" :item="item" />
        </td>
      </tr>
    </template>
  </template>
</template>

<style scoped>
.procedure-group-row td {
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.4;
  padding: 12px 14px;
  vertical-align: middle;
}

.procedure-category-row td {
  background: rgba(var(--v-theme-on-surface), 0.032);
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-weight: 700;
  line-height: 1.4;
  padding: 11px 14px;
  vertical-align: middle;
}

.procedure-group-limit-row td {
  background: rgba(var(--v-theme-primary), 0.035);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.12);
  color: rgba(var(--v-theme-on-surface), 0.84);
  font-weight: 700;
  padding: 9px 14px;
  vertical-align: middle;
}

.procedure-group-limit-row td:first-child {
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
}

.procedure-row td {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  vertical-align: middle;
  white-space: normal;
  word-break: break-word;
}

.procedure-row:hover td {
  background: rgba(var(--v-theme-primary), 0.045);
}

.procedure-type-cell {
  width: 32%;
  white-space: normal;
  overflow-wrap: break-word;
}
</style>
