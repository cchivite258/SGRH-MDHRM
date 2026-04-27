<template>
    <v-card class="listing-advanced-filter-card">
        <v-card-text class="listing-advanced-filter-card__body">
            <QuerySearch v-model="globalSearch" :placeholder="$t('t-user-search')"
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

                        <v-row v-for="(filter, index) in advancedFilters" :key="`filter-${index}`" class="mb-1 mx-0"
                            dense>
                            <v-col cols="12" sm="4" class="py-1 px-1">
                                <MenuSelect v-model="filter.prop" :items="filterableFields" :label="$t('t-field')"
                                    item-title="text" item-value="value" density="compact" variant="outlined"
                                    @update:model-value="onFieldChange(index)" return-object />
                            </v-col>

                            <v-col cols="12" sm="3" class="py-1 px-1">
                                <MenuSelect v-model="filter.comparison"
                                    :items="getOperatorsForField(filter.prop?.value || filter.prop)"
                                    :placeholder="$t('t-operator')" item-title="text" item-value="value" density="compact"
                                    variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="4" class="py-1 px-1">
                                <MenuSelect v-if="isBooleanField(filter.prop?.value || filter.prop)"
                                    v-model="filter.value" :items="booleanOptions" :placeholder="$t('t-value')"
                                    item-title="text" item-value="value" density="compact" variant="outlined" />
                                <TextField v-else v-model="filter.value" :placeholder="$t('t-value')" density="compact"
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
                                :disabled="advancedFilters.length === 0" :loading="loading" size="small">
                                <i class="ph-funnel me-1"></i>
                                {{ $t('t-apply-filters') }}
                            </v-btn>
                        </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/userStore';
import { useI18n } from 'vue-i18n';
import MenuSelect from '@/app/common/components/filters/MenuSelect.vue';
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"

const { t } = useI18n();
const userStore = useUserStore();

const globalSearch = ref('');
const loading = ref(false);
const logicalOperator = ref<'AND' | 'OR'>('AND');

const filterableFields = ref([
    { text: t('t-first-name'), value: 'firstName', type: 'text' },
    { text: t('t-last-name'), value: 'lastName', type: 'text' },
    { text: t('t-email'), value: 'email', type: 'text' },
    { text: t('t-active?'), value: 'enabled', type: 'boolean' },
    { text: t('t-account-locked?'), value: 'accountLocked', type: 'boolean' }
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

const booleanOptions = ref([
    { text: t('t-true'), value: 'true' },
    { text: t('t-false'), value: 'false' }
]);

interface AdvancedFilter {
    prop: any;
    comparison: string;
    value: string;
}

const advancedFilters = ref<AdvancedFilter[]>([]);

const isBooleanField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    return fieldDef?.type === 'boolean';
};

const getOperatorsForField = (field: string) => {
    if (isBooleanField(field)) {
        return booleanOperators;
    }
    return textOperators;
};

const onFieldChange = (index: number) => {
    advancedFilters.value[index].comparison = '';
    advancedFilters.value[index].value = '';
};

const onGlobalSearch = () => {
    userStore.setGlobalSearch(globalSearch.value);
    userStore.fetchUsers();
};

const addFilter = () => {
    advancedFilters.value.push({
        prop: filterableFields.value[0],
        comparison: 'contains',
        value: ''
    });
};

const removeFilter = (index: number) => {
    advancedFilters.value.splice(index, 1);
    if (advancedFilters.value.length === 0) {
        applyAdvancedFilters();
    }
};

const applyAdvancedFilters = async () => {
    loading.value = true;
    try {
        const filtersToSend = advancedFilters.value
            .filter(f => f.prop && f.comparison && f.value !== '')
            .map(f => ({
                prop: typeof f.prop === 'object' ? f.prop.value : f.prop,
                operator: f.comparison,
                value: f.value
            }));
        userStore.setLogicalOperator(logicalOperator.value);
        userStore.setAdvancedFilters(filtersToSend);
        await userStore.fetchUsers();
    } finally {
        loading.value = false;
    }
};
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
