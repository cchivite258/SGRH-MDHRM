<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { breadcrumb as defaultBreadcrumb } from "@/components/invoice/view/utils";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import View from "@/components/invoice/view/index.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

const toSingleString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === "string");
  }
  return undefined;
};

const returnTo = computed(() => {
  const value = toSingleString(route.query.returnTo);
  return value?.startsWith("/") ? value : "";
});

const returnTitle = computed(() => {
  return toSingleString(route.query.returnTitle) || "invoices";
});

const buildReturnBreadcrumb = (target: string, targetTitle: string): BreadcrumbType[] => {
  const parsedReturnTo = new URL(target, "http://app.local");
  const institutionMatch = parsedReturnTo.pathname.match(/^\/institution\/(edit|view)\/([^/]+)$/);

  if (institutionMatch) {
    const [, mode] = institutionMatch;
    const institutionTitle = mode === "view" ? "view-institution" : "edit-institution";
    let targetWithPeriodTab = target;
    if (mode === "edit" && targetTitle === "periods" && !parsedReturnTo.searchParams.has("tab")) {
      parsedReturnTo.searchParams.set("tab", "2");
      targetWithPeriodTab = `${parsedReturnTo.pathname}?${parsedReturnTo.searchParams.toString()}`;
    }

    const items: BreadcrumbType[] = [
      {
        title: "institution-list",
        disabled: false,
        to: "/institution/list"
      },
      {
        title: institutionTitle,
        disabled: false,
        to: targetTitle === institutionTitle || targetTitle === "periods"
          ? targetWithPeriodTab
          : parsedReturnTo.pathname
      }
    ];

    if (targetTitle !== institutionTitle) {
      items.push({
        title: targetTitle,
        disabled: false,
        to: targetWithPeriodTab
      });
    }

    return items;
  }

  const coveragePeriodMatch = parsedReturnTo.pathname.match(/^\/institution\/coveragePeriod\/(edit|view)\/([^/]+)$/);

  if (coveragePeriodMatch) {
    const [, mode] = coveragePeriodMatch;
    const institutionId = parsedReturnTo.searchParams.get("institutionId");
    const items: BreadcrumbType[] = [
      {
        title: "institution-list",
        disabled: false,
        to: "/institution/list"
      }
    ];

    if (institutionId) {
      items.push({
        title: "edit-institution",
        disabled: false,
        to: {
          path: `/institution/edit/${institutionId}`,
          query: { tab: "2" }
        }
      });
    }

    items.push({
      title: mode === "view" ? "view-coverage-period" : "edit-coverage-period",
      disabled: false,
      to: target
    });

    return items;
  }

  const employeeHealthPlanMatch = parsedReturnTo.pathname.match(/^\/employee\/healthPlan\/(edit|view)\/([^/]+)$/);

  if (employeeHealthPlanMatch) {
    const [, mode] = employeeHealthPlanMatch;
    const employeeId = parsedReturnTo.searchParams.get("employeeId");
    const employeeTitle = mode === "view" ? "view-employee" : "edit-employee";
    const items: BreadcrumbType[] = [
      {
        title: "employee-list",
        disabled: false,
        to: "/employee/list"
      }
    ];

    if (employeeId) {
      items.push({
        title: employeeTitle,
        disabled: false,
        to: {
          path: `/employee/${mode === "view" ? "view" : "edit"}/${employeeId}`,
          query: { tab: "5" }
        }
      });
    }

    items.push({
      title: "view-health-plan",
      disabled: false,
      to: target
    });

    if (parsedReturnTo.searchParams.get("tab") === "global-usage") {
      items.push({
        title: "health-plan-global-usage",
        disabled: false,
        to: target
      });
    }

    return items;
  }

  const dependentHealthPlanMatch = parsedReturnTo.pathname.match(/^\/employee\/dependent-health-plan\/([^/]+)\/([^/]+)$/);

  if (dependentHealthPlanMatch) {
    const [, employeeId] = dependentHealthPlanMatch;
    const isViewMode = parsedReturnTo.searchParams.get("mode") === "view";

    return [
      {
        title: "employee-list",
        disabled: false,
        to: "/employee/list"
      },
      {
        title: isViewMode ? "view-employee" : "edit-employee",
        disabled: false,
        to: {
          path: `/employee/${isViewMode ? "view" : "edit"}/${employeeId}`,
          query: { tab: "4" }
        }
      },
      {
        title: "dependent-health-plan",
        disabled: false,
        to: target
      }
    ];
  }

  return [
    {
      title: targetTitle,
      disabled: false,
      to: target
    }
  ];
};

const breadcrumb = computed<BreadcrumbType[]>(() => {
  if (!returnTo.value) return defaultBreadcrumb;

  return [
    ...buildReturnBreadcrumb(returnTo.value, returnTitle.value),
    {
      title: "view-invoice",
      disabled: true
    }
  ];
});
</script>

<template>
  <Breadcrumb title="view-invoice" :items="breadcrumb" />
  <View :card-title="t('t-view-invoice')" :back-route="returnTo || '/invoices/list'" />
</template>
