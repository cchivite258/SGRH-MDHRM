<script setup lang="ts">
import { computed } from 'vue';
import type { CompanyHospitalProceduresBalanceType } from "@/components/ammReports/types";
import Table from "@/app/common/components/Table.vue";
import { formateDate } from "@/app/common/dateFormate";
import { amountFormate } from '@/app/common/amountFormate';

const props = defineProps<{
  report: CompanyHospitalProceduresBalanceType
}>();

const company = computed(() => props.report?.company);
const coverage = computed(() => props.report?.coveragePeriod);
const procedures = computed(() => props.report?.procedureExpenses || []);
</script>

<template>
  <v-container class="py-6" max-width="900px">

    <!-- HEADER -->
    <v-card elevation="2" class="pa-6 mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h6 class="text-subtitle-1 font-weight-bold">{{$t('t-preview-report')}}</h6>
          <div class="text-muted my-1 uppercase">
            {{ $t("t-report") }} #100001 - {{$t("t-total-spent-medical-assistance")}}
          </div>
        </div>

        <v-btn-group>
          <v-btn color="primary" prepend-icon="mdi-printer">{{$t('t-print')}}</v-btn>
          <v-btn color="secondary" prepend-icon="mdi-file-export">{{$t('t-export')}}</v-btn>
        </v-btn-group>
      </div>
    </v-card>

    <!-- INFO PRINCIPAL -->
    <v-card elevation="1" class="pa-6 mb-6 ">
        <v-card-text>
            <v-row>
        <v-col cols="12" md="6">
        <h6 class="text-subtitle-1 font-weight-bold">{{$t('t-institution-information')}}</h6>
          <div class="text-muted my-1"><strong>{{$t('t-name')}}:</strong> {{ company?.name }}</div>
          <div class="text-muted my-1"><strong>{{$t('t-email')}}:</strong> {{ company?.email }}</div>
          <div class="text-muted my-1"><strong>{{$t('t-phone')}}:</strong> {{ company?.phone }}</div>
        </v-col>

        <v-col cols="12" md="6">
          <h6 class="text-subtitle-1 font-weight-bold">{{$t('t-coverage-period')}}</h6>
          <div class="text-muted my-1"><strong>{{$t('t-period')}}:</strong> {{ coverage?.name }}</div>
          <div class="text-muted my-1"><strong>{{$t('t-start-period')}}:</strong> {{ formateDate(coverage?.startDate) }}</div>
          <div class="text-muted my-1"><strong>{{$t('t-end-period')}}:</strong> {{ formateDate(coverage?.endDate) }}</div>
          <div class="text-muted my-1"><strong>{{$t('t-total-spent')}}:</strong> {{ amountFormate(report.totalAmount) }} MT</div>
        </v-col>
      </v-row>

        </v-card-text>
      
    </v-card>

    <!-- TABELA DE PROCEDIMENTOS -->
    <v-card elevation="1" class="pa-6">
      <h6 class="text-subtitle-1 font-weight-bold mb-4">{{$t('t-expenses-by-procedure')}}</h6>

      <v-table>
        <thead>
          <tr>
            <th class="text-left">{{$t('t-procedure')}}</th>
            <th class="text-right">{{$t('t-amount-spent')}} (MT)</th>
            <th class="text-right">{{$t('t-amount-covered')}}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(p, i) in procedures" :key="i">
            <td>{{ p.procedure.name }}</td>
            <td class="text-right">{{ amountFormate(p.amountSpent) }}</td>
            <td class="text-right">
              {{ amountFormate(p.amountCovered) ?? '—' }}
            </td>
          </tr>
          <!-- LINHA TOTAL -->
        <tr class="font-weight-bold" style="background: #fafafa;">
            <td>{{$t('t-totals')}}</td>
            <td class="text-right">{{ amountFormate(report.totalAmount) }}</td>
            <td class="text-right">—</td>
        </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-table thead tr {
  background: #f1f3f4;
}
</style>
