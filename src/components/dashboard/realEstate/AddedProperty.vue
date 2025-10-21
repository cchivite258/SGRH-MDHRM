<script lang="ts" setup>
import {
  img01,
  img02,
  img03,
  img04,
  img05,
  img06,
} from "@/assets/images/real-estate/utils";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";

const properties = [
  {
    id: "#TBS01",
    type: "Residency",
    name: "Classic White House",
    src: img01,
    address: "United Kingdom",
    agent: "Josefa Weissnat",
    price: "$2451.39",
    status: "sale",
  },
  {
    id: "#TBS02",
    type: "Villa",
    name: "The Country House",
    src: img02,
    address: "Germany",
    agent: "Jerry Emard",
    price: "$2451.20	",
    status: "rent",
  },
  {
    id: "#TBS03",
    type: "Apartment",
    name: "The Country House",
    src: img03,
    address: "Brazil",
    agent: "Domenic Dach",
    price: "$1249.99	",
    status: "rent",
  },
  {
    id: "#TBS04",
    type: "Villa",
    name: "Whitespace Vintage Villa",
    src: img04,
    address: "Spain",
    agent: "Axel Kozey",
    price: "$3495.76",
    status: "sale",
  },
  {
    id: "#TBS05",
    type: "Residency",
    name: "Duplex Square Valley",
    src: img05,
    address: "Mexico",
    agent: "Buck Roberts",
    price: "$2579.31",
    status: "rent",
  },
  {
    id: "#TBS06",
    type: "Residency",
    name: "Small Grey Brick Home In A Subdivision",
    src: img06,
    address: "USA",
    agent: "Josefa Weissnat",
    price: "$1478.00",
    status: "sale",
  },
];

const headerItems = [
  { title: "#" },
  { title: "Property Type" },
  { title: "Property Name" },
  { title: "Address" },
  { title: "Agent Name" },
  { title: "Price" },
  { title: "Status" },
  { title: "Action" },
];
</script>
<template>
  <Card title="Recently Added Property">
    <template #title-action>
      <ListMenu
        isSortBy
        :listItems="['Property Name', 'Price', 'Agent Name', 'Status']"
      />
    </template>
    <v-card-text>
      <Table class="mt-4" :headerItems="headerItems">
        <template #body>
          <tr v-for="(item, index) in properties" :key="item.name" height="47">
            <td class="text-primary font-weight-bold">{{ item.id }}</td>
            <td>{{ item.type }}</td>
            <td>
              <div class="d-flex align-center">
                <v-avatar rounded="lg" class="mx-1" size="50">
                  <v-img :src="item.src" />
                </v-avatar>
                <span>{{ item.name }}</span>
              </div>
            </td>
            <td>{{ item.address }}</td>
            <td>{{ item.agent }}</td>
            <td class="font-weight-bold">{{ item.price }}</td>
            <td>
              <v-chip
                v-if="item.status === 'rent'"
                label
                size="x-small"
                color="info"
              >
                Rent
              </v-chip>
              <v-chip v-else label size="x-small" color="danger"> Sale </v-chip>
            </td>
            <td>
              <TableAction />
            </td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </Card>
</template>
