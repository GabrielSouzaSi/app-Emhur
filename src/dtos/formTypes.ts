// src/dtos/formTypes.ts
export type ImageSource = "camera" | "gallery"
export type ImageSourceMode = ImageSource | "both"

export type SelectItem = { label: string; value: string }

export type BaseField = {
    name: string
    label: string
    required?: boolean
    colSpan?: 1 | 2 | 3 | 4
    requiredMessage?: string
    accuracy?: LocationAccuracyMode
}

export type LocationValue = {
    latitude: number
    longitude: number
    accuracy?: number | null
}

export type LocationAccuracyMode = "balanced" | "high" | "best"

export type LocationField = BaseField & {
    type: "location"
    buttonLabel?: string
    accuracy?: LocationAccuracyMode
}

export type TextField = BaseField & {
    type:
    | "text"
    | "number"
    | "phone"
    | "textarea"
    | "email"
    | "password"
    | "cpf"
    | "cnpj"
    | "cpf_cnpj"
    | "process"
    placeholder?: string
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    patternMessage?: string
}

export type ImageField = BaseField & {
    type: "image"
    source: ImageSourceMode
    multiple?: boolean
}

export type SelectField = BaseField & {
    type: "select"
    placeholder?: string
    options: SelectItem[]
    searchable?: boolean
    multiple?: boolean
    searchPlaceholder?: string
}

export type ApiField = TextField | ImageField | SelectField | LocationField

export type FormSection = {
    id: string
    title: string
    description?: string
    fields: ApiField[]
    collapsible?: boolean
    initiallyCollapsed?: boolean
    layout?: string[][]
}

export type FormSchema = {
    id: string
    schemaVersion?: string
    title?: string
    endpoint: string
    sections: FormSection[]
}