type HealthPlanProcedure = Record<string, any>;

const firstDefined = (...values: unknown[]) =>
  values.find(value => value !== null && value !== undefined && value !== "");

const getProcedureSource = (procedure: HealthPlanProcedure) =>
  procedure.companyHealthPlanHospitalProcedures
  || procedure.contractHealthPlanHospitalProcedures
  || procedure.contractHealthPlanHospitalProcedure
  || procedure;

export const getOrderedProcedureType = (procedure: HealthPlanProcedure) =>
  procedure.hospitalProcedureType || {};

export const getOrderedProcedureCode = (procedure: HealthPlanProcedure) =>
  getOrderedProcedureType(procedure).code || "";

export const getOrderedProcedureName = (procedure: HealthPlanProcedure) =>
  getOrderedProcedureType(procedure).name || "-";

export const getOrderedProcedureCategoryName = (procedure: HealthPlanProcedure, fallback = "Procedimentos") =>
  getOrderedProcedureType(procedure).categoryName || fallback;

export const getOrderedProcedureGroupName = (procedure: HealthPlanProcedure) => {
  const source = getProcedureSource(procedure);
  const group = procedure.hospitalProcedureGroup || source.hospitalProcedureGroup;
  if (!group) return "-";
  return typeof group === "object" ? group.name || "-" : String(group);
};

const procedureUsesGroupLimit = (procedure: HealthPlanProcedure) => {
  const source = getProcedureSource(procedure);
  if (typeof procedure.belongsToGroup === "boolean") return procedure.belongsToGroup;
  if (typeof source.belongsToGroup === "boolean") return source.belongsToGroup;

  return firstDefined(
    source.groupFixedAmount,
    procedure.groupFixedAmount,
    source.groupPercentage,
    procedure.groupPercentage,
    source.hospitalProcedureGroupLimit,
    procedure.hospitalProcedureGroupLimit
  ) !== undefined;
};

const getProcedureValue = (procedure: HealthPlanProcedure, key: string) =>
  firstDefined(procedure[key], getProcedureSource(procedure)[key]);

const hasDisplayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return false;
  const numericValue = Number(String(value).replace(",", "."));
  return Number.isNaN(numericValue) ? true : numericValue !== 0;
};

const hasProcedureValues = (procedure: HealthPlanProcedure) => {
  if (procedureUsesGroupLimit(procedure)) {
    return hasDisplayValue(firstDefined(procedure.totalUsedBalance, procedure.usedBalance));
  }

  return [
    getProcedureValue(procedure, "fixedAmount"),
    getProcedureValue(procedure, "percentage"),
    procedure.allocatedBalance,
    procedure.usedBalance,
    procedure.totalUsedBalance,
    procedure.remainingBalance,
    getProcedureValue(procedure, "frequencyInterval"),
    getProcedureValue(procedure, "allowedFrequencyUse")
  ].some(hasDisplayValue);
};

const compareText = (left: string, right: string) =>
  left.localeCompare(right, undefined, { sensitivity: "base", numeric: true });

const compareProcedureCode = (left: HealthPlanProcedure, right: HealthPlanProcedure) =>
  compareText(
    getOrderedProcedureCode(left) || getOrderedProcedureName(left),
    getOrderedProcedureCode(right) || getOrderedProcedureName(right)
  );

const getProcedureCategoryKey = (procedure: HealthPlanProcedure, categoryFallback?: string) =>
  `${getOrderedProcedureGroupName(procedure)}::${getOrderedProcedureCategoryName(procedure, categoryFallback)}`;

export const orderHealthPlanProcedures = <T extends HealthPlanProcedure>(
  procedures: T[],
  categoryFallback?: string
) => {
  const categoryValueMap = procedures.reduce((map, procedure) => {
    const categoryKey = getProcedureCategoryKey(procedure, categoryFallback);
    map.set(categoryKey, (map.get(categoryKey) || false) || hasProcedureValues(procedure));
    return map;
  }, new Map<string, boolean>());

  return [...procedures].sort((left, right) => {
    const groupComparison = compareText(getOrderedProcedureGroupName(left), getOrderedProcedureGroupName(right));
    if (groupComparison !== 0) return groupComparison;

    const leftCategoryHasValues = categoryValueMap.get(getProcedureCategoryKey(left, categoryFallback)) || false;
    const rightCategoryHasValues = categoryValueMap.get(getProcedureCategoryKey(right, categoryFallback)) || false;
    if (leftCategoryHasValues !== rightCategoryHasValues) return leftCategoryHasValues ? -1 : 1;

    const categoryComparison = compareText(
      getOrderedProcedureCategoryName(left, categoryFallback),
      getOrderedProcedureCategoryName(right, categoryFallback)
    );
    if (categoryComparison !== 0) return categoryComparison;

    return compareProcedureCode(left, right);
  });
};

export const groupHealthPlanProcedures = <T extends HealthPlanProcedure>(
  procedures: T[],
  categoryFallback?: string
) => {
  const orderedProcedures = orderHealthPlanProcedures(procedures, categoryFallback);
  const groupMap = orderedProcedures.reduce((groups, procedure) => {
    const group = getOrderedProcedureGroupName(procedure);
    if (!groups[group]) groups[group] = [];
    groups[group].push(procedure);
    return groups;
  }, {} as Record<string, T[]>);

  return Object.entries(groupMap)
    .sort(([leftGroup], [rightGroup]) => compareText(leftGroup, rightGroup))
    .map(([group, groupProcedures]) => {
      const categoryMap = groupProcedures.reduce((categories, procedure) => {
        const category = getOrderedProcedureCategoryName(procedure, categoryFallback);
        if (!categories[category]) categories[category] = [];
        categories[category].push(procedure);
        return categories;
      }, {} as Record<string, T[]>);

      return {
        group,
        procedures: groupProcedures,
        categories: Object.entries(categoryMap)
          .sort(([leftCategory, leftProcedures], [rightCategory, rightProcedures]) => {
            const leftHasValues = leftProcedures.some(hasProcedureValues);
            const rightHasValues = rightProcedures.some(hasProcedureValues);
            if (leftHasValues !== rightHasValues) return leftHasValues ? -1 : 1;
            return compareText(leftCategory, rightCategory);
          })
          .map(([category, categoryProcedures]) => ({
            category,
            procedures: [...categoryProcedures].sort(compareProcedureCode)
          }))
      };
    });
};
