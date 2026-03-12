<template>
    <v-card class="mb-4">
        <v-card-text class="pa-4">
            <QuerySearch v-model="globalSearch" :placeholder="$t('t-employee-search')"
                prepend-inner-icon="ph-magnifying-glass" clearable density="compact"
                @update:model-value="onGlobalSearch" class="mb-2" />

            <v-expansion-panels class="expansion-panels expansion-panel mt-5">
                <v-expansion-panel>
                    <v-expansion-panel-title class="text-caption font-weight-medium px-2">
                        <i class="ph-faders-horizontal me-2"></i>
                        {{ $t('t-advanced-filters') }}
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="text-muted pa-2">
                        <v-radio-group v-model="logicalOperator" inline color="primary" class="mb-3 mt-0"
                            density="compact" hide-details>
                            <v-radio :label="t('t-and-operator')" value="AND" class="text-caption mr-2"
                                style="--v-radio-size: 16px;">
                                <template v-slot:label>
                                    <span style="font-size: 0.80rem;">{{ t('t-and-operator') }}</span>
                                </template>
                            </v-radio>
                            <v-radio :label="t('t-or-operator')" value="OR" class="text-caption"
                                style="--v-radio-size: 16px;">
                                <template v-slot:label>
                                    <span style="font-size: 0.80rem;">{{ t('t-or-operator') }}</span>
                                </template>
                            </v-radio>
                        </v-radio-group>

                        <v-row v-for="(filter, index) in advancedFilters" :key="`filter-${index}`" class="mb-1 mx-0"
                            dense>
                            <v-col cols="12" sm="4" class="py-1 px-1">
                                <MenuSelect v-model="filter.prop" :items="filterableFields" :label="$t('t-field')"
                                    item-title="text" item-value="value" density="compact" variant="outlined"
                                    @update:model-value="onFieldChange(index)" />
                            </v-col>

                            <v-col cols="12" sm="3" class="py-1 px-1">
                                <MenuSelect v-model="filter.comparison"
                                    :items="getOperatorsForField(filter.prop)"
                                    :placeholder="$t('t-operator')" item-title="text" item-value="value"
                                    density="compact" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="4" class="py-1 px-1"
                                v-if="isDateField(filter.prop)">
                                <VueDatePicker v-model="filter.value" :teleport="true"
                                    :placeholder="$t('t-enter-date')" :enable-time-picker="false"
                                    format="dd/MM/yyyy" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1"
                                v-else-if="isBooleanField(filter.prop)">
                                <MenuSelect v-model="filter.value" :items="booleanOptions" :placeholder="$t('t-value')"
                                    item-title="text" item-value="value" density="compact" variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1"
                                v-else-if="isEnumField(filter.prop)">
                                <MenuSelect v-model="filter.value"
                                    :items="getEnumOptions(filter.prop)"
                                    :placeholder="$t('t-value')"
                                    item-title="text" item-value="value" density="compact" variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1" v-else>
                                <TextField v-model="filter.value" :placeholder="$t('t-value')" density="compact"
                                    variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="1" class="align-center justify-center py-1 px-1">
                                <v-btn icon variant="text" color="error" size="small" @click="removeFilter(index)">
                                    <i class="ph-trash"></i>
                                </v-btn>
                            </v-col>
                        </v-row>

                        <div class="d-flex mt-3">
                            <v-btn color="primary" variant="tonal" @click="addFilter" class="mr-2" size="small">
                                <i class="ph-plus me-1"></i>
                                {{ $t('t-add-filter') }}
                            </v-btn>

                            <v-btn color="secondary" variant="tonal" @click="applyAdvancedFilters"
                                :disabled="advancedFilters.length === 0 || hasIncompleteFilters" :loading="loading"
                                size="small" :title="hasIncompleteFilters ? 'Preencha todos os campos dos filtros' : ''">
                                <i class="ph-funnel me-1"></i>
                                {{ $t('t-apply-filters') }}
                            </v-btn>

                            <v-btn color="error" variant="tonal" @click="clearAllFilters" class="ml-2" size="small"
                                :loading="loading">
                                <i class="ph-x me-1"></i>
                                Limpar
                            </v-btn>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmployeeStore } from '@/store/employee/employeeStore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import MenuSelect from '@/app/common/components/filters/MenuSelect.vue';
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import { format } from 'date-fns';

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();

