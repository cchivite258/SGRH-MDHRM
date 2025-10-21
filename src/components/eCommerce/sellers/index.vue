<script lang="ts" setup>
import { watch, ref } from "vue";
import { sellers } from "@/components/eCommerce/sellers/utils";
import Card from "@/components/eCommerce/sellers/Card.vue";
import Filters from "@/components/eCommerce/sellers/Filters.vue";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";
import CreateEditSellerDialog from "@/components/eCommerce/sellers/CreateEditSellerDialog.vue";
import { v4 as uuidv4 } from "uuid";

const query = ref<string>("");
const filteredSellers = ref<{ [key: string]: any }[]>(sellers);
const confDialog = ref<boolean>(false);
const confId = ref<any>(null);

const dialog = ref<boolean>(false);
const selectedSeller = ref<{ [key: string]: any } | null>(null);

watch(query, (newQuery: string) => {
  filteredSellers.value = sellers.filter((seller) => {
    const val = newQuery.toLowerCase();
    if (
      seller.name.toLowerCase().includes(val) ||
      seller.seller.toLowerCase().includes(val)
    ) {
      return seller;
    }
  });
});

watch(confDialog, (dialog: boolean) => {
  if (!dialog) {
    confId.value = null;
  }
});

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    selectedSeller.value = null;
  }
});

const onRemove = (seller: { [key: string]: any }) => {
  confDialog.value = true;
  confId.value = seller.id;
};

const onConfirmRemove = () => {
  filteredSellers.value = filteredSellers.value.filter(
    (item) => item.id !== confId.value
  );
  confDialog.value = false;
};

const onAdd = () => {
  selectedSeller.value = {
    id: -1,
    seller: "",
    name: "",
    email: "",
    phone: "",
    img: "",
  };

  dialog.value = true;
};
const onEdit = (seller: { [key: string]: any }) => {
  selectedSeller.value = seller;
  dialog.value = true;
};

const onCreateUpdate = (sellerDetail: { [key: string]: any }) => {
  if (sellerDetail.id === -1) {
    const { img } = sellerDetail;
    filteredSellers.value = [
      {
        ...sellerDetail,
        id: uuidv4(),
        img: img.src ? img.src : img,
        img_alt: "img.png",
        stock: "357",
        revenue: "$346.35",
        series: [],
        chartOptions: {},
      },
      ...filteredSellers.value,
    ];
  } else {
    filteredSellers.value = filteredSellers.value.map((item) => {
      if (item.id === sellerDetail.id) {
        return {
          ...item,
          ...sellerDetail,
        };
      }
      return item;
    });
  }

  dialog.value = false;
};
</script>
<template>
  <div>
    <Filters v-model="query" @onAdd="onAdd" />
    <Card :data="filteredSellers" @onRemove="onRemove" @onEdit="onEdit" />
    <v-row>
      <v-col v-if="!filteredSellers.length" cols="12" class="text-center">
        <v-avatar size="80" color="primary" variant="tonal" class="mb-3">
          <i
            class="ph-magnifying-glass"
            style="font-size: 30px"
            color="primary"
          />
        </v-avatar>
        <div class="font-weight-bold text-subtitle-1 mb-1">
          Sorry! No Result Found
        </div>
        <div class="text-muted">
          We've searched more than 150+ customers We did not find any customers
          for you search.
        </div></v-col
      >
    </v-row>
  </div>
  <ConfirmationDialog
    v-if="confId"
    v-model="confDialog"
    @onConfirm="onConfirmRemove"
  >
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon="ph-x"
      @click="confDialog = false"
    />

    <v-card-text class="text-center ma-md-5">
      <div class="text-danger">
        <i class="ph ph-trash ph-4x"></i>
      </div>
      <div class="mt-4">
        <h4>Are you sure ?</h4>
        <p class="text-muted mx-4 mb-0 text-subtitle-1">
          Are you sure you want to remove this seller ?
        </p>
      </div>
    </v-card-text>
  </ConfirmationDialog>

  <CreateEditSellerDialog
    v-if="selectedSeller"
    v-model="dialog"
    :selectedSeller="selectedSeller"
    @onCreateUpdate="onCreateUpdate"
  />
</template>
