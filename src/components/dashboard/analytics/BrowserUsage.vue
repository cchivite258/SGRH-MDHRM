<script lang="ts" setup>
import {
  Chrome,
  Firefox,
  Safari,
  Opera,
  Microsoft,
  Chromium,
} from "@/assets/images/brands/utils";

const browsers = [
  {
    src: Chrome,
    name: "Google Chrome",
    clicks: 640,
    rate: "86.01%",
  },
  {
    src: Firefox,
    name: "Firefox",
    clicks: 274,
    rate: "59.22%",
  },
  {
    src: Safari,
    name: "Safari",
    clicks: 591,
    rate: "71.36%",
  },
  {
    src: Opera,
    name: "Opera",
    clicks: 456,
    rate: "63.82%",
  },
  {
    src: Microsoft,
    name: "Microsoft Edge",
    clicks: 640,
    rate: "86.01%",
  },
  {
    src: Microsoft,
    name: "Internet Explorer",
    clicks: 164,
    rate: "77.21%",
  },
  {
    src: Chromium,
    name: "Chromium",
    clicks: 36,
    rate: "18.90%",
  },
];
</script>
<template>
  <Card title="Browser Usage">
    <template #title-action>
      <ListMenu
        :list-items="['Order Date', 'Browsers', 'Click', 'Bounce Rate']"
      />
    </template>
    <v-card-text>
      <v-table density="compact">
        <thead>
          <tr>
            <th>Browsers</th>
            <th class="text-center">Click</th>
            <th class="text-center">Bounce Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in browsers" :key="item.name" height="47">
            <td>
              <div class="d-flex align-center">
                <img :src="item.src" height="25" />
                <span class="mx-1">
                  {{ item.name }}
                </span>
              </div>
            </td>
            <td class="text-center">{{ item.clicks }}</td>
            <td class="text-center">{{ item.rate }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </Card>
</template>
