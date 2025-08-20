<script lang="ts" setup>
import Table from "@/app/common/components/Table.vue";
const headerItems = [
  { title: "Active Page" },
  { title: "Active", align: "center" },
  { title: "Users", align: "center" },
];
const pages = [
  {
    page: "/themesbrand/velzon",
    active: 299,
    users: "25.3%",
  },
  {
    page: "/skote/index.html",
    active: 240,
    users: "22.7%",
  },
  {
    page: "/hybrix/timeline",
    active: 190,
    users: "18.7%",
  },
  {
    page: "/themesbrand/minia",
    active: 135,
    users: "14.2%",
  },
  {
    page: "/dashon/dashboard",
    active: 118,
    users: "12.6%",
  },
  {
    page: "/doot/chats",
    active: 90,
    users: "10.9%",
  },
  {
    page: "/steex/learning",
    active: 75,
    users: "07.3%",
  },
];
</script>
<template>
  <Card title="Top Pages">
    <template #title-action>
      <ListMenu isIcon :list-items="['Active page', 'Users']"
    /></template>
    <v-card-text>
      <Table :headerItems="headerItems">
        <template #body>
          <tr
            v-for="(item, index) in pages"
            :key="'top-page-' + index"
            height="44"
          >
            <td>
              {{ item.page }}
            </td>
            <td class="text-center">{{ item.active }}</td>
            <td class="text-center">{{ item.users }}</td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </Card>
</template>
