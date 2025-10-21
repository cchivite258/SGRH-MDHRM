<script lang="ts" setup>
import InvoiceSVG from "@/assets/images/invoice.vue";
import { topData } from "@/components/invoice/overview/utils";
import Listing from "@/components/invoice/overview/Listing.vue";
</script>
<template>
  <v-card class="position-relative h-100">
    <div class="invoice-detail-card-image">
      <img
        src="@/assets/images/logo-light.png"
        class="invoice-logo"
        alt="logo light"
        height="28"
      />

      <InvoiceSVG />
    </div>
    <v-card-text>
      <div class="invoice-detail-top">
        <h6 class="font-weight-medium">
          <span class="text-muted">Legal Registration No:</span>
          <b id="legal-register-no">32654 9851</b>
        </h6>
        <h6 class="font-weight-medium">
          <span class="text-muted">Email:</span>
          <b id="email">steex@themesbrand.com</b>
        </h6>
        <h6 class="font-weight-medium">
          <span class="text-muted">Website:</span>
          <a
            href="https://themesbrand.com/"
            class="link-primary font-weight-medium"
            target="_blank"
            id="website"
            >www.themesbrand.com</a
          >
        </h6>
        <h6 class="font-weight-medium">
          <span class="text-muted">Contact No: </span>
          <b id="contact-no"> +(01) 234 6789</b>
        </h6>
      </div>

      <v-row justify="space-between" class="invoice-details-wrapper">
        <v-col
          cols="auto"
          v-for="(item, index) in topData"
          :key="'invoice-top-data-' + index"
        >
          <div class="text-muted text-uppercase">{{ item.title }}</div>
          <div class="font-weight-bold mt-2">
            <v-chip v-if="item.isChip" label color="success" density="compact">
              {{ item.value }}
            </v-chip>
            <span v-else>{{ item.value }}</span>
          </div>
        </v-col>
      </v-row>

      <v-row class="my-4">
        <v-col cols="12" lg="6">
          <div class="text-uppercase text-muted mb-3">Billing Address</div>
          <div class="font-weight-bold mb-2 text-subtitle-2">
            Jennifer Mayert
          </div>
          <div class="text-muted">
            <div>6382 Cerromar Cir, Orangevale, California, US.</div>
            <div>Phone: +(909) 594 2812</div>
            <div>Tax: 12-3456789</div>
          </div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="text-uppercase text-muted mb-3">Shipping Address</div>
          <div class="font-weight-bold mb-2 text-subtitle-2">
            Jennifer Mayert
          </div>
          <div class="text-muted">
            <div>505 W Cordova Rd, Santa Fe, New York, US</div>
            <div>Phone: +(505) 989 1378</div>
          </div>
        </v-col>
      </v-row>

      <Listing />

      <div>
        <div class="text-muted font-weight-bold text-uppercase mb-2">
          Payment Details
        </div>

        <p class="text-muted mb-1">
          Payment Method:
          <b id="payment-method">Mastercard</b>
        </p>
        <p class="text-muted mb-1">
          Card Holder:
          <b id="card-holder-name">Jennifer Mayert</b>
        </p>
        <p class="text-muted mb-1">
          Card Number:
          <b id="card-number">xxx xxxx xxxx 1234</b>
        </p>
        <p class="text-muted mb-0">
          Total Amount: <span>$</span
          ><span id="card-total-amount">2,050.18</span>
        </p>
      </div>

      <v-alert color="danger" variant="tonal" class="mt-4">
        <template #text>
          <b> Notes: </b> All accounts are to be paid within 7 days from receipt
          of invoice. To be paid by cheque or credit card or direct payment
          online. If account is not paid within 7 days the credits details
          supplied as confirmation of work undertaken will be charged the agreed
          quoted fee noted above.
        </template>
      </v-alert>

      <p class="mt-4">
        <b>Congratulations on your recent purchase!</b> It has been our pleasure
        to serve you, and we hope we see you again soon.
      </p>

      <v-row class="mt-4 mb-10">
        <v-col cols="auto" class="text-center invoice-auth-signature">
          <img src="@/assets/images/invoice-signature.svg" alt="" height="30" />
          <div class="font-weight-bold mt-3">Authorized Sign</div>
        </v-col>
      </v-row>
      <div class="invoice-detail-card-image-bottom">
        <InvoiceSVG />
      </div>
    </v-card-text>
  </v-card>
</template>
