<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import Filters from "@/components/eCommerce/customers/Filters.vue";
import { filters, customers } from "@/components/eCommerce/customers/utils";
import Listing from "@/components/eCommerce/customers/Listing.vue";
import { CustomersType } from "@/components/eCommerce/customers/types";
import CustomerDetails from "@/components/eCommerce/customers/CustomerDetails.vue";
import CreateEditCustomerDialog from "@/components/eCommerce/customers/CreateEditCustomerDialog.vue";
import { v4 as uuidv4 } from "uuid";
import { formateDate } from "@/app/common/dateFormate";

const customerFilters = ref<any>(filters);
const selectedCustomer = ref<CustomersType>(customers[0]);
const dialog = ref(false);
const customerDetail = ref<CustomersType | null>(null);
const filteredData = ref(customers);
const finalData = ref(filteredData.value);

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    customerDetail.value = null;
  }
});

const query = computed(() => {
  return customerFilters.value.query;
});

watch(query, (newVal: string) => {
  filteredData.value = finalData.value.filter((customer) => {
    const val = newVal.toLowerCase();
    if (customer.name.toLowerCase().includes(val)) {
      return customer;
    }
  });
});

const date = computed(() => {
  return customerFilters.value.date;
});

watch(date, (newDate) => {
  if (!newDate) {
    filteredData.value = finalData.value;
  } else {
    filteredData.value = finalData.value.filter((data) => {
      return formateDate(data.create_date) === formateDate(newDate);
    });
  }
});

const status = computed(() => {
  return customerFilters.value.status;
});

watch(status, (newStatus: string) => {
  if (!!newStatus) {
    filteredData.value = finalData.value.filter(
      (data) => data.status === newStatus
    );
  } else {
    filteredData.value = finalData.value;
  }
});

const onView = (data: CustomersType) => {
  selectedCustomer.value = data;
};

const onCreate = () => {
  customerDetail.value = {
    id: -1,
    name: "",
    email: "",
    phone: "",
    create_date: new Date().toString(),
    status: "",
    img: "",
  };
  dialog.value = true;
};

const onEdit = (data: CustomersType) => {
  customerDetail.value = data;
  dialog.value = true;
};

const onConfirm = (customer: CustomersType) => {
  if (customer.id === -1) {
    filteredData.value.unshift({
      ...customer,
      id: uuidv4(),
      create_date: formateDate(customer.create_date),
    });
  } else {
    filteredData.value = filteredData.value.map((data) => {
      if (data.id === customer.id) {
        return {
          ...data,
          ...customer,
          create_date: formateDate(customer.create_date),
        };
      }
      return data;
    });
  }

  dialog.value = false;
};
</script>
<template>
  <Card title="Customers List" title-class="py-5">
    <template #title-action>
      <div>
        <v-btn color="primary" class="mx-1" @click="onCreate">
          <i class="ph-plus-circle me-1" /> Add Customer
        </v-btn>
        <v-btn color="secondary" class="mx-1">
          <i class="ph-download-simple me-1" /> Import
        </v-btn>
        <v-btn color="info" class="mx-1" variant="tonal">
          <i class="ph-upload-simple me-1" /> Export
        </v-btn>
      </div>
    </template>
  </Card>
  <v-row class="mt-5">
    <v-col cols="12" lg="8">
      <Filters v-model="customerFilters" />
      <Listing
        class="mt-5"
        :customers="filteredData"
        @onView="onView"
        @onEdit="onEdit"
      />
    </v-col>
    <v-col cols="12" lg="4">
      <CustomerDetails :customer="selectedCustomer" />
    </v-col>
  </v-row>

  <CreateEditCustomerDialog
    v-if="customerDetail"
    v-model="dialog"
    :customerDetail="customerDetail"
    @onConfirm="onConfirm"
  />
</template>
