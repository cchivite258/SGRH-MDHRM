<script lang="ts" setup>
import { ref, watch } from "vue";
import TopFilters from "@/components/learning/instructors/gridView/TopFilters.vue";
import CreateUpdateInstructorDialog from "@/components/learning/instructors/CreateUpdateInstructorDialog.vue";
import { InstructorDataType } from "@/components/learning/instructors/types";
import { instructorGrid } from "@/components/learning/instructors/gridView/utils";
import Listing from "@/components/learning/instructors/gridView/Listing.vue";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";
import pagination from "@/app/common/components/Pagination.vue";
const query = ref("");
const filteredData = ref<InstructorDataType[]>(instructorGrid.reverse());
const finalDataList = ref<InstructorDataType[]>(filteredData.value);
const dialog = ref(false);
const instructorDetail = ref<null | InstructorDataType>(null);

const confirmationDialog = ref<boolean>(false);
const deletedId = ref<number | null>(null);
const page = ref(1);
watch(query, (newQuery: string) => {
  filteredData.value = finalDataList.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.name.toLowerCase().includes(val) ||
      item.email.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
});

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    instructorDetail.value = null;
  }
});

watch(confirmationDialog, (newVal: boolean) => {
  if (!newVal) {
    deletedId.value = null;
  }
});

const onAddUpdate = (data: InstructorDataType) => {
  if (!data) {
    instructorDetail.value = {
      id: -1,
      img: "",
      img_alt: "",
      name: "",
      total_course: "",
      email: "",
      experience: "",
      students: "",
      contact: "",
      rating: "4.5",
      status: "",
      designation: "Shopify Development",
    };
  } else {
    instructorDetail.value = data;
  }
  dialog.value = true;
};

const onCreateUpdate = (data: InstructorDataType) => {
  if (data.id === -1) {
    filteredData.value.unshift({
      ...data,
      id: finalDataList.value.length + 1,
      img: data.img[0].src ? data.img[0].src : data.img[0],
      isChecked: false,
    });
  } else {
    filteredData.value = filteredData.value.map((item) => {
      if (item.id === data.id) {
        return {
          ...item,
          ...data,
          img: data.img[0].src ? data.img[0].src : data.img[0],
          isChecked: false,
        };
      }
      return item;
    });
  }
  finalDataList.value = filteredData.value;
  dialog.value = false;
};

const onDelete = (id: number) => {
  deletedId.value = id;
  confirmationDialog.value = true;
};

const onConfirmDelete = () => {
  filteredData.value = filteredData.value.filter(
    (item) => item.id !== deletedId.value
  );

  finalDataList.value = filteredData.value;
  confirmationDialog.value = false;
};
</script>
<template>
  <Card title="Instructors List" title-class="py-4">
    <template #title-badge>
      <v-badge
        inline
        color="primary"
        density="compact"
        content="235"
        rounded="sm"
      >
      </v-badge>
    </template>
    <template #title-action>
      <TopFilters v-model="query" @onAdd="onAddUpdate" />
    </template>
  </Card>

  <Listing :data="filteredData" @onEdit="onAddUpdate" @onDelete="onDelete" />
  <pagination v-model="page" v-if="filteredData.length" />
  <CreateUpdateInstructorDialog
    v-if="instructorDetail"
    v-model="dialog"
    :data="instructorDetail"
    @onCreateUpdate="onCreateUpdate"
  />

  <ConfirmationDialog v-model="confirmationDialog" @onConfirm="onConfirmDelete">
    <v-btn
      variant="text"
      class="confirm-close-icon"
      icon="ph-x"
      @click="confirmationDialog = false"
    />

    <v-card-text class="text-center ma-md-5">
      <div class="text-danger">
        <i class="ph ph-trash ph-4x"></i>
      </div>
      <div class="mt-4">
        <h4>Are you sure ?</h4>
        <p class="text-muted mx-4 mb-0 text-subtitle-1">
          Are you sure you want to remove this record ?
        </p>
      </div>
    </v-card-text>
  </ConfirmationDialog>
</template>
