<script lang="ts" setup>
import { phosphorIcons, menuOptions } from "@/components/icons/phosphor/utils";
import { computed } from "vue";
import { ref } from "vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const icons = Object.keys(phosphorIcons);
const type = ref("thin");

const getIcons = computed(() => {
  if (type.value === "all") {
    return icons;
  }
  return icons.filter((icon) => icon.includes(type.value));
});
</script>
<template>
  <Card title="Icons">
    <template #title-action>
      <div>
        <MenuSelect v-model="type" :items="menuOptions" />
      </div>
    </template>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="4"
          xl="3"
          v-for="(icon, index) in getIcons"
          :key="'icons-' + index"
          class="text-muted"
        >
          <i :class="icon" class="me-2" />
          {{ icon }}
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
