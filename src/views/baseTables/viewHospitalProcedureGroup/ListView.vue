<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import View from "@/components/baseTables/hospitalProcedureGroup/viewHospitalProcedureGroup/listView/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const groupId = route.params.id;

const breadcrumb = computed<BreadcrumbType[]>(() => [
  {
    title: "hospital-procedure-group-list",
    disabled: false,
    to: "/baseTable/hospitalproceduregroup/list"
  },
  {
    title: "view-hospital-procedure-group",
    disabled: true,
    to: typeof groupId === "string" ? `/baseTable/view-hospital-procedure-group/${groupId}` : undefined
  }
]);
</script>

<template>
  <Breadcrumb :title="t('t-view-hospital-procedure-group')" :items="breadcrumb" />
  <View />
</template>
