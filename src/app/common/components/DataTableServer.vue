<template>
  <div class="data-table-server-wrapper">
    <v-data-table-server v-model:items-per-page="itemsPerPage" v-model:page="page" v-model="selectedItems"
      :headers="processedHeadersWithSelect" :items-length="totalItems" :items="serverItems" :loading="loading"
      :search="searchQuery" @update:options="loadItems" class="table-component" density="compact"
      :item-value="itemValue" :show-select="true" return-object>
      <template #body="{ items }">
        <slot name="body" :items="items" />
      </template>

      <!-- Paginação customizada -->
      <template #bottom>
        <div v-if="showPagination" class="d-flex justify-space-between align-center mt-4">
          <div class="text-muted">
            {{ $t('t-showing') }} <b>{{ (page - 1) * itemsPerPage + 1 }}-{{ Math.min(page * itemsPerPage, totalItems)
              }}</b> {{ $t('t-of') }}
            <b>{{ totalItems }}</b> {{ $t('t-results') }}
          </div>
          <v-pagination v-model="page" :length="totalPages" density="compact" color="primary" variant="text"
            total-visible="3" :prev-icon="prevIcon" :next-icon="nextIcon" class="table-pagination" />
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>


<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { TableHeaderType } from '@/app/common/types/table.types'


// Defina manualmente o tipo para os headers
interface DataTableHeader {
  key: string
  title: string
  value?: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string | number
  fixed?: boolean
  filterable?: boolean
}


interface LoadItemsOptions {
  page: number
  itemsPerPage: number
  sortBy: { key: string; order: 'asc' | 'desc' }[]
}



const props = defineProps({
  headers: {
    type: Array as PropType<TableHeaderType[]>,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  totalItems: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  },
  prevIcon: {
    type: String,
    default: 'ph-arrow-left'
  },
  nextIcon: {
    type: String,
    default: 'ph-arrow-right'
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  itemValue: {
    type: [String, Function] as PropType<string | ((item: any) => string | number)>,
    default: 'id'
  },
  searchProps: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'load-items',
  'update:page',
  'update:itemsPerPage',
  'update:modelValue'
])

const page = ref(1)
const itemsPerPage = ref(props.itemsPerPage)
const serverItems = ref(props.items)
const selectedItems = ref(props.modelValue)

const processedHeadersWithSelect = computed<DataTableHeader[]>(() => {
  const selectColumn: DataTableHeader = {
    key: 'data-table-select',
    title: '',
    sortable: false,
    width: '48px'
  };

  const mappedHeaders = props.headers.map(header => {
    const align: 'start' | 'center' | 'end' =
      header.align === 'center' ? 'center' :
        header.align === 'end' ? 'end' :
          'start';

    return {
      key: header.key || header.value || '',
      title: header.title,
      sortable: header.sortable !== false,
      align,
      value: header.value
    } satisfies DataTableHeader;
  });

  return [selectColumn, ...mappedHeaders];
});

const customHeaders = computed(() =>
  props.headers.map(header => ({
    ...header,
    alignClass: {
      'text-start': !header.align,
      'text-center': header.align === 'center',
      'text-end': header.align === 'end'
    }
  }))
)

const totalPages = computed(() =>
  Math.ceil(props.totalItems / itemsPerPage.value)
)

watch(() => props.items, (newItems) => {
  serverItems.value = newItems
}, { deep: true })

watch(() => props.modelValue, (newValue) => {
  selectedItems.value = newValue
})

watch(selectedItems, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

watch(() => props.searchQuery, () => {
  emit('load-items', {
    page: 1,
    itemsPerPage: itemsPerPage.value,
    sortBy: [], // ou mantém o anterior se aplicável
    search: props.searchQuery,
    searchProps: props.searchProps
  })
})


const loadItems = async ({
  page: newPage,
  itemsPerPage: newItemsPerPage,
  sortBy
}: LoadItemsOptions) => {
  page.value = newPage
  itemsPerPage.value = newItemsPerPage

  emit('load-items', {
    page: newPage,
    itemsPerPage: newItemsPerPage,
    sortBy,
    search: props.searchQuery,
    searchProps: props.searchProps
  })
}
</script>
<style scoped>
.table-component {
  background: transparent;
}

.data-table-server-wrapper {
  position: relative;
}

.table-pagination {
  margin-top: 0;
}

/* Estilos para alinhar os checkboxes */
:deep(.v-data-table__thead) {
  background-color: #EEF0F7;
}

:deep(.v-data-table__th) {
  font-weight: bold;
}

:deep(.v-data-table__th .v-data-table-header__content) {
  letter-spacing: 0.5px;
  font-weight: bold;
}

:deep(.v-data-table__tr:nth-of-type(even)) {
  background-color: #fafafa;
}

:deep(.v-data-table__tr:hover) {
  background-color: #f5f5f5 !important;
}

/* Alinhamento do checkbox no cabeçalho */
:deep(.v-data-table__th--select .v-checkbox) {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* Alinhamento dos checkboxes nas linhas */
:deep(.v-data-table__td--select) {
  text-align: center;
  padding-left: 0;
  padding-right: 0;
}

:deep(.v-selection-control) {
  opacity: 1 !important;
}
</style>