<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import {
  products,
  productsHeader,
  productAction,
} from "@/components/eCommerce/products/utils";
import Table from "@/app/common/components/Table.vue";
import { ProductType } from "@/components/eCommerce/products/types";
import CreateEditProductDialog from "@/components/eCommerce/products/CreateEditProductDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
const prop = defineProps({
  filters: {
    type: Object,
    default: () => {},
  },
});

const createEditDialog = ref(false);
const productDetail = ref<ProductType | null>(null);

const confirmationDialog = ref(false);
const confirmationProduct = ref<ProductType | null>(null);

const isAllChecked = ref(false);
const mappedProducts = products.map((data) => {
  return {
    ...data,
    isChecked: false,
  };
});

const filteredProducts = ref<ProductType[]>(mappedProducts);
const finalData = ref<ProductType[]>(filteredProducts.value);

const page = ref(1);
const noOfItems = computed(() => {
  return finalData.value.length;
});
const tableData = ref<ProductType[]>([]);
const loading = ref(false);

const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: noOfItems.value,
  itemsPerPage: 10,
});

const getPaginatedData = () => {
  const { itemsPerPage, page } = config.value;
  const start = (page - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  end = end <= noOfItems.value ? end : noOfItems.value;

  config.value = {
    ...config.value,
    start,
    end,
  };

  const data = filteredProducts.value.slice(
    config.value.start,
    config.value.end
  );

  loading.value = true;
  tableData.value = [];

  setTimeout(() => {
    tableData.value = data;
    loading.value = false;
  }, 200);
};

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});

const query = computed(() => {
  return prop.filters.query;
});

watch(query, (newQuery: string) => {
  filteredProducts.value = finalData.value.filter((product) => {
    const val = newQuery.toLowerCase();
    if (
      product.title.toLowerCase().includes(val) ||
      product.price.includes(val)
    ) {
      return product;
    }
  });
  updateTableData(filteredProducts.value);
});

const category = computed(() => {
  return prop.filters.category;
});

watch(category, (newCategory: string) => {
  if (!!newCategory) {
    filteredProducts.value = finalData.value.filter((product) => {
      return product.category === newCategory;
    });
  } else {
    filteredProducts.value = products;
  }
  updateTableData(filteredProducts.value);
});

const discount = computed(() => {
  return prop.filters.discount;
});

watch(discount, (newDiscount: string) => {
  if (!!newDiscount) {
    filteredProducts.value = finalData.value.filter((product) => {
      return product.discount === newDiscount;
    });
  } else {
    filteredProducts.value = products;
  }
  updateTableData(filteredProducts.value);
});

const onSelectAll = () => {
  isAllChecked.value = !isAllChecked.value;

  filteredProducts.value = filteredProducts.value.map((value) => {
    return {
      ...value,
      isChecked: isAllChecked.value,
    };
  });
};

const onSelect = (option: string, data: ProductType) => {
  if (option === "edit") {
    productDetail.value = data;
    createEditDialog.value = true;
  } else if (option === "remove") {
    confirmationDialog.value = true;
    confirmationProduct.value = data;
  }
};

watch(createEditDialog, (dialog: boolean) => {
  if (!dialog) {
    productDetail.value = null;
  }
});

watch(confirmationDialog, (dialog: boolean) => {
  if (!dialog) {
    confirmationProduct.value = null;
  }
});

const onUpdate = (updatedVal: ProductType) => {
  filteredProducts.value = filteredProducts.value.map(
    (product: ProductType) => {
      if (product.id === updatedVal.id) {
        return {
          ...product,
          ...updatedVal,
        };
      }
      return {
        ...product,
      };
    }
  );

  createEditDialog.value = false;
  finalData.value = filteredProducts.value;
  updateTableData(filteredProducts.value);
};

const onCreate = (newVal: ProductType) => {
  filteredProducts.value.unshift(newVal);
  finalData.value = filteredProducts.value;
  updateTableData(filteredProducts.value);
  createEditDialog.value = false;
};

const onAddProductClick = () => {
  productDetail.value = {
    img: null,
    img_alt: "",
    title: "",
    category: "",
    stock: "",
    price: "",
    discount: "",
    orders: "",
    ratings: "",
    publish: "",
    id: -1,
  };
  createEditDialog.value = true;
};

const onConfirmDelete = () => {
  filteredProducts.value = products.filter(
    (product: ProductType) => product.id !== confirmationProduct.value?.id
  );
  confirmationDialog.value = false;
  updateTableData(filteredProducts.value);
};

const updateTableData = (newVal: ProductType[]) => {
  loading.value = true;
  const { itemsPerPage } = config.value;

  const start = 1;
  let end = start + itemsPerPage;
  end = end <= newVal.length ? end : newVal.length;
  tableData.value = [];

  setTimeout(() => {
    tableData.value = newVal;
    config.value = {
      ...config.value,
      start,
      end,
      noOfItems: newVal.length,
    };
    loading.value = false;
  }, 200);
};
</script>
<template>
  <v-card>
    <v-card-title
      class="text-subtitle-1 font-weight-bold d-flex justify-space-between align-center"
    >
      <div>
        Products
        <v-badge content="254" inline color="light" rounded="sm" />
      </div>
      <v-btn
        color="primary"
        elevation="0"
        class="mt-2"
        @click="onAddProductClick"
      >
        <i class="ph-plus-circle mx-1" /> Add Product
      </v-btn>
    </v-card-title>
    <v-card-text>
      <Table
        v-model="page"
        :config="config"
        :headerItems="productsHeader"
        is-pagination
        :loading="loading"
        @onSelectAll="onSelectAll"
      >
        <template #body>
          <tr v-for="item in tableData" :key="item.title">
            <td>
              <v-checkbox
                v-model="item.isChecked"
                color="primary"
                hide-details
              />
            </td>
            <td>
              <div class="d-flex align-center">
                <v-avatar color="light" class="pa-2 mx-1" rounded>
                  <v-img v-if="item.img" :src="item.img[0]" />
                </v-avatar>
                <span class="font-weight-bold">{{ item.title }}</span>
              </div>
            </td>
            <td>{{ item.category }}</td>
            <td>{{ item.stock }}</td>
            <td>{{ item.price }}</td>
            <td>{{ item.orders }}</td>
            <td>
              <v-chip color="warning" rounded="sm " size="x-small">
                <i class="bx bxs-star mx-1" /> {{ item.ratings }}
              </v-chip>
            </td>
            <td>{{ item.publish }}</td>
            <td>
              <ListMenuWithIcon
                :menuItems="productAction"
                @onSelect="onSelect($event, item)"
              />
            </td>
          </tr>
        </template>
      </Table>
      <div v-if="!filteredProducts.length" class="text-center pa-7">
        <div class="mb-3">
          <v-avatar color="primary" variant="tonal" size="x-large">
            <i class="ph-magnifying-glass ph-lg"></i>
          </v-avatar>
        </div>
        <div class="text-subtitle-1 font-weight-bold">
          Sorry! No Result Found
        </div>
        <div class="text-muted mt-1">
          We've searched more than 150+ products We did not find any products
          for you search.
        </div>
      </div>
    </v-card-text>
  </v-card>
  <CreateEditProductDialog
    v-if="productDetail"
    v-model="createEditDialog"
    :productDetail="productDetail"
    @onUpdate="onUpdate"
    @onCreate="onCreate"
  />

  <RemoveItemConfirmationDialog
    v-if="confirmationProduct"
    v-model="confirmationDialog"
    @onConfirm="onConfirmDelete"
  />
</template>
