<script lang="ts" setup></script>
<template>
  <v-card-text class="pt-0">
    <div class="text-subtitle-1 font-weight-bold mt-12">Edwarf Diana</div>
    <div class="text-muted"><i class="ph-map-pin me-1" /> Phonenix, USA</div>
    <div class="mt-4">Product visual designer, expert in UI design</div>
    <div class="mt-4">
      <v-btn color="primary"> Invite to Project </v-btn>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            icon="ph-chat ph-sm"
            color="info"
            density="comfortable"
            :variant="!isHovering ? 'tonal' : 'elevated'"
            rounded
            class="ms-2"
          />
        </template>
      </v-hover>
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <v-btn
            v-bind="props"
            icon="ph-dots-three-vertical"
            color="danger"
            density="comfortable"
            :variant="!isHovering ? 'tonal' : 'elevated'"
            rounded
            class="ms-2"
          />
        </template>
      </v-hover>
    </div>
  </v-card-text>
</template>
