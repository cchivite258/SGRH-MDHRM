<script lang="ts" setup>
import { onMounted } from "vue";
import LocalStorage from "@/app/localStorage";
import { LS_KEY_USER } from "@/app/const";
import { useRouter } from "vue-router";

const router = useRouter();
const userLocalStorage = new LocalStorage(LS_KEY_USER);

onMounted(() => {
  userLocalStorage.removeItem();
  router.push({ path: "/signin" });
});
</script>
<template></template>
