<script lang="ts">
import { flagByLanguage } from "@/app/locales/flags";

export default {
  data() {
    return {
      languages: flagByLanguage,
      text: "",
      flag: "",
      value: null,
      lan: this.$i18n.locale,
    };
  },
  methods: {
    setLanguage(entry: { language: string; title: string; flag: string }) {
      const { language: locale, title: country, flag } = entry;
      this.lan = locale;
      this.text = country;
      this.flag = flag;
      const element = document.getElementById("header-lang-img");
      if (element) {
        element.setAttribute("src", flag);
      }
      this.$i18n.locale = locale;
    },
  },
};
</script>
<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn variant="text" dark v-bind="props" icon>
        <img
          id="header-lang-img"
          src="@/assets/images/flags/mz.svg"
          alt="Header Language"
          height="20"
          class="rounded"
        />
      </v-btn>
    </template>
    <v-list width="145" density="compact" :lines="false">
      <v-list-item
        v-for="(entry, i) in languages"
        :key="`Lang${i}`"
        class="dropdown-item notify-item language pa-0"
        @click="setLanguage(entry)"
      >
        <v-row no-gutters class="py-0 px-3">
          <v-col cols="3">
            <img
              :src="entry.flag"
              alt="user-image"
              class="me-2 rounded"
              height="18"
            />
          </v-col>
          <v-col cols="9">
            <v-list-item-title class="d-flex">{{
              entry.title
            }}</v-list-item-title>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
