<template>
    <v-card class="mb-4">
        <v-card-text class="pa-4">
            <!-- 🔍 Pesquisa Global -->
            <QuerySearch v-model="globalSearch" :placeholder="$t('t-employee-search')"
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
import { useEmployeeStore } from '@/store/employee/employeeStore';
import { useI18n } from 'vue-i18n';
import MenuSelect from '@/app/common/components/filters/MenuSelect.vue';
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue"
import { format } from 'date-fns';

const { t } = useI18n();
const employeeStore = useEmployeeStore();

const globalSearch = ref('');
const loading = ref(false);
const logicalOperator = ref<'AND' | 'OR'>('AND');

// Definição dos campos filtráveis com tipos específicos
const filterableFields = ref([
    { text: t('t-name'), value: 'name', type: 'text' },
    { text: t('t-employee-number'), value: 'employeeNumber', type: 'text' },
    { text: t('t-firstname'), value: 'firstName', type: 'text' },
    { text: t('t-lastname'), value: 'lastName', type: 'text' },
    { text: t('t-gender'), value: 'gender', type: 'enum', enumType: 'gender' },
    { text: t('t-marital-status'), value: 'maritalStatus', type: 'enum', enumType: 'maritalStatus' },
    { text: t('t-birth-date'), value: 'birthDate', type: 'date' },
    { text: t('t-blood-group'), value: 'bloodGroup', type: 'enum', enumType: 'bloodGroup' },
    { text: t('t-place-of-birth'), value: 'placeOfBirth', type: 'text' }, // Corrigido: não é date
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
    { text: t('t-salary'), value: 'salary', type: 'text' },
    { text: t('t-passport-issuance-date'), value: 'passportIssuanceDate', type: 'date' },
    { text: t('t-passport-expiry-date'), value: 'passportExpiryDate', type: 'date' },
    { text: t('t-province'), value: 'province.name', type: 'text' },
    { text: t('t-country'), value: 'country.name', type: 'text' },
    { text: t('t-company'), value: 'company.name', type: 'text' },
    { text: t('t-department'), value: 'department.name', type: 'text' },
    { text: t('t-position'), value: 'department.position', type: 'text' },
    { text: t('t-dependent'), value: 'dependents.firstName', type: 'text' },
    { text: t('t-enabled'), value: 'enabled', type: 'boolean' },
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
    employeeStore.setGlobalSearch(globalSearch.value);
    employeeStore.fetchEmployees();
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

        employeeStore.setLogicalOperator(logicalOperator.value);
        employeeStore.setAdvancedFilters(filtersToSend);
        await employeeStore.fetchEmployees();
    } finally {
        loading.value = false;
    }
};
</script>