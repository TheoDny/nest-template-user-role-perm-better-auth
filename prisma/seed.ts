import { createPrismaClient } from "@app/database/prisma-client.factory"

const prisma = createPrismaClient()

const seedOrganizations = [
    {
        name: "Orga 1",
        slug: "org-1",
    },
    {
        name: "Orga 2",
        slug: "org-2",
    },
    {
        name: "Orga 3",
        slug: "org-3",
    },
] as const

const seedUsers = [
    {
        name: "Seed Admin",
        email: "admin@example.com",
    },
    {
        name: "Seed Member One",
        email: "member.one@example.com",
    },
    {
        name: "Seed Member Two",
        email: "member.two@example.com",
    },
    {
        name: "Seed Member Three",
        email: "member.three@example.com",
    },
] as const

const seedMemberships = [
    {
        userEmail: "admin@example.com",
        organizationSlugs: ["org-1", "org-2", "org-3"],
        role: "owner",
    },
    {
        userEmail: "member.one@example.com",
        organizationSlugs: ["org-1", "org-2"],
        role: "member",
    },
    {
        userEmail: "member.two@example.com",
        organizationSlugs: ["org-2", "org-3"],
        role: "member",
    },
    {
        userEmail: "member.three@example.com",
        organizationSlugs: ["org-1", "org-2", "org-3"],
        role: "member",
    },
] as const

async function main(): Promise<void> {
    const usersByEmail = new Map<string, string>()
    const organizationsBySlug = new Map<string, string>()

    for (const user of seedUsers) {
        console.log(`Seeding user: ${user.email}`)
        const seededUser = await prisma.user.upsert({
            where: {
                email: user.email,
            },
            update: {
                name: user.name,
                emailVerified: true,
            },
            create: {
                name: user.name,
                email: user.email,
                emailVerified: true,
            },
            select: {
                id: true,
                email: true,
            },
        })

        usersByEmail.set(seededUser.email, seededUser.id)
    }

    for (const organization of seedOrganizations) {
        console.log(`Seeding organization: ${organization.slug}`)
        const seededOrganization = await prisma.organization.upsert({
            where: {
                slug: organization.slug,
            },
            update: {
                name: organization.name,
            },
            create: organization,
            select: {
                id: true,
                slug: true,
            },
        })

        organizationsBySlug.set(seededOrganization.slug, seededOrganization.id)
    }

    for (const membership of seedMemberships) {
        console.log(
            `Seeding membership: ${membership.userEmail} for organizations: ${membership.organizationSlugs.join(", ")}`,
        )
        const userId = usersByEmail.get(membership.userEmail)

        if (!userId) {
            throw new Error(`Seed user not found: ${membership.userEmail}`)
        }

        for (const organizationSlug of membership.organizationSlugs) {
            const organizationId = organizationsBySlug.get(organizationSlug)

            if (!organizationId) {
                throw new Error(`Seed organization not found: ${organizationSlug}`)
            }

            await prisma.member.upsert({
                where: {
                    organizationId_userId: {
                        organizationId,
                        userId,
                    },
                },
                update: {
                    role: membership.role,
                },
                create: {
                    organizationId,
                    userId,
                    role: membership.role,
                },
            })
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (error: unknown) => {
        console.error(error)
        await prisma.$disconnect()
        process.exit(1)
    })
