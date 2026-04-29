<template>
    <v-card class="listing-advanced-filter-card">
        <v-card-text class="listing-advanced-filter-card__body">
            <QuerySearch v-model="globalSearch" :placeholder="$t('t-service-provider-search')"
                prepend-inner-icon="ph-magnifying-glass" clearable density="compact"
                @update:model-value="onGlobalSearch" class="listing-advanced-filter-card__search" />

            <v-expansion-panels class="expansion-panels expansion-panel listing-advanced-filter-card__panels">
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
                                    <span class="listing-advanced-filter-card__radio-label">{{ t('t-and-operator') }}</span>
                                </template>
                            </v-radio>
                            <v-radio :label="t('t-or-operator')" value="OR" class="text-caption"
                                style="--v-radio-size: 16px;">
                                <template v-slot:label>
                                    <span class="listing-advanced-filter-card__radio-label">{{ t('t-or-operator') }}</span>
                                </template>
                            </v-radio>
                        </v-radio-group>

                        <v-row v-for="(filter, index) in advancedFilters" :key="`filter-${index}`" class="mb-1 mx-0" dense>
                            <v-col cols="12" sm="4" class="py-1 px-1">
                                <MenuSelect v-model="filter.prop" :items="filterableFields" :label="$t('t-field')"
                                    item-title="text" item-value="value" density="compact" variant="outlined"
                                    @update:model-value="onFieldChange(index)" />
                            </v-col>
                            <v-col cols="12" sm="3" class="py-1 px-1">
                                <MenuSelect v-model="filter.comparison" :items="getOperatorsForField(filter.prop)"
                                    :placeholder="$t('t-operator')" item-title="text" item-value="value"
                                    density="compact" variant="outlined" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1" v-if="isDateField(filter.prop)">
                                <VueDatePicker v-model="filter.value" :teleport="true" :placeholder="$t('t-enter-date')"
                                    :enable-time-picker="false" format="dd/MM/yyyy" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1" v-else-if="isSelectField(filter.prop)">
                                <MenuSelect v-model="filter.value" :items="getSelectOptionsForField(filter.prop)"
                                    :placeholder="$t('t-value')" item-title="text" item-value="value"
                                    density="compact" variant="outlined"
                                    :loading="providerTypeStore.loading" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1" v-else-if="isBooleanField(filter.prop)">
                                <MenuSelect v-model="filter.value" :items="booleanOptions" :placeholder="$t('t-value')"
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
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServiceProviderStore } from '@/store/serviceProvider/serviceProviderStore';
import { useProviderTypeStore } from '@/store/baseTables/providerTypeStore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import MenuSelect from '@/app/common/components/filters/MenuSelect.vue';
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { format } from 'date-fns';
import type { ProviderTypeListing } from '@/components/baseTables/providerType/types';

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const serviceProviderStore = useServiceProviderStore();
const providerTypeStore = useProviderTypeStore();

const QUERY_KEYS = {
    search: 'search',
    operator: 'operator',
    filters: 'filters'
} as const;

type LogicalOperator = 'AND' | 'OR';
type FilterType = 'text' | 'boolean' | 'date' | 'select';

interface SelectOption {
    text: string;
    value: string;
}

