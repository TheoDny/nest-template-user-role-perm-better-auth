import { createAccessControl } from "better-auth/plugins/access"

export const organizationStatements = {
    organization: ["update", "delete"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "update", "cancel"],
    ac: ["create", "read", "update", "delete"],
} as const

export const ac = createAccessControl(organizationStatements)

export const ownerRole = ac.newRole({
    organization: ["update", "delete"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "update", "cancel"],
    ac: ["create", "read", "update", "delete"],
})

export const adminRole = ac.newRole({
    organization: ["update"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "update", "cancel"],
    ac: ["create", "read", "update"],
})

export const memberRole = ac.newRole({
    member: [],
    invitation: [],
    ac: [],
})

export type OrganizationPermissionResource = keyof typeof organizationStatements
