<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import {
  Avatar9,
  Avatar7,
  Avatar6,
  Avatar8,
  Avatar2,
  Avatar3,
  Avatar5,
} from "@/assets/images/users/utils";
import Table from "@/app/common/components/Table.vue";
import { ContactLeadTypes } from "@/components/dashboard/crm/types";

const contactLeads: ContactLeadTypes[] = [
  {
    id: 1,
    src: Avatar9,
    name: "Federico Hand",
    phNo: "(11) 3666-9716",
    score: 176,
    location: "San Luis Potosi, Mexico",
    date: "21 Dec, 2022",
  },
  {
    id: 2,
    src: Avatar6,
    name: "Donnell Schultz",
    phNo: "(51) 3233-7909",
    score: 631,
    location: "Natal, Brazil",
    date: "29 Feb, 2023",
  },
  {
    id: 3,
    src: Avatar7,
    name: "Xander Wyman",
    phNo: "(48) 3877-9000	",
    score: 249,
    location: "Logrono, Spain",
    date: "24 Feb, 2023",
  },
  {
    id: 4,
    src: Avatar8,
    name: "Buck Roberts",
    phNo: "(92) 3639-8685",
    score: 176,
    location: "Ibiza, Spain",
    date: "27 Jan, 2023",
  },
  {
    id: 5,
    src: Avatar2,
    name: "Buck Roberts",
    phNo: "(11) 3885-1022",
    score: 234,
    location: "Guarulhos, Brazil",
    date: "17 Mar, 2023",
  },
  {
    id: 6,
    src: Avatar3,
    name: "Josefa Weissnat",
    phNo: "(53) 3035-3100",
    score: 418,
    location: "California, USA",
    date: "15 Mar, 2023",
  },
  {
    id: 7,
    src: Avatar5,
    name: "Jacinthe Will",
    phNo: "(33) 3521-6761",
    score: 357,
    location: "Brasília, Brazil",
    date: "11 Mar, 2023",
  },
];

const headerItems = [
  { title: "Contact Name" },
  { title: "Phone Number" },
  { title: "Lead Score" },
  { title: "Location" },
  { title: "Create Date" },
];

const page = ref(1);
const noOfItems = contactLeads.length;
const tableData = ref<ContactLeadTypes[]>([]);

const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: noOfItems,
  itemsPerPage: 5,
});

const getPaginatedData = () => {
  const { itemsPerPage, page } = config.value;

  const start = (page - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  end = end <= noOfItems ? end : noOfItems;

  config.value = {
    ...config.value,
    start,
    end,
  };
  tableData.value = contactLeads.slice(config.value.start, config.value.end);
};

onMounted(() => {
  getPaginatedData();
});

watch(page, (newPage: number) => {
  config.value.page = newPage;
  getPaginatedData();
});
</script>
<template>
  <Card title="Contact Leads">
    <template #title-action>
      <ListMenu
        isSortBy
        :listItems="['Lead Score', 'Contact Name', 'Phone Number ']"
      />
    </template>
    <v-card-text>
      <Table
        v-model="page"
        is-pagination
        :headerItems="headerItems"
        :config="config"
      >
        <template #body>
          <tr
            v-for="(item, index) in tableData"
            :key="'contactLeads-' + index"
            height="50"
          >
            <td style="min-width: 175px">
              <v-avatar class="me-2" rounded size="x-small">
                <v-img :src="item.src" />
              </v-avatar>

              {{ item.name }}
            </td>
            <td>{{ item.phNo }}</td>
            <td>{{ item.score }}</td>
            <td style="min-width: 140px">{{ item.location }}</td>
            <td>{{ item.date }}</td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </Card>
</template>
