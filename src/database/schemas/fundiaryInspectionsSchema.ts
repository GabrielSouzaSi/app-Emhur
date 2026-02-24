// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fundiaryInspections = sqliteTable("fundiaryInspections", {
  id: integer("id").primaryKey(),

  serviceOrderNumber: text("service_order_number"),
  processNumber: text("process_number"),
  processYear: text("process_year"),

  requesterName: text("requester_name"),
  requesterContact: text("requester_contact"),

  address: text("address"),
  addressNumber: text("address_number"),
  lotNumber: text("lot_number"),
  blockNumber: text("block_number"),

  areaRegistrationOwner: text("area_registration_owner"),
  observations: text("observations"),

  occupationTypeId: integer("occupation_type_id"),
  useTypeId: integer("use_type_id"),
  environmentalInfluenceTypeId: integer("environmental_influence_type_id"),

  frontPhotos: text("front_photos", { mode: 'json' }),
  edificationPhotos: text("edification_photos", { mode: 'json' }),
  extraPhotos: text("extra_photos", { mode: 'json' }),
  portPhotos: text("port_photos", { mode: 'json' }),
  perspectivePhotos: text("perspective_photos", { mode: 'json' }),

  latitude: text("latitude"),
  longitude: text("longitude")
})