const QUERY_KEYS = {
    search: 'search',
    operator: 'operator',
    filters: 'filters'
} as const;

type LogicalOperator = 'AND' | 'OR';
type FilterType = 'text' | 'boolean' | 'date' | 'enum';

interface FilterableField {
    text: string;
    value: string;
    type: FilterType;
    enumType?: 'gender' | 'maritalStatus' | 'bloodGroup';
}

interface AdvancedFilter {
    prop: string;
    comparison: string;
    value: string | boolean | Date;
}

interface StoreAdvancedFilter {
    prop: string;
    operator: string;
    value: string | boolean | Date;
}

const globalSearch = ref('');
const loading = ref(false);
const logicalOperator = ref<LogicalOperator>('AND');
const SEARCH_DEBOUNCE_MS = 400;
let globalSearchDebounce: ReturnType<typeof setTimeout> | null = null;
let routeSyncInProgress = false;

const filterableFields = ref<FilterableField[]>([
    { text: t('t-employee-number'), value: 'employeeNumber', type: 'text' },
    { text: t('t-firstname'), value: 'firstName', type: 'text' },
    { text: t('t-lastname'), value: 'lastName', type: 'text' },
    { text: t('t-gender'), value: 'gender', type: 'enum', enumType: 'gender' },
    { text: t('t-marital-status'), value: 'maritalStatus', type: 'enum', enumType: 'maritalStatus' },
    { text: t('t-birth-date'), value: 'birthDate', type: 'date' },
    { text: t('t-blood-group'), value: 'bloodGroup', type: 'enum', enumType: 'bloodGroup' },
    { text: t('t-place-of-birth'), value: 'placeOfBirth', type: 'text' },
    { text: t('t-nationality'), value: 'nationality', type: 'text' },
    { text: t('t-income-tax-number'), value: 'incomeTaxNumber', type: 'text' },
    { text: t('t-social-security-number'), value: 'socialSecurityNumber', type: 'text' },
    { text: t('t-address'), value: 'address', type: 'text' },
    { text: t('t-email'), value: 'email', type: 'text' },
    { text: t('t-phone'), value: 'phone', type: 'text' },
    { text: t('t-mobile'), value: 'mobile', type: 'text' },
    { text: t('t-emergency-contact-name'), value: 'emergencyContactName', type: 'text' },
    { text: t('t-emergency-contact-phone'), value: 'emergencyContactPhone', type: 'text' },
    { text: t('t-id-card-number'), value: 'idCardNumber', type: 'text' },
    { text: t('t-id-card-issuer'), value: 'idCardIssuer', type: 'text' },
    { text: t('t-province'), value: 'province.name', type: 'text' },
    { text: t('t-country'), value: 'country.name', type: 'text' },
    { text: t('t-company'), value: 'company.name', type: 'text' },
    { text: t('t-department'), value: 'department.name', type: 'text' },
    { text: t('t-position'), value: 'position.name', type: 'text' },
    { text: t('t-dependent'), value: 'dependents.firstName', type: 'text' },
    { text: t('t-enabled'), value: 'enabled', type: 'boolean' },
]);

const textOperators = [
    { text: t('t-contains'), value: 'contains' },
    { text: t('t-equals'), value: 'equals' },
    { text: t('t-starts-with'), value: 'startsWith' },
    { text: t('t-ends-with'), value: 'endsWith' }
];

const booleanOperators = [
    { text: t('t-equals'), value: 'equals' }
];

const dateOperators = [
    { text: t('t-equals'), value: 'equals' },
    { text: t('t-after'), value: 'after' },
    { text: t('t-before'), value: 'before' }
];

const enumOperators = [
    { text: t('t-equals'), value: 'equals' },
    { text: t('t-not-equals'), value: 'notEquals' }
];

const booleanOptions = ref([
    { text: t('t-true'), value: true },
    { text: t('t-false'), value: false }
]);