interface FilterableField {
    text: string;
    value: string;
    type: FilterType;
    options?: SelectOption[];
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
    { text: t('t-name'), value: 'name', type: 'text' },
    { text: t('t-provider-type'), value: 'providerTypes.name', type: 'select', options: [] },
    { text: t('t-description'), value: 'description', type: 'text' },
    { text: t('t-address'), value: 'address', type: 'text' },
    { text: t('t-phone'), value: 'phone', type: 'text' },
    { text: t('t-email'), value: 'email', type: 'text' },
    { text: t('t-website'), value: 'website', type: 'text' },
    { text: t('t-income-tax-number'), value: 'incomeTaxNumber', type: 'text' },
    { text: t('t-person-of-contact-fullname-1'), value: 'personOfContactFullname1', type: 'text' },
    { text: t('t-person-of-contact-phone-1'), value: 'personOfContactPhone1', type: 'text' },
    { text: t('t-person-of-contact-email-1'), value: 'personOfContactEmail1', type: 'text' },
    { text: t('t-person-of-contact-fullname-2'), value: 'personOfContactFullname2', type: 'text' },
    { text: t('t-person-of-contact-phone-2'), value: 'personOfContactPhone2', type: 'text' },
    { text: t('t-person-of-contact-email-2'), value: 'personOfContactEmail2', type: 'text' },
    { text: t('t-enabled'), value: 'enabled', type: 'boolean' },
    { text: t('t-created-at'), value: 'createdAt', type: 'date' },
    { text: t('t-updated-at'), value: 'updatedAt', type: 'date' },
    { text: t('t-deleted-at'), value: 'deletedAt', type: 'date' },
    { text: t('t-created-by'), value: 'createdBy', type: 'text' },
    { text: t('t-updated-by'), value: 'updatedBy', type: 'text' },
    { text: t('t-deleted-by'), value: 'deletedBy', type: 'text' },
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

const booleanOptions = ref([
    { text: t('t-true'), value: true },
    { text: t('t-false'), value: false }
]);

const advancedFilters = ref<AdvancedFilter[]>([]);

const providerTypeOptions = computed<SelectOption[]>(() =>
    (providerTypeStore.enabledProviderTypes as ProviderTypeListing[]).map((item) => ({
        text: item.name,
        value: item.name
    }))
);

const normalizeRouteQueryValue = (value: unknown): string => {
    if (Array.isArray(value)) return String(value[0] ?? '');
    return typeof value === 'string' ? value : '';
};

const getFieldDefinition = (field: string): FilterableField | undefined =>
    filterableFields.value.find(f => f.value === field);

const isBooleanField = (field: string) => getFieldDefinition(field)?.type === 'boolean';
const isDateField = (field: string) => getFieldDefinition(field)?.type === 'date';
const isSelectField = (field: string) => getFieldDefinition(field)?.type === 'select';
const getSelectOptionsForField = (field: string) => getFieldDefinition(field)?.options ?? [];

const getOperatorsForField = (field: string) => {
    const fieldDef = getFieldDefinition(field);
    if (!fieldDef) return textOperators;

    if (fieldDef.type === 'boolean') return booleanOperators;
    if (fieldDef.type === 'date') return dateOperators;
    if (fieldDef.type === 'select') return booleanOperators;
    return textOperators;
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
    } else if (isSelectField(field)) {
        advancedFilters.value[index].value = getSelectOptionsForField(field)[0]?.value || '';
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

const sanitizeFilterTextValue = (value: string) =>
    value.split(',')[0]?.trim() ?? '';

const buildStoreFiltersFromUi = (): StoreAdvancedFilter[] => {
    return advancedFilters.value
        .filter(isFilterComplete)
        .map((filter) => {
            const prop = filter.prop;
            let value = filter.value;

            if (isDateField(prop) && value instanceof Date) {
                value = format(value, 'yyyy-MM-dd');
            } else if (typeof value === 'string') {
                value = sanitizeFilterTextValue(value);
            }

            return {
                prop,
                operator: filter.comparison,
                value
            };
        });
};

watch(
    providerTypeOptions,
    (options) => {
        filterableFields.value = filterableFields.value.map((field) =>
            field.value === 'providerTypes.name'
                ? { ...field, options }
                : field
        );

        advancedFilters.value = advancedFilters.value.map((filter) => {
            if (filter.prop !== 'providerTypes.name') return filter;
            if (typeof filter.value === 'string' && options.some((option) => option.value === filter.value)) {
                return filter;
            }

            return {
                ...filter,
                value: options[0]?.value || ''
            };
        });
    },
    { immediate: true }
);

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
        serviceProviderStore.setGlobalSearch(globalSearch.value);
        serviceProviderStore.setLogicalOperator(logicalOperator.value);
        serviceProviderStore.setAdvancedFilters(filtersForStore);
        await syncStateToRoute(filtersForStore);
        await serviceProviderStore.fetchServiceProviders();
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
    serviceProviderStore.clearFilters();
    await syncStateToRoute([]);
    await serviceProviderStore.fetchServiceProviders();
};

const applyAdvancedFilters = async () => {
    if (hasIncompleteFilters.value) {
        toast.error('Preencha todos os campos dos filtros antes de aplicar.');
        return;
    }

    loading.value = true;
    try {
        const filtersForStore = buildStoreFiltersFromUi();
        serviceProviderStore.setGlobalSearch(globalSearch.value);
        serviceProviderStore.setLogicalOperator(logicalOperator.value);
        serviceProviderStore.setAdvancedFilters(filtersForStore);
        await syncStateToRoute(filtersForStore);
        await serviceProviderStore.fetchServiceProviders();
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

        serviceProviderStore.setGlobalSearch(globalSearch.value);
        serviceProviderStore.setLogicalOperator(logicalOperator.value);
        serviceProviderStore.setAdvancedFilters(queryFilters);
        await serviceProviderStore.fetchServiceProviders();
    },
    { immediate: true, deep: true }
);

onMounted(async () => {
    if (!providerTypeStore.provider_types.length) {
        await providerTypeStore.fetchProviderTypes(0, 10000000);
    }
});

onBeforeUnmount(() => {
    if (globalSearchDebounce) {
        clearTimeout(globalSearchDebounce);
    }
});
</script>

<style scoped>
.listing-advanced-filter-card {
    border: 1px solid #e4eaf2;
    border-radius: 16px !important;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05) !important;
}

.listing-advanced-filter-card__body {
    padding: 18px 18px 16px;
    font-family: inherit;
}

.listing-advanced-filter-card__search {
    margin-bottom: 0;
}

.listing-advanced-filter-card__panels {
    margin-top: 14px;
}

.listing-advanced-filter-card :deep(.v-expansion-panel) {
    border: 1px solid #edf2f7;
    border-radius: 12px !important;
    box-shadow: none;
}

.listing-advanced-filter-card :deep(.v-expansion-panel-title) {
    min-height: 46px;
}

.listing-advanced-filter-card :deep(.v-field__input),
.listing-advanced-filter-card :deep(.v-label),
.listing-advanced-filter-card :deep(.v-field__field),
.listing-advanced-filter-card :deep(.v-select__selection),
.listing-advanced-filter-card :deep(input),
.listing-advanced-filter-card :deep(.v-btn),
.listing-advanced-filter-card :deep(.v-expansion-panel-title__overlay),
.listing-advanced-filter-card :deep(.v-expansion-panel-title__icon),
.listing-advanced-filter-card :deep(.v-expansion-panel-text),
.listing-advanced-filter-card :deep(.v-radio .v-label) {
    font-family: inherit !important;
    font-size: 0.76rem !important;
}

.listing-advanced-filter-card :deep(.v-expansion-panel-title) {
    font-family: inherit !important;
    font-size: 0.76rem;
    font-weight: 700;
}

.listing-advanced-filter-card__radio-label {
    font-family: inherit;
    font-size: 0.76rem;
}

@media (max-width: 767px) {
    .listing-advanced-filter-card__body {
        padding: 14px 14px 12px;
    }
}
</style>
