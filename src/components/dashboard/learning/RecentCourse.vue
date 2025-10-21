<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import ListMenu from "@/app/common/components/ListMenu.vue";
import {
  react,
  shopify,
  sketch,
  webpack,
  laravel,
  tailwindcss,
} from "@/assets/images/learning/utils";
import Table from "@/app/common/components/Table.vue";
import { CourseType } from "@/components/dashboard/learning/types";

const courses: CourseType[] = [
  {
    src: react,
    name: "Advanced React and Redux",
    category: "React Development",
    instructor: "Ayaan Bowen",
    lessons: 15,
    duration: 2,
    fees: 278.12,
    status: "open",
    rating: 4.5,
  },
  {
    src: shopify,
    name: "The Complete Shopify Dropship course",
    category: "Shopify Development",
    instructor: "Jansh Brown",
    lessons: 27,
    duration: 6,
    fees: 149.0,
    status: "open",
    rating: 4.5,
  },
  {
    src: sketch,
    name: "UI/UX Style guide With Sketch",
    category: "Graphic Design",
    instructor: "Ayaan Bowen",
    lessons: 16,
    duration: 3,
    fees: 215.0,
    status: "close",
    rating: 4.9,
  },
  {
    src: webpack,
    name: "Digital Marketing",
    category: "Marketing & Management",
    instructor: "Prezy Mark",
    lessons: 65,
    duration: 2,
    fees: 199.0,
    status: "open",
    rating: 4.3,
  },
  {
    src: laravel,
    name: "Master Laravel for Beginners & Intermediate",
    category: "Laravel Development",
    instructor: "Nelson Schaden",
    lessons: 21,
    duration: 8,
    fees: 379.99,
    status: "close",
    rating: 4.7,
  },
  {
    src: tailwindcss,
    name: "Tailwind CSS From Scratch",
    category: "Web Design",
    instructor: "Domenic Dach",
    lessons: 53,
    duration: 1,
    fees: 473.08,
    status: "open",
    rating: 4.8,
  },
];

const headerItems = [
  { title: "Course Name" },
  { title: "Category" },
  { title: "Instructor" },
  { title: "Lessons" },
  { title: "Duration" },
  { title: "Fees" },
  { title: "Status" },
  { title: "Rating" },
];

const page = ref(1);
const noOfItems = courses.length;
const tableData = ref<CourseType[]>([]);
const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: noOfItems,
  itemsPerPage: 5,
});

const getPaginatedData = () => {
  const { page, itemsPerPage } = config.value;
  const start = (page - 1) * itemsPerPage;
  let end = start + itemsPerPage;
  end = end <= noOfItems ? end : noOfItems;

  config.value = {
    ...config.value,
    start,
    end,
  };
  tableData.value = courses.slice(config.value.start, config.value.end);
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
  <Card title="Recent Courses">
    <template #title-action>
      <ListMenu
        isSortBy
        :listItems="['Course Name', 'Instructor', 'Amount', 'Status']"
      />
    </template>
    <v-card-text>
      <Table
        v-model="page"
        :header-items="headerItems"
        is-pagination
        :config="config"
        class="mt-4"
      >
        <template #body>
          <tr v-for="(item, index) in tableData" :key="item.name" height="47">
            <td>
              <div class="d-flex align-center">
                <img :src="item.src" height="25" class="mx-1" /> {{ item.name }}
              </div>
            </td>
            <td>{{ item.category }}</td>
            <td>{{ item.instructor }}</td>
            <td>{{ item.lessons }}</td>
            <td>{{ item.duration }}</td>
            <td>{{ item.fees }}</td>
            <td class="text-center">
              <v-chip
                v-if="item.status === 'open'"
                label
                color="info"
                size="small"
              >
                Open
              </v-chip>
              <v-chip
                v-if="item.status === 'close'"
                label
                color="danger"
                size="small"
              >
                Close
              </v-chip>
            </td>
            <td class="text-center">
              <i class="ph-star text-warning"></i>
              <span class="font-weight-bold px-1 text-subtitle-2">{{
                item.rating
              }}</span>
            </td>
          </tr>
        </template>
      </Table>
    </v-card-text>
  </Card>
</template>