const enumOptions = {
    gender: [
        { text: t('t-male'), value: 'MALE' },
        { text: t('t-female'), value: 'FEMALE' },
        { text: t('t-other'), value: 'OTHER' }
    ],
    maritalStatus: [
        { text: t('t-single'), value: 'SINGLE' },
        { text: t('t-married'), value: 'MARRIED' },
        { text: t('t-divorced'), value: 'DIVORCED' },
        { text: t('t-widowed'), value: 'WIDOWED' },
        { text: t('t-unknown'), value: 'UNKNOWN' }
    ],
    bloodGroup: [
        { text: 'A+', value: 'A+' },
        { text: 'A-', value: 'A-' },
        { text: 'B+', value: 'B+' },
        { text: 'B-', value: 'B-' },
        { text: 'AB+', value: 'AB+' },
        { text: 'AB-', value: 'AB-' },
        { text: 'O+', value: 'O+' },
        { text: 'O-', value: 'O-' }
    ]
};

const advancedFilters = ref<AdvancedFilter[]>([]);

const normalizeRouteQueryValue = (value: unknown): string => {
    if (Array.isArray(value)) return String(value[0] ?? '');
    return typeof value === 'string' ? value : '';
};

const getFieldDefinition = (field: string): FilterableField | undefined =>
    filterableFields.value.find(f => f.value === field);

const isBooleanField = (field: string) => getFieldDefinition(field)?.type === 'boolean';
const isEnumField = (field: string) => getFieldDefinition(field)?.type === 'enum';
const isDateField = (field: string) => getFieldDefinition(field)?.type === 'date';

const getEnumOptions = (field: string) => {
    const enumType = getFieldDefinition(field)?.enumType;
    if (!enumType) return [];
    return enumOptions[enumType] || [];
};

const getOperatorsForField = (field: string) => {
    const fieldDef = getFieldDefinition(field);
    if (!fieldDef) return textOperators;

    switch (fieldDef.type) {
        case 'boolean':
            return booleanOperators;
        case 'date':
            return dateOperators;
        case 'enum':
            return enumOperators;
        default:
            return textOperators;
    }
};

const parseRouteFilters = (): StoreAdvancedFilter[] => {
    const raw = normalizeRouteQueryValue(route.query[QUERY_KEYS.filters]);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((item) => item && typeof item.prop === 'string' && typeof item.operator === 'string')
            .map((item) => ({
                prop: item.prop,
                operator: item.operator,
                value: item.value as string | boolean | Date
            }));
    } catch {
        return [];
    }
};

const mapStoreFiltersToUi = (filters: StoreAdvancedFilter[]): AdvancedFilter[] => {
    const mapped: AdvancedFilter[] = [];

    for (const filter of filters) {
        const fieldDef = getFieldDefinition(filter.prop);
        if (!fieldDef) continue;

        let parsedValue: string | boolean | Date = filter.value as string | boolean | Date;
        if (fieldDef.type === 'boolean' && typeof parsedValue !== 'boolean') {
            parsedValue = String(parsedValue).toLowerCase() === 'true';
        }
        if (fieldDef.type === 'date' && typeof parsedValue === 'string') {
            const parsedDate = new Date(parsedValue);
            parsedValue = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
        }

        mapped.push({
            prop: fieldDef.value,
            comparison: filter.operator || getOperatorsForField(fieldDef.value)[0]?.value || 'equals',
            value: parsedValue
        });
    }

    return mapped;
};

const onFieldChange = (index: number) => {
    const field = advancedFilters.value[index]?.prop || '';
    const operators = getOperatorsForField(field);
    advancedFilters.value[index].comparison = operators[0]?.value || '';

    if (isBooleanField(field)) {
        advancedFilters.value[index].value = true;
    } else if (isEnumField(field)) {
        const options = getEnumOptions(field);
        advancedFilters.value[index].value = options[0]?.value || '';
    } else if (isDateField(field)) {
        advancedFilters.value[index].value = new Date();
    } else {
        advancedFilters.value[index].value = '';
    }
};

const isFilterValueFilled = (field: string, value: unknown) => {
    if (isBooleanField(field)) return typeof value === 'boolean';
    if (isDateField(field)) return value instanceof Date && !Number.isNaN(value.getTime());
    return value !== undefined && value !== null && String(value).trim() !== '';
};

