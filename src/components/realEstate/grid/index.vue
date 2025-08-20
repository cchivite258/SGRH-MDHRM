<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { filters } from "@/components/realEstate/grid/utils";
import TopBar from "@/components/realEstate/grid/TopBar.vue";
import Listing from "@/components/realEstate/grid/Listing.vue";
import Filters from "@/components/realEstate/grid/Filters.vue";
import CreateEditDialog from "@/components/realEstate/CreateEditDialog.vue";
import { PropertyType } from "@/components/realEstate/types";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { properties } from "@/components/realEstate/utils";
import Pagination from "@/app/common/components/Pagination.vue";

const page = ref(1);
const dialog = ref(false);
const realEstateData = ref<PropertyType | null>(null);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);

const filter = ref(filters);
const isFilter = ref(true);

const filteredItems = ref<PropertyType[]>(properties);
const finalData = ref<PropertyType[]>(filteredItems.value);
const filterDrawer = ref(true);

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    realEstateData.value = null;
  }
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const location = computed(() => {
  return filter.value.location;
});

watch(location, (newVal: string) => {
  filteredItems.value = finalData.value.filter((item) => {
    const val = newVal.toLowerCase();
    return item.location.toLowerCase().includes(val);
  });
});

const propertyType = computed(() => {
  return filter.value.propertyType;
});

watch(propertyType, (newVal: string) => {
  if (newVal === "All") {
    filteredItems.value = finalData.value;
  } else {
    filteredItems.value = finalData.value.filter((item) => {
      const val = newVal.toLowerCase();
      return item.type.toLowerCase().includes(val);
    });
  }
});

const bedroom = computed(() => {
  return filter.value.bedroom;
});

watch(bedroom, (newVal: string[]) => {
  if (newVal.length && !newVal.includes("all")) {
    let preparedData: any = [];
    newVal.forEach((item) => {
      const data: PropertyType[] = finalData.value.filter(
        (filterItem: PropertyType) => filterItem.bedroom == item
      );
      preparedData = [...preparedData, ...data];
    });
    filteredItems.value = preparedData;
  } else {
    filteredItems.value = finalData.value;
  }
});

const bathroom = computed(() => {
  return filter.value.bathroom;
});

watch(bathroom, (newVal: string[]) => {
  if (newVal.length && !newVal.includes("all")) {
    let preparedData: any = [];
    newVal.forEach((item) => {
      const data: PropertyType[] = finalData.value.filter(
        (filterItem: PropertyType) => filterItem.bathroom == item
      );
      preparedData = [...preparedData, ...data];
    });
    filteredItems.value = preparedData;
  } else {
    filteredItems.value = finalData.value;
  }
});

const price = computed(() => {
  return filter.value.price;
});

watch(price, (newVal: number[]) => {
  const startPrice = Number(newVal[0]);
  const endPrice = Number(newVal[1]);

  filteredItems.value = finalData.value.filter((item) => {
    const price = Number(item.price);
    return price >= startPrice && price < endPrice;
  });
});

const onCreateEditClick = (data: PropertyType | null) => {
  if (!data) {
    realEstateData.value = {
      id: -1,
      type: "",
      title: "",
      img: "",
      img_alt: "image.png",
      location: "",
      bedroom: "",
      bathroom: "",
      area: "",
      rating: "4.5",
      price: "",
      isBookmark: false,
      agent: "",
      requirement: "",
    };
  } else {
    realEstateData.value = data;
  }
  dialog.value = true;
};

const onToggleFilter = () => {
  isFilter.value = !isFilter.value;
  filterDrawer.value = !filterDrawer.value;
};

const onCreateUpdate = (data: PropertyType) => {
  if (data.id === -1) {
    const preparedData = {
      ...data,
      id: properties.length + 1,
      img: data.img.src ? data.img.src : data.img,
    };

    filteredItems.value.unshift(preparedData);
  } else {
    filteredItems.value = filteredItems.value.map((item) => {
      if (item.id === data.id) {
        return {
          ...item,
          ...data,
          img: data.img.src ? data.img.src : data.img,
        };
      }
      return item;
    });
  }

  finalData.value = filteredItems.value;
  dialog.value = false;
};

const onDelete = (id: number) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = () => {
  filteredItems.value = filteredItems.value.filter(
    (item) => item.id !== deleteId.value
  );
  finalData.value = filteredItems.value;
  deleteDialog.value = false;
};
</script>
<template>
  <v-row>
    <v-col v-if="isFilter && $vuetify.display.lgAndUp" lg="3">
      <Filters v-model="filter" @onToggleFilter="onToggleFilter" />
    </v-col>
    <v-col :lg="isFilter ? 9 : 12">
      <TopBar
        @onAdd="onCreateEditClick(null)"
        @onToggleFilter="onToggleFilter"
        class="mb-5"
      />
      <Listing
        :data="filteredItems"
        @onEdit="onCreateEditClick"
        @onDelete="onDelete"
      />
      <Pagination v-model="page" v-if="filteredItems.length" />
    </v-col>
  </v-row>

  <CreateEditDialog
    v-if="realEstateData"
    v-model="dialog"
    :data="realEstateData"
    @onCreateUpdate="onCreateUpdate"
  />

  <RemoveItemConfirmationDialog
    v-if="deleteId"
    v-model="deleteDialog"
    @onConfirm="onConfirmDelete"
  />
  <v-navigation-drawer
    v-if="$vuetify.display.mdAndDown"
    v-model="filterDrawer"
    temporary
    location="end"
  >
    <div>
      <Filters v-model="filter" @onToggleFilter="onToggleFilter" />
    </div>
  </v-navigation-drawer>
</template>
