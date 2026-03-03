<template>
    <v-card class="mb-4">
        <v-card-text class="pa-4">
            <!-- 🔍 Pesquisa Global -->
            <QuerySearch v-model="globalSearch" :placeholder="$t('t-invoice-search')"
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
                            <v-col cols="12" sm="4" class="py-1 px-1"
                                v-else-if="isEnumField(filter.prop?.value || filter.prop)">
                                <MenuSelect v-model="filter.value" 
                                    :items="getEnumOptions(filter.prop?.value || filter.prop)" 
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
import { ref, computed } from 'vue';
import { useInvoiceStore } from '@/store/invoice/invoiceStore';
import { useI18n } from 'vue-i18n';
import MenuSelect from '@/app/common/components/filters/MenuSelect.vue';
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import { format } from 'date-fns';

const { t } = useI18n();
const invoiceStore = useInvoiceStore();

const globalSearch = ref('');
const loading = ref(false);
const logicalOperator = ref<'AND' | 'OR'>('AND');

// Definição dos campos filtráveis com tipos específicos
const filterableFields = ref([
    { text: t('t-invoice-number'), value: 'invoiceNumber', type: 'text' },
    { text: t('t-issue-date'), value: 'issueDate', type: 'date' },
    { text: t('t-due-date'), value: 'dueDate', type: 'date' },
    { text: t('t-total-amount'), value: 'totalAmount', type: 'text' },
    { text: t('t-invoice-status'), value: 'invoiceStatus', type: 'enum', enumType: 'invoiceStatusGroup' },
    { text: t('t-employee-name'), value: 'employee.name', type: 'text' },
    { text: t('t-service-provider-name'), value: 'serviceProvider.name', type: 'text' },
    { text: t('t-currency'), value: 'currency.name', type: 'text' },
    { text: t('t-flag'), value: 'flag', type: 'enum', enumType: 'flagGroup' },
    { text: t('t-dependent'), value: 'dependent.name', type: 'text' },
    { text: t('t-is-employee-invoice'), value: 'isEmployeeInvoice', type: 'boolean' },
    { text: t('t-authorized-by'), value: 'authorizedBy', type: 'text' },
    { text: t('t-invoice-reference-number'), value: 'invoiceReferenceNumber', type: 'text' },
    { text: t('t-coverage-period'), value: 'coveragePeriod.name', type: 'text' },
    { text: t('t-are-items-flagged'), value: 'areItemsFlagged', type: 'boolean' },
    { text: t('t-enabled'), value: 'enabled', type: 'boolean' },
    { text: t('t-created-at'), value: 'createdAt', type: 'date' },
    { text: t('t-updated-at'), value: 'updatedAt', type: 'date' },
    { text: t('t-deleted-at'), value: 'deletedAt', type: 'date' },
    { text: t('t-created-by'), value: 'createdBy', type: 'text' },
    { text: t('t-updated-by'), value: 'updatedBy', type: 'text' },
    { text: t('t-deleted-by'), value: 'deletedBy', type: 'text' },
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

const enumOperators = [
    { text: t('t-equals'), value: 'equals' },
    { text: t('t-not-equals'), value: 'notEquals' }
];

const booleanOptions = ref([
    { text: t('t-true'), value: true },
    { text: t('t-false'), value: false }
]);

// Definição das opções para cada enum
const enumOptions = {
    invoiceStatusGroup: [
        { text: t('t-draft'), value: 'DRAFT' },
        { text: t('t-pending'), value: 'PENDING' },
        { text: t('t-paid'), value: 'PAID' },
        { text: t('t-posted'), value: 'POSTED' },
        { text: t('t-cancelled'), value: 'CANCELLED' }
    ],
    flagGroup: [
        { text: t('t-exceeds-global-limit'), value: 'EXCEEDS_GLOBAL_LIMIT' },
        { text: t('t-insufficient-funds'), value: 'INSUFFICIENT_FUNDS' },
        { text: t('t-unflagged'), value: 'UNFLAGGED' },
        { text: t('t-items-flagged'), value: 'ITEMS_FLAGGED' }
    ]
};

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

// Verifica se um campo é enum
const isEnumField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    return fieldDef?.type === 'enum';
};

// Verifica se um campo é data
const isDateField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    return fieldDef?.type === 'date';
};

// Obtém as opções para um campo enum
const getEnumOptions = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
    if (fieldDef?.type === 'enum' && fieldDef.enumType) {
        return enumOptions[fieldDef.enumType as keyof typeof enumOptions] || [];
    }
    return [];
};

// Obtém operadores apropriados para cada tipo de campo
const getOperatorsForField = (field: string) => {
    const fieldDef = filterableFields.value.find(f => f.value === field);
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

// Quando o campo de um filtro muda, resetamos o operador e valor
const onFieldChange = (index: number) => {
    const field = advancedFilters.value[index].prop?.value || advancedFilters.value[index].prop;
    
    // Resetar operador para o padrão do tipo de campo
    const operators = getOperatorsForField(field);
    advancedFilters.value[index].comparison = operators[0]?.value || '';
    
    // Resetar valor baseado no tipo de campo
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

// Pesquisa global - atualiza automaticamente
const onGlobalSearch = () => {
    invoiceStore.setGlobalSearch(globalSearch.value);
    invoiceStore.fetchInvoices();
};

// Adiciona novo filtro
const addFilter = () => {
    advancedFilters.value.push({
        prop: filterableFields.value[0],
        comparison: 'contains',
        value: isBooleanField(filterableFields.value[0].value) ? true : 
               isEnumField(filterableFields.value[0].value) ? getEnumOptions(filterableFields.value[0].value)[0]?.value || '' : ''
    });
};

// Remove filtro
const removeFilter = (index: number) => {
    advancedFilters.value.splice(index, 1);
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
                if (isDateField(prop) && f.value instanceof Date) {
                    value = format(f.value, 'yyyy-MM-dd');
                }
                
                return {
                    prop,
                    operator: f.comparison,
                    value: value
                };
            });

        invoiceStore.setLogicalOperator(logicalOperator.value);
        invoiceStore.setAdvancedFilters(filtersToSend);
        await invoiceStore.fetchInvoices();
    } finally {
        loading.value = false;
    }
};
</script>