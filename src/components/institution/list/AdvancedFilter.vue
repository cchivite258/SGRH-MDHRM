<template>
    <v-card class="mb-4">
        <v-card-text class="pa-4">
            <!-- 🔍 Pesquisa Global -->
            <QuerySearch v-model="globalSearch" :placeholder="$t('t-institution-search')"
                prepend-inner-icon="ph-magnifying-glass" clearable density="compact"
                @update:model-value="onGlobalSearch" class="mb-2" />

            <!-- 🎛️ Filtros Avançados -->
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
                                    @update:model-value="onFieldChange(index)" return-object />
                            </v-col>

                            <v-col cols="12" sm="3" class="py-1 px-1">
                                <MenuSelect v-model="filter.comparison"
                                    :items="getOperatorsForField(filter.prop?.value || filter.prop)"
                                    :placeholder="$t('t-operator')" item-title="text" item-value="value"
                                    density="compact" variant="outlined" />
                            </v-col>

                            <v-col cols="12" sm="4" class="py-1 px-1"
                                v-if="isDateField(filter.prop?.value || filter.prop)">
                                <VueDatePicker v-model="filter.value" :teleport="true"
                                    :placeholder="$t('t-enter-date')" :enable-time-picker="false"
                                    format="dd/MM/yyyy" />
                            </v-col>
                            <v-col cols="12" sm="4" class="py-1 px-1"
                                v-else-if="isBooleanField(filter.prop?.value || filter.prop)">
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
import { useInstitutionStore } from '@/store/institution/institutionStore';
import { useI18n } from 'vue-i18n';
import MenuSelect from '@/app/common/components/filters/MenuSelect.vue';
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import { format } from 'date-fns';

const { t } = useI18n();
const institutionStore = useInstitutionStore();

const globalSearch = ref('');
const loading = ref(false);
const logicalOperator = ref<'AND' | 'OR'>('AND');

// Definição dos campos filtráveis
const filterableFields = ref([
    { text: t('t-name'), value: 'name', type: 'text' },
    { text: t('t-institution-type'), value: 'institutionType.name', type: 'text' },
    { text: t('t-address'), value: 'address', type: 'text' },
    { text: t('t-phone'), value: 'phone', type: 'text' },
    { text: t('t-email'), value: 'email', type: 'text' },
    { text: t('t-website'), value: 'website', type: 'text' },
    { text: t('t-income-tax-number'), value: 'incomeTaxNumber', type: 'text' },
    { text: t('t-createdAt'), value: 'createdAt', type: 'date' },
    { text: t('t-description'), value: 'description', type: 'text' },
    { text: t('t-availability'), value: 'enabled', type: 'boolean' }
]);

// Operadores disponíveis
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

interface AdvancedFilter {
    prop: any;
    comparison: string;
    value: string | boolean | Date;
}

const advancedFilters = ref<AdvancedFilter[]>([]);

// Verifica se um campo é booleano
const isBooleanField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    return fieldDef?.type === 'boolean';
};

// Obtém operadores apropriados para cada tipo de campo
const getOperatorsForField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    if (!fieldDef) return textOperators;

    if (fieldDef.type === 'boolean') {
        return booleanOperators;
    }
    if (fieldDef.type === 'date') {
        return dateOperators;
    }
    return textOperators;
};

const isDateField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    return fieldDef?.type === 'date';
};

// Quando o campo de um filtro muda, resetamos o operador e valor
const onFieldChange = (index: number) => {
    advancedFilters.value[index].comparison = '';
    advancedFilters.value[index].value = isBooleanField(advancedFilters.value[index].prop?.value || advancedFilters.value[index].prop)
        ? true
        : '';
};

// Pesquisa global - atualiza automaticamente
const onGlobalSearch = () => {
    institutionStore.setGlobalSearch(globalSearch.value);
    institutionStore.fetchInstitutions();
};

// Adiciona novo filtro
const addFilter = () => {
    advancedFilters.value.push({
        prop: filterableFields.value[0], // Usa o primeiro campo como padrão
        comparison: 'contains',
        value: isBooleanField(filterableFields.value[0].value) ? true : ''
    });
};

// Remove filtro
const removeFilter = (index: number) => {
    advancedFilters.value.splice(index, 1);
    // Se não houver mais filtros, aplica a mudança
    if (advancedFilters.value.length === 0) {
        applyAdvancedFilters();
    }
};

// Aplica os filtros avançados
const applyAdvancedFilters = async () => {
    loading.value = true;
    try {
        const filtersToSend = advancedFilters.value
            .filter(f => f.prop && f.comparison && f.value !== '')
            .map(f => {
                const prop = typeof f.prop === 'object' ? f.prop.value : f.prop;
                let value = f.value;
                
                // Formata datas para yyyy-MM-dd
                if (isDateField(prop)) {
                    if (f.value instanceof Date) {
                        value = format(f.value, 'yyyy-MM-dd');
                    } else if (typeof f.value === 'string') {
                        // Se for string, tenta converter para Date e depois formatar
                        const date = new Date(f.value);
                        if (!isNaN(date.getTime())) {
                            value = format(date, 'yyyy-MM-dd');
                        }
                    }
                }
                
                return {
                    prop,
                    operator: f.comparison,
                    value: value
                };
            });

        institutionStore.setLogicalOperator(logicalOperator.value);
        institutionStore.setAdvancedFilters(filtersToSend);
        await institutionStore.fetchInstitutions();
    } finally {
        loading.value = false;
    }
};
</script>