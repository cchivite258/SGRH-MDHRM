import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "employee-list",
    disabled: false,
  },
  {
    title: "add-employee",
    disabled: true,
  },
];


export const genderOptions: MenuSelectItemType[] = [
  { value: "", label: "Selecione o Sexo" },
  {
    label: "Feminino",
    value: "FEMALE"
  },
  {
    label: "Masculino",
    value: "MALE"
  },
];

export const maritalStatusOptions: MenuSelectItemType[] = [
  { value: undefined, label: "Selecione o Estado Cívil" }, 
  {
    label: "Solteiro",
    value: "SINGLE"
  },
  {
    label: "Casado",
    value: "MARRIED"
  },
  {
    label: "Divorciado",
    value: "DIVORCED"
  },
  {
    label: "Viúvo",
    value: "WIDOWED"
  },
  {
    label: "Outro",
    value: "UNKNOWN"
  }
];

  export const bloodGroupOptions: MenuSelectItemType[] = [
  { value: "", label: "Selecione o Grupo Sanguíneo" },
  {
    label: "A+",
    value: "A+"
  },
  {
    label: "A-",
    value: "A-"
  },
  {
    label: "B+",
    value: "B+"
  },
  {
    label: "B-",
    value: "B-"
  },
  {
    label: "AB+",
    value: "AB+"
  },
  {
    label: "AB-",
    value: "AB-"
  },
  {
    label: "O+",
    value: "O+"
  },
  {
    label: "O-",
    value: "O-"
  }   
];

export const nationalityOptions: MenuSelectItemType[] = [
  { value: "", label: "Selecione a Nacionalidade" },
  {
    label: "Moçambicana",
    value: "MOZAMBICAN"
  },
  {
    label: "Estrangeiro",
    value: "FOREIGNER"
  }
];

export const relationshipOptions: MenuSelectItemType[] = [
  { value: "", label: "Selecione o Relacionamento" },
  {
    label: "Esposo(a)",
    value: "SPOUSE"
  },
  {
    label: "Filho(a)",
    value: "CHILD"
  },
   {
    label: "Pai/Mãe",
    value: "PARENT"
  },
   {
    label: "Outro",
    value: "OTHER"
  }
];

export const breadcrumbHealthPlan: BreadcrumbType[] = [
  {
    title: "view-health-plan",
    disabled: false,
  }
];

export const usagesHeader: DataTableHeaderType[] = [
  { title: "billed-amount", key: "billedAmount", sortable: true },
  { title: "covered-amount", key: "amountCovered", sortable: true },
  { title: "member-paid-amount", key: "memberPaidAmount", sortable: true }
];



export const contractDurationTypeOptions: MenuSelectItemType[] = [
  { value: "", label: "Selecione o Tipo de Duração do Contrato" },
  {
    label: "Determinado",
    value: "FIXED_TERM"
  },
  {
    label: "Indeterminado",
    value: "OPEN_ENDED"
  },
];