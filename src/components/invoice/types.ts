export type InvoiceListingType = {
    id: string ;
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    totalAmount: number;
    website: string;
    company?: string;
    invoiceStatus: string;
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        companyId?: string;
    };
    serviceProvider: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        description?: string;
        incomeTaxNumber: string;
    };
    currency?: {
        id: number;
        name: string;
        symbol:string

    } | null;
    isEmployeeInvoice: boolean;
    dependent?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    authorizedBy?: string;
    invoiceReferenceNumber?: string;
    flag?: string;
    enable: boolean;
    createdAt: Date ;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
};

export type InvoiceResponseType = { 
    id: string ;
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    totalAmount: number;
    website: string;
    company?: string;
    invoiceStatus: string;
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        companyId?: string;
    };
    serviceProvider: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        description?: string;
        incomeTaxNumber: string;
    };
    currency?: {
        id: number;
        name: string
    } | null;
    isEmployeeInvoice: boolean;
    dependent?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    authorizedBy?: string;
    invoiceReferenceNumber?: string;
    enable: boolean;
    createdAt: Date ;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
};

export type InvoiceInsertType = {
    id?: string;
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    totalAmount: number;
    employee: string | undefined;
    serviceProvider: string | undefined;
    currency?: number | undefined;
    isEmployeeInvoice: boolean;
    dependent?: string | undefined;
    company?: string;
    authorizedBy?: string;
    invoiceReferenceNumber?: string;
    coveragePeriod?: any;
    invoiceAttachment?: any;
}



export type InvoiceItemInsertType = {
    id?: string;
    unitPrice: number;
    quantity: number;
    taxRate: string;
    description: string;
    companyAllowedHospitalProcedure: string | undefined;
    invoice: string | undefined;
    totalAmount: number;
    flag?: string;
}

export type InvoiceItemListingType = {
    id: string;
    unitPrice: number;
    quantity: number;
    taxRate: {
        id: string;
        name: string;
    };
    description: string;
    companyAllowedHospitalProcedure: {
        id: string;
        hospitalProcedureType:{
            id: string;
            name: string;
        }
    };
    invoice: {
        id: string;
        totalAmount: number;
    };
    totalAmount: number;
    flag?: string;
    createdAt: Date ;
    updatedAt: Date | null;
    deletedAt: Date | null;
    createdBy: string;
    updatedBy: string;
    deletedBy: string;
}

export type InvoiceAdviceResponseType = {
    employeeId: string;
    billedAmount: number;
    canBeCovered: boolean; 
    remainingBalance: number;
    balanceAfterTransaction: number;
    timestamp: Date;
};

export type InvoiceAttachmentType = {
    id: string | undefined;
    file: File | string | null;
}