const isFilterComplete = (filter: AdvancedFilter) => {
    const field = filter.prop;
    return !!field && !!filter.comparison && isFilterValueFilled(field, filter.value);
};

const hasIncompleteFilters = computed(() =>
    advancedFilters.value.some(filter => !isFilterComplete(filter))
);

const buildStoreFiltersFromUi = (): StoreAdvancedFilter[] => {
    return advancedFilters.value
        .filter(isFilterComplete)
        .map((filter) => {
            const prop = filter.prop;
            let value = filter.value;

            if (isDateField(prop) && value instanceof Date) {
                value = format(value, 'yyyy-MM-dd');
            }

            return {
                prop,
                operator: filter.comparison,
                value
            };
        });
};

const syncStateToRoute = async (filtersForStore: StoreAdvancedFilter[]) => {
    const nextQuery = {
        ...route.query,
        [QUERY_KEYS.search]: globalSearch.value || undefined,
        [QUERY_KEYS.operator]: logicalOperator.value || undefined,
        [QUERY_KEYS.filters]: filtersForStore.length ? JSON.stringify(filtersForStore) : undefined
    };

    routeSyncInProgress = true;
    try {
        await router.replace({ query: nextQuery });
    } finally {
        routeSyncInProgress = false;
    }
};

const onGlobalSearch = () => {
    if (globalSearchDebounce) {
        clearTimeout(globalSearchDebounce);
    }

    globalSearchDebounce = setTimeout(async () => {
        const filtersForStore = buildStoreFiltersFromUi();
        employeeStore.setGlobalSearch(globalSearch.value);
        employeeStore.setLogicalOperator(logicalOperator.value);
        employeeStore.setAdvancedFilters(filtersForStore);
        await syncStateToRoute(filtersForStore);
        await employeeStore.fetchEmployees();
    }, SEARCH_DEBOUNCE_MS);
};

const addFilter = () => {
    const defaultField = filterableFields.value[0];
    advancedFilters.value.push({
        prop: defaultField.value,
        comparison: getOperatorsForField(defaultField.value)[0]?.value || 'contains',
        value: ''
    });
};

const removeFilter = async (index: number) => {
    advancedFilters.value.splice(index, 1);
    if (advancedFilters.value.length === 0) {
        await applyAdvancedFilters();
    }
};

const clearAllFilters = async () => {
    if (globalSearchDebounce) {
        clearTimeout(globalSearchDebounce);
        globalSearchDebounce = null;
    }

    globalSearch.value = '';
    logicalOperator.value = 'AND';
    advancedFilters.value = [];
    employeeStore.clearFilters();
    await syncStateToRoute([]);
    await employeeStore.fetchEmployees();
};

const applyAdvancedFilters = async () => {
    if (hasIncompleteFilters.value) {
        toast.error('Preencha todos os campos dos filtros antes de aplicar.');
        return;
    }

    loading.value = true;
    try {
        const filtersForStore = buildStoreFiltersFromUi();
        employeeStore.setGlobalSearch(globalSearch.value);
        employeeStore.setLogicalOperator(logicalOperator.value);
        employeeStore.setAdvancedFilters(filtersForStore);
        await syncStateToRoute(filtersForStore);
        await employeeStore.fetchEmployees();
    } finally {
        loading.value = false;
    }
};

watch(
    () => route.query,
    async () => {
        if (routeSyncInProgress) return;

        const querySearch = normalizeRouteQueryValue(route.query[QUERY_KEYS.search]);
        const queryOperator = normalizeRouteQueryValue(route.query[QUERY_KEYS.operator]) === 'OR' ? 'OR' : 'AND';
        const queryFilters = parseRouteFilters();

        globalSearch.value = querySearch;
        logicalOperator.value = queryOperator as LogicalOperator;
        advancedFilters.value = mapStoreFiltersToUi(queryFilters);

        employeeStore.setGlobalSearch(globalSearch.value);
        employeeStore.setLogicalOperator(logicalOperator.value);
        employeeStore.setAdvancedFilters(queryFilters);
        await employeeStore.fetchEmployees();
    },
    { immediate: true, deep: true }
);

onBeforeUnmount(() => {
    if (globalSearchDebounce) {
        clearTimeout(globalSearchDebounce);
    }
});
</script>
