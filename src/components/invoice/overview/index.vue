<script lang="ts" setup>
import InvoiceDetail from "@/components/invoice/overview/InvoiceDetail.vue";
// @ts-ignore
import html2pdf from "html2pdf.js";

const onPrint = () => {
  window.print();
};

const onDownload = () => {
  const element = document.getElementById("invoiceDetails");
  if (element) {
    html2pdf(element, {
      margin: 1,
      filename: "invoice.pdf",
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { dpi: 192, letterRendering: true },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    });
  }
};
</script>
<template>
  <v-container>
    <v-row justify="center" class="pb-10">
      <v-col cols="12" xl="9">
        <div class="d-flex justify-end">
          <v-btn color="success" @click="onPrint">
            <i class="ph-printer me-1" /> Print
          </v-btn>
          <v-btn color="primary" class="ms-1" @click="onDownload">
            <i class="ph-download-simple me-1" /> Download
          </v-btn>
        </div>
        <InvoiceDetail id="invoiceDetails" class="mt-4" />
      </v-col>
    </v-row>
  </v-container>
</template>
