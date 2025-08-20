<script lang="ts" setup>
import Table from "@/app/common/components/Table.vue";
import {
  tableHeader,
  tableData as data,
  checkedTableHeader,
} from "@/components/tables/basic/utils";
import { ref } from "vue";

const tableData = ref(data);
const isSelectAll = ref(false);
const onSelectAll = () => {
  isSelectAll.value = !isSelectAll.value;
  tableData.value = tableData.value.map((item) => {
    return {
      ...item,
      isCheck: isSelectAll.value,
    };
  });
};
</script>
<template>
  <div class="text-muted mb-4">
    To represent data efficiently, you can utilize a commonly available
    <code>Table</code> component, which will allow you to structure and display
    the information in a user-friendly and organized manner.
  </div>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Default Table">
        <Table :headerItems="tableHeader">
          <template #body>
            <tr v-for="item in tableData" :key="'table-item-' + item.id">
              <td class="text-primary font-weight-bold">#TBS21{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.price }}</td>
              <td>
                <v-btn color="success" variant="text" class="px-0">
                  View more <i class="ph-arrow-right" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Table Theme">
        <Table :headerItems="tableHeader" theme="dark">
          <template #body>
            <tr v-for="item in tableData" :key="'table-item-' + item.id">
              <td class="text-primary font-weight-bold">#TBS21{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.price }}</td>
              <td>
                <v-btn color="success" variant="text" class="px-0">
                  View more <i class="ph-arrow-right" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Table density">
        <Table :headerItems="tableHeader" density="comfortable">
          <template #body>
            <tr v-for="item in tableData" :key="'table-item-' + item.id">
              <td class="text-primary font-weight-bold">#TBS21{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.price }}</td>
              <td>
                <v-btn color="success" variant="text" class="px-0">
                  View more <i class="ph-arrow-right" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Table row height">
        <Table :headerItems="tableHeader">
          <template #body>
            <tr
              v-for="item in tableData"
              :key="'table-item-' + item.id"
              height="60"
            >
              <td class="text-primary font-weight-bold">#TBS21{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.price }}</td>
              <td>
                <v-btn color="success" variant="text" class="px-0">
                  View more <i class="ph-arrow-right" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Fixed header">
        <Table :headerItems="tableHeader" fixed-header height="300px">
          <template #body>
            <tr
              v-for="item in tableData"
              :key="'table-item-' + item.id"
              height="100"
            >
              <td class="text-primary font-weight-bold">#TBS21{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.price }}</td>
              <td>
                <v-btn color="success" variant="text" class="px-0">
                  View more <i class="ph-arrow-right" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Table With Checkboxes">
        <Table
          :headerItems="checkedTableHeader"
          density="comfortable"
          @on-select-all="onSelectAll"
        >
          <template #body>
            <tr v-for="item in tableData" :key="'table-item-' + item.id">
              <td>
                <v-checkbox
                  v-model="item.isCheck"
                  hide-details
                  color="primary"
                />
              </td>

              <td class="text-primary font-weight-bold">#TBS21{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.date }}</td>
              <td>{{ item.price }}</td>
              <td>
                <v-btn color="success" variant="text" class="px-0">
                  View more <i class="ph-arrow-right" />
                </v-btn>
              </td>
            </tr>
          </template>
        </Table>
      </Card>
    </v-col>
  </v-row>
</template>
