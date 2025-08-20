<script lang="ts" setup>
const content = `
    <p>If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual languages. The new common language will be more simple and regular than the existing</p>
    <p class="mt-3">To an English person, it will seem like simplified English, as a skeptical Cambridge friend of mine told me what Occidental is. The European languages are members of the same family. Their separate existence is a myth. For science, music, sport, etc, Europe uses the same vocabulary.</p>
    <p class="mt-3">The languages only differ in their grammar, their pronunciation and their most common words. Everyone realizes why a new common language would be desirable: one could refuse to pay expensive translators. To achieve this, it would be necessary to have uniform grammar, pronunciation and more common words.</p>
    <p class="mt-3">Their separate existence is a myth. For science, music, sport, etc, Europe uses the same vocabulary. The languages only differ in their grammar, their pronunciation and their most common words.</p>
`;
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Default Scroll">
        <v-card-text data-simplebar style="max-height: 250px">
          <div class="text-muted mb-3">
            Use <code>data-simplebar</code> attribute and add
            <code>max-height: **px</code>
            to set default scrollbar.
          </div>
          <div v-html="content"></div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Auto hide false">
        <v-card-text
          data-simplebar
          style="max-height: 250px"
          data-simplebar-auto-hide="false"
        >
          <div class="text-muted mb-3">
            Use <code>data-simplebar-auto-hide="false"</code> attribute and add
            <code>max-height: **px</code> to show simplebar as default.
          </div>
          <div v-html="content"></div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="RTL Direction">
        <v-card-text
          data-simplebar
          data-simplebar-direction="rtl"
          style="max-height: 250px"
        >
          <div class="text-muted mb-3">
            Use <code>data-simplebar-direction="rtl"</code> attribute and add
            <code>max-height: **px</code> to show simplebar as default.
          </div>
          <div v-html="content"></div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
