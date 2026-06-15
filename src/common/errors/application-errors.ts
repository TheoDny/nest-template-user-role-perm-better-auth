import { HttpStatus } from "@nestjs/common"
import { AppError } from "./app.error"

export class ResourceNotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, "RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND)
    }
}

export class ForbiddenActionError extends AppError {
    constructor(message = "You are not allowed to perform this action") {
        super(message, "FORBIDDEN_ACTION", HttpStatus.FORBIDDEN)
    }
}

export class InvalidInvitationStateError extends AppError {
    constructor(message = "The invitation state does not allow this operation") {
        super(message, "INVALID_INVITATION_STATE", HttpStatus.CONFLICT)
    }
}

export class InvalidRoleAssignmentError extends AppError {
    constructor(message = "The requested role assignment is invalid") {
        super(message, "INVALID_ROLE_ASSIGNMENT", HttpStatus.BAD_REQUEST)
    }
}

export class LastOwnerRemovalError extends AppError {
    constructor(message = "The last owner cannot be removed from the organization") {
        super(message, "LAST_OWNER_REMOVAL", HttpStatus.CONFLICT)
    }
}

export class EmailAlreadyInvitedError extends AppError {
    constructor(message = "This email is already invited to the organization") {
        super(message, "EMAIL_ALREADY_INVITED", HttpStatus.CONFLICT)
    }
}

export class ActiveOrganizationRequiredError extends AppError {
    constructor(message = "An active organization is required for this operation") {
        super(message, "ACTIVE_ORGANIZATION_REQUIRED", HttpStatus.BAD_REQUEST)
    }
}

export class InvalidActiveOrganizationSelectionError extends AppError {
    constructor(message = "An organization id or organization slug is required") {
        super(message, "INVALID_ACTIVE_ORGANIZATION_SELECTION", HttpStatus.BAD_REQUEST)
    }
}

export class BetterAuthOperationError extends AppError {
    constructor(message = "Better Auth operation failed", statusCode = HttpStatus.BAD_REQUEST) {
        super(message, "BETTER_AUTH_OPERATION_FAILED", statusCode)
    }
}
