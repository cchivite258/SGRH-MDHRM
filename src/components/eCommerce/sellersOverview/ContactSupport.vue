<script lang="ts" setup></script>
<template>
  <Card title="Contact Support" elevation="0">
    <v-card-text>
      <TextArea placeholder="Enter Your message..." hide-details />
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn
        class=""
        color="secondary"
        variant="elevated"
        elevation="0"
      >
        <i class="ph-envelope me-1" /> Send Message
      </v-btn>
    </v-card-actions>
  </Card>
</template>
