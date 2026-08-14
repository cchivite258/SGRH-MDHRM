import type { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from "vue-router";

type EmployeeBreadcrumbTitle = "add-employee" | "edit-employee" | "view-employee";

const toSingleString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const firstString = value.find((item): item is string => typeof item === "string");
    return firstString;
  }
  return undefined;
};

const resolveReturnTo = (route: RouteLocationNormalizedLoaded): string | undefined => {
  const returnTo = toSingleString(route.query.returnTo);
  return returnTo?.startsWith("/") ? returnTo : undefined;
};

const resolveEmployeeId = (route: RouteLocationNormalizedLoaded): string | undefined => {
  return toSingleString(route.params.id);
};

const resolveContractBreadcrumb = (returnTo: string): BreadcrumbType[] | null => {
  const parsedReturnTo = new URL(returnTo, "http://app.local");
  const contractMatch = parsedReturnTo.pathname.match(/^\/institution\/(edit|view)\/([^/]+)$/);

  if (!contractMatch) return null;

  const [, mode] = contractMatch;
  const contractPath = parsedReturnTo.pathname;

  return [
    {
      title: "institution-list",
      disabled: false,
      to: "/institution/list"
    },
    {
      title: mode === "view" ? "view-institution" : "edit-institution",
      disabled: false,
      to: contractPath
    },
    {
      title: "employees",
      disabled: false,
      to: returnTo
    }
  ];
};

export const buildEmployeeBreadcrumb = (
  route: RouteLocationNormalizedLoaded,
  currentTitle: EmployeeBreadcrumbTitle,
  currentTo?: RouteLocationRaw
): BreadcrumbType[] => {
  const returnTo = resolveReturnTo(route);
  const contractBreadcrumb = returnTo ? resolveContractBreadcrumb(returnTo) : null;

  if (contractBreadcrumb) {
    return [
      ...contractBreadcrumb,
      {
        title: currentTitle,
        disabled: true,
        to: currentTo
      }
    ];
  }

  return [
    {
      title: "employee-list",
      disabled: false,
      to: "/employee/list"
    },
    {
      title: currentTitle,
      disabled: true,
      to: currentTo
    }
  ];
};

export const buildEmployeeRoutePath = (route: RouteLocationNormalizedLoaded, basePath: string): string | undefined => {
  const employeeId = resolveEmployeeId(route);
  return employeeId ? `${basePath}/${employeeId}` : undefined;
};
