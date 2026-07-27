import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { DataTableHeaderType } from "@/app/common/types/table.types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "service-provider-list",
    disabled: false,
  },
  {
    title: "add-service-provider",
    disabled: true,
  },
];

export const serviceProviderContractExtensionHeader: DataTableHeaderType[] = [
  { title: "contract-start-date", key: "contractStartDate", sortable: true },
  { title: "contract-end-date", key: "contractEndDate", sortable: true },
  { title: "notes", key: "notes", sortable: false },
  { title: "status", key: "status", sortable: true },
  { title: "action", sortable: false, align: "end", width: "110px" }
];

export const serviceProviderDocumentTypeOptions: MenuSelectItemType[] = [
  { value: "", label: "Selecione o Tipo de Documento" },
  { value: "CONTRACT", label: "Contrato" },
  { value: "CONTRACT_ADDENDUM", label: "Adenda ao Contrato" },
  { value: "SERVICE_LEVEL_AGREEMENT", label: "Acordo de Nivel de Servico" },
  { value: "NON_DISCLOSURE_AGREEMENT", label: "Acordo de Confidencialidade" },
  { value: "COMMERCIAL_PROPOSAL", label: "Proposta Comercial" },
  { value: "PURCHASE_ORDER", label: "Ordem de Compra" },
  { value: "WORK_ORDER", label: "Ordem de Trabalho" },
  { value: "AWARD_LETTER", label: "Carta de Adjudicacao" },
  { value: "SCOPE_OF_WORK", label: "Escopo de Trabalho" },
  { value: "PROJECT_PLAN", label: "Plano do Projecto" },
  { value: "IMPLEMENTATION_SCHEDULE", label: "Cronograma de Implementacao" },
  { value: "PRICE_LIST", label: "Lista de Precos" },
  { value: "BANK_GUARANTEE", label: "Garantia Bancaria" },
  { value: "INSURANCE_POLICY", label: "Apolice de Seguro" },
  { value: "LICENSE", label: "Licenca" },
  { value: "CERTIFICATION", label: "Certificacao" },
  { value: "TAX_CLEARANCE_CERTIFICATE", label: "Certidao de Quitacao Fiscal" },
  { value: "SOCIAL_SECURITY_CLEARANCE", label: "Quitacao da Seguranca Social" },
  { value: "LEGAL_REPRESENTATION_DOCUMENT", label: "Documento de Representacao Legal" },
  { value: "TECHNICAL_SPECIFICATION", label: "Especificacao Tecnica" },
  { value: "SERVICE_COMMENCEMENT_CERTIFICATE", label: "Certificado de Inicio de Servico" },
  { value: "SERVICE_ACCEPTANCE_CERTIFICATE", label: "Certificado de Aceitacao do Servico" },
  { value: "CONTRACT_TERMINATION", label: "Termino do Contrato" },
  { value: "OTHER", label: "Outro" },
  { value: "AUTHORIZATION_LETTER", label: "Carta de Autorizacao" },
  { value: "ACCREDITATION_CERTIFICATE", label: "Certificado de Acreditacao" },
  { value: "QUALITY_CERTIFICATE", label: "Certificado de Qualidade" },
  { value: "COMPLIANCE_CERTIFICATE", label: "Certificado de Conformidade" }
];
