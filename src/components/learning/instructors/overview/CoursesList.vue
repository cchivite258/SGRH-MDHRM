<script lang="ts" setup>
import { ref, watch } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import Table from "@/app/common/components/Table.vue";
import {
  courseHeader,
  courseListing,
} from "@/components/learning/instructors/overview/utils";
import { useRouter } from "vue-router";
import Status from "@/app/common/components/Status.vue";
import ConfirmationDialog from "@/app/common/components/ConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import Pagination from "@/app/common/components/Pagination.vue";
const router = useRouter();
const query = ref("");
const filteredData = ref(courseListing);
const finalData = ref(courseListing);
const page = ref(1);

const confirmationDialog = ref(false);
const deleteId = ref<number | null>(null);

watch(query, (newQuery: string) => {
  filteredData.value = finalData.value.filter((item) => {
    const val = newQuery.toLowerCase();
    if (
      item.course.toLowerCase().includes(val) ||
      item.category.toLowerCase().includes(val)
    ) {
      return item;
    }
  });
});

const onView = () => {
  router.push({ path: "/learning/overview" });
};

const onEdit = () => {
  router.push({ path: "/learning/create" });
};

const onDelete = (id: number) => {
  confirmationDialog.value = true;
  deleteId.value = id;
};

const onConfirmDelete = () => {
  filteredData.value = finalData.value.filter(
    (data) => data.id !== deleteId.value
  );
  finalData.value = filteredData.value;
  confirmationDialog.value = false;
};
</script>
<template>
  <v-card-title class="mb-3 px-0">
    <v-row justify="space-between">
      <v-col lg="3">
        <QuerySearch
          v-model="query"
          placeholder="Search for course, price or something..."
        />
      </v-col>
      <v-col lg="auto">
        <v-btn color="secondary" to="/learning/create">
          <i class="ph-plus-circle me-1" /> Add Course
        </v-btn>
      </v-col>
    </v-row>
  </v-card-title>
  <v-card-text class="px-0">
    <Table :headerItems="courseHeader">
      <template #body>
        <tr
          v-for="(item, index) in filteredData"
          :key="'eCommerce-order-item-' + index"
          height="70"
          style="cursor: pointer"
        >
          <td>
            <div class="d-flex align-center">
              <v-avatar
                :color="item.color"
                size="large"
                class="pa-2"
                rounded
                variant="tonal"
              >
                <v-img :src="item.logoImg" />
              </v-avatar>
              <div class="ms-2" @click="onView">
                <div class="font-weight-bold">{{ item.course }}</div>
                <div class="text-muted">{{ item.category }}</div>
              </div>
            </div>
          </td>
          <td class="text-center">{{ item.price }}</td>
          <td class="text-center">{{ item.duration }}</td>
          <td class="text-center">{{ item.students }}</td>
          <td class="text-center">{{ item.rating }}</td>
          <td class="text-center"><Status :status="item.statusType" /></td>
          <td style="justify-content: end">
            <TableAction
              @onView="onView"
              @onEdit="onEdit"
              @onDelete="onDelete(item.id)"
            />
          </td>
        </tr>
      </template>
    </Table>

    <Pagination v-model="page" v-if="filteredData.length" />

    <div v-if="!filteredData.length" class="text-center pa-7">
      <div class="mb-3">
        <v-avatar color="primary" variant="tonal" size="x-large">
          <i class="ph-magnifying-glass ph-lg"></i>
        </v-avatar>
      </div>
      <div class="text-subtitle-1 font-weight-bold">Sorry! No Result Found</div>
      <div class="text-muted mt-1">
        We've searched more than 150+ products We did not find any products for
        you search.
      </div>
    </div>
  </v-card-text>

  <ConfirmationDialog
    v-if="deleteId"
    v-model="confirmationDialog"
    @onConfirm="onConfirmDelete"
  >
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
