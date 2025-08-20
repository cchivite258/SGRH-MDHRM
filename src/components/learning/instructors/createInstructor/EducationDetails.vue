<script lang="ts" setup>
import EducationData from "@/components/learning/instructors/createInstructor/EducationData.vue";
import { ref } from "vue";
const components = ref(["component1"]);

const onAdd = () => {
  const Count = components.value.length + 1;
  components.value.push("component" + Count);
};

const onDelete = (component: string) => {
  components.value = components.value.filter((item) => {
    return item !== component;
  });
};
</script>
<template>
  <Card elevation="0" title="Education Details">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="4">
          <p class="text-muted">
            Education refers to the discipline that is concerned with methods of
            teaching and learning in schools or school-like environments
          </p>
        </v-col>
        <v-col cols="12" lg="8">
          <EducationData
            v-for="component in components"
            :key="component"
            @onDelete="onDelete(component)"
          />
          <v-btn color="primary" @click="onAdd"> Add New </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
