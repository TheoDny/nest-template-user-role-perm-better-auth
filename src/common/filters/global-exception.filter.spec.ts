import { ArgumentsHost } from "@nestjs/common"
import { GlobalExceptionFilter } from "./global-exception.filter"
import { ActiveOrganizationRequiredError } from "../errors"

describe("GlobalExceptionFilter", () => {
    it("formats application errors with a stable payload", () => {
        const json = jest.fn()
        const status = jest.fn().mockReturnValue({ json })
        const filter = new GlobalExceptionFilter()
        const host = {
            switchToHttp: () => ({
                getResponse: () => ({ status }),
                getRequest: () => ({ url: "/roles" }),
            }),
        } as unknown as ArgumentsHost

        filter.catch(new ActiveOrganizationRequiredError(), host)

        expect(status).toHaveBeenCalledWith(400)
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 400,
                error: "ActiveOrganizationRequiredError",
                code: "ACTIVE_ORGANIZATION_REQUIRED",
                path: "/roles",
            }),
        )
    })
})
