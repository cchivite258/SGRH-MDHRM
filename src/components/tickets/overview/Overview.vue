<script lang="ts" setup>
import { Img3 } from "@/assets/images/companies/utils";
import { uiIdeas } from "@/components/tickets/overview/utils";
import Discussion from "@/components/tickets/overview/Discussion.vue";
import { chats } from "@/components/tickets/overview/utils";
</script>
<template>
  <div class="d-flex justify-space-between">
    <div class="d-flex">
      <v-avatar size="50" color="success" class="pa-2" variant="tonal" rounded>
        <v-img :src="Img3" />
      </v-avatar>
      <div class="ms-3">
        <h5 class="text-subtitle-1 font-weight-bold">
          #TBS24301901 - Forgetting to start a component name with a capital
          letter
        </h5>
        <div class="d-flex align-center flex-wrap">
          <div class="text-muted d-flex align-center pe-3 right-border">
            <i class="ph-buildings me-1" />
            <span id="ticket-client">Themesbrand</span>
          </div>
          <div class="px-3 text-muted right-border">
            Create Date :
            <b>20 Dec, 2023</b>
          </div>
          <div class="px-3 text-muted">Due Date : <b>29 Dec, 2023</b></div>
          <v-divider vertical />
          <v-chip
            density="compact"
            color="info"
            variant="elevated"
            elevation="0"
            class="mx-3"
          >
            new
          </v-chip>
          <v-chip
            density="compact"
            color="danger"
            variant="elevated"
            elevation="0"
          >
            High
          </v-chip>
        </div>
      </div>
    </div>
    <v-btn to="/tickets/list" color="primary" density="compact" class="px-2">
      Add Ticket
    </v-btn>
  </div>
  <h6 class="fw-semibold text-uppercase mt-5 mb-2">Ticket Descriptions</h6>
  <p class="text-muted mb-4">
    It's used for building interactive user interfaces and web applications
    quickly and efficiently with significantly less code than you would with
    vanilla JavaScript. In React, you develop your applications by creating
    reusable components that you can think of as independent Lego blocks. React
    is a JavaScript library developed by Facebook which, among other things, was
    used to build Instagram.com. Its aim is to allow developers to easily create
    fast user interfaces for websites and applications alike. The main concept
    of React. js is virtual DOM. If you need a fast and responsive user
    interface, ReactJS is the better option. But if you need to handle complex
    data analysis or number-crunching.
  </p>
  <h6 class="fw-semibold text-uppercase mb-3">
    Create an Excellent UI for a Dashboard
  </h6>
  <div
    v-for="(idea, index) in uiIdeas"
    :key="'idea-' + index"
    class="my-2 text-muted"
  >
    <i class="ph-check text-success me-1" /> {{ idea }}
  </div>

  <h6 class="fw-semibold text-uppercase mt-5 mb-3">
    Discussion with Themesbrand
  </h6>

  <div data-simplebar style="height: 400px">
    <Discussion :chats="chats" />
  </div>

  <h6 class="fw-semibold mt-5 mb-3">Leave a Comments</h6>
  <TextArea class="search-box" variant="solo" />
  <div class="d-flex justify-end">
    <v-btn color="success"> Post Comments </v-btn>
  </div>
</template>
