<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// Props e emits para v-model
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

// i18n e router
const { t } = useI18n();
const router = useRouter();

// Computed para controlar o v-model do diálogo
const dialogValue = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit("update:modelValue", val),
});

// Pesquisa
const query = ref("");

// Lista dos itens
const items = [
    { label: "countries", link: "/baseTable/country/list" },
    { label: "currencies", link: "/baseTable/currency/list" },
    { label: "hospital_procedure_types", link: "/baseTable/hospitalproceduretype/list" },
    { label: "institution-types", link: "/baseTable/institutiontype/list" },
    { label: "leave-reason", link: "/baseTable/leavereason/list" },
    { label: "languages", link: "/baseTable/languages/list" },
    { label: "tax-rates", link: "/baseTable/tax-rates/list" },
];

// Função para normalizar strings (remove acentos e converte para minúsculas)
function normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Filtro de itens com suporte a português
const filteredItems = computed(() =>
    items.filter(i => {
        const translated = t(`t-${i.label}`);
        return normalize(translated).includes(normalize(query.value)) ||
            normalize(i.label).includes(normalize(query.value));
    })
);

// Navegação
const goTo = (link: string) => {
    dialogValue.value = false;
    router.push(link);
};
</script>

<template>
    <v-dialog v-model="dialogValue" width="400" style="height: 500px;" scrollable>
        <Card :title="t('t-search-base-tables')" title-class="py-0" style="overflow: hidden">
            <!-- Botão de Fechar -->
            <template #title-action>
                <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
            </template>

            <v-divider />

            <v-card-text class="overflow-y-auto" style="max-height: 60vh">
                <TextField v-model="query" :placeholder="t('t-search-base-tables')" clearable hide-details />

                <v-list>
                    <!-- Lista de resultados -->
                    <v-list-item v-for="item in filteredItems" :key="item.label" class="cursor-pointer"
                        @click="goTo(item.link)" v-if="filteredItems.length > 0">
                        <v-list-item-title class="small-text">
                            {{ t(`t-${item.label}`) }}
                        </v-list-item-title>
                    </v-list-item>

                    <!-- Mensagem de nenhum resultado -->
                    <v-list-item v-else>
                        <v-list-item-title class="text-black text-center small-text">
                            <v-avatar size="80" color="primary" variant="tonal">
                                <i class="ph-magnifying-glass" style="font-size: 30px" />
                            </v-avatar>
                            <div class="text-subtitle-1 font-weight-bold mt-3">
                                {{ $t('t-search-not-found-message') }}
                            </div>
                        </v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card-text>

            <v-divider />

            <v-card-actions class="d-flex justify-end">
                <v-btn color="danger" class="me-1" @click="dialogValue = false">
                    <i class="ph-x me-1" /> {{ t("t-close") }}
                </v-btn>
            </v-card-actions>
        </Card>
    </v-dialog>
</template>


<style scoped>
.cursor-pointer {
    cursor: pointer;
}

.small-text {
    font-size: 0.85rem;
}
</style>
