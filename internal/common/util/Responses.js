module.exports = class Responses {
    static methodNotAllowed() {
        return {
            status: 400,
            content: {
                code: 400,
                message: "The method is not supported",
                data: null   
            }
        }
    }
    
    static notFound() {
        return {
            status: 404,
            content: {
                code: 404,
                message: "The endpoint is not found",
                data: null
            }
        }
    }
    
    static success(data) {
        return {
            status: 200,
            content: {
                code: 1,
                message: "SUCCESS",
                data: data ?? null
            }
        }
    }
    
    static innerError() {
        return {
            status: 500,
            content: {
                code: 4,
                message: "INNER ERROR",
                data: null
            }
        }
    }
    
    static requiresUserAuthParams() {
        return {
            status: 400,
            content: {
                code: 400,
                message: "userId and access-token are expected"
            }
        }
    }
    
    static deviceAuthNotAllowed() {
        return {
            status: 200,
            content: {
                code: 2,
                message: "Device authentication is yet to be supported",
                data: null
            }
        }
    }
    
    static authFailed() {
        return {
            status: 401,
            content: {
                code: 401,
                message: "userId or access-token is invalid"
            }
        }
    }
    
    static userNotExists() {
        return {
            status: 200,
            content: {
                code: 102,
                message: "The user doesn't exist",
                data: null
            }
        }
    }
    
    static invalidPassword() {
        return {
            status: 200,
            content: {
                code: 108,
                message: "The password is invalid",
                data: null
            }
        }
    }
    
    static profileNotExists(data) {
        return {
            status: 200,
            content: {
                code: 1002,
                message: "The profile doesn't exist",
                data: data || null
            }
        }
    }
    
    static passwordSet() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The password has already been set",
                data: null
            }
        }  
    }
    
    static profileExists() {
        return {
            status: 200,
            content: {
                code: 1001,
                message: "The profile already exists",
                data: null
            }
        }
    }
    
    static invalidSex() {
        return {
            status: 400,
            content: {
                code: 3,
                message: "The sex must be 1 or 2",
                data: null
            }
        }
    }
    
    static missingRegisterParams() {
        return {
            status: 400,
            content: {
                code: 3,
                message: "Expected nickName and sex parameters",
                data: null
            }
        }
    }
    
    static notValidUser() {
        return {
            status: 200,
            content: {
                code: 3004,
                message: "The specified friend id is not a valid user",
                data: null
            }
        }
    }
    
    static alreadyInClan() {
        return {
            status: 200,
            content: {
                code: 7001,
                message: "The user is already in a clan",
                data: null
            }
        }
    }
    
    static clanNotExists() {
        return {
            status: 200,
            content: {
                code: 7101,
                message: "The specified clan doesn't exist",
                data: null
            }
        }
    }
    
    static notEnoughPermissions() {
        return {
            status: 200,
            content: {
                code: 7004,
                message: "You don't have enough permissions to do this action",
                data: null
            }
        }
    }
    
    static fileNotFound() {
        return {
            status: 404,
            content: {
                code: 404,
                message: "The file you tried to access wasn't found",
                data: null
            }
        }
    }
    
    static fileFound(file) {
        return {
            status: 200,
            content: file
        }
    }
    
    static dressNotOwned() {
        return {
            status: 200,
            content: {
                code: 4005,
                message: "User doesn't own this decoration",
                data: null
            }
        }
    }
    
    static notEnoughWealth(data) {
        return {
            status: 200,
            content: {
                code: 5006,
                message: "Not enough diamonds or gold",
                data: data ?? null
            }
        }
    }
    
    static gameNotExists() {
        return {
            status: 200,
            content: {
                code: 2002,
                message: "The specified game does not exist",
                data: null
            }
        }
    }
    
    static notInClan() {
        return {
            status: 200,
            content: {
                code: 7006,
                message: "The specified user is not in this clan",
                data: null
            }
        }
    }
    
    static invalidDonateQuantity() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "You need to at least donate 1 of any currency",
                data: null
            }
        }
    }
    
    static invalidCurrency() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The currency must either be 1 (Diamond) or 2 (Gold)",
                data: null
            }
        }
    }
    
    static donationExceedsMax() {
        return {
            status: 200,
            content: {
                code: 7011,
                message: "The quantity exceeds the donation limit for the specified currency",
                data: null
            }
        }
    }
    
    static clanMessageNotFound() {
        return {
            status: 200,
            content: {
                code: 11,
                message: "The specified userId was not found in the clan messages",
                data: null
            }
        }
    }
    
    static cannotLeaveClan() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The chief cannot leave his members alone!",
                data: null
            }
        }
    }
    
    static elderLimitReached() {
        return {
            status: 200,
            content: {
                code: 7010,
                message: "Already have the maximum number of elders",
                data: null
            }
        }
    }
    
    static cannotChangeOwnRole() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "You cannnot change your own role",
                data: null
            }
        }
    }
    
    static alreadyElder() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The specified member is already an elder",
                data: null
            }
        }
    }
    
    static invalidType() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The specified type is invalid",
                data: null
            }
        }
    }
    
    static invalidMailStatus() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The specified status is invalid",
                data: null
            }
        }
    }
    
    static mailNotFound() {
        return {
            status: 200,
            content: {
                code: 2,
                message: "The specified mail was not found",
                data: null
            }
        }
    }
    
    static mailHasNoAttachments() {
        return {
            status: 200,
            content: {
                code: 2,
                message: "The specified mail doesn't have any attachments",
                data: null
            }
        }
    }
    
    static alreadyFriend() {
        return {
            status: 200,
            content: {
                code: 3001,
                message: "You're already friend with this user",
                data: null
            }
        }
    }
    
    static friendListFull() {
        return {
            status: 200,
            content: {
                code: 3002,
                message: "Your friend list is full",
                data: null
            }
        }
    }
    
    static discordFailed() {
        return {
            status: 400,
            content: {
                code: 2,
                message: "Discord did not respond with 200 (OK)",
                data: null
            }
        }
    }
    
    static discordNotBound() {
        return {
            status: 200,
            content: {
                code: 9001,
                message: "You don't have a Discord account bound",
                data: null
            }
        }
    }
    
    static discordAlreadyBound() {
        return {
            status: 200,
            content: {
                code: 9002,
                message: "You already have a Discord account bound",
                data: null
            }
        }
    }

    static discordAlreadyRegistered() {
        return {
            status: 200,
            content: {
                code: 9003,
                message: "This discord account was already bound to another account"
            }
        }
    }
    
    static invalidParameter() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "Invalid parameter",
                data: null
            }
        }
    }
    
    static nicknameAlreadyExists() {
        return {
            status: 200,
            content: {
                code: 1003,
                message: "Nickname is already in use",
                data: null
            }   
        }
    }
    
    static inadequateClanLevel() {
        return {
            status: 200,
            content: {
                code: 7008,
                message: "Clan level too low to use this dress",
                data: null
            }
        }
    }
    
    static activityNotExists() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "The specified activity doesn't exist",
                data: null
            }
        }
    }
    
    static notEnoughBlocks() {
        return {
            status: 200,
            content: {
                code: 8012,
                message: "Not enough blocks",
                data: null
            }
        }
    }
    
    static alreadyOwned() {
        return {
            status: 200,
            content: {
                code: 4007,
                message: "You already own this item",
                data: null
            }
        }
    }
    
    static policyDenyRequest() {
        return {
            status: 200,
            content: {
                code: 1101,
                message: "The Server Policy has denied your request",
                data: null
            }
        }
    }
    
    static invalidDevice() {
        return {
            status: 200,
            content: {
                code: 110,
                message: "The Server Policy has denied your request",
                data: null
            }
        }
    }
    
    static gameAlreadyLiked() {
        return {
            status: 200,
            content: {
                code: 2005,
                message: "You already liked this game",
                data: null
            }
        }
    }
    
    static invalidSyntax() {
        return {
            status: 400,
            content: {
                code: 400,
                message: "JSON Syntax Error",
                data: null
            }
        }
    }
    
    static accountBanned(banInfo) {
        return {
            status: 403,
            content: {
                code: 403,
                message: "This ID has been banned",
                data: banInfo
            }
        }
    }
    
    static emailNotBound() {
        return {
            status: 200,
            content: {
                code: 3,
                message: "Add an email to your account first",
                data: null
            }
        }
    }

    static discordFailed() {
        return {
            status: 400,
            content: {
                code: 2,
                message: "Discord did not respond with 200 (OK)",
                data: null
            }
        }
    }
    
    static discordNotBound() {
        return {
            status: 200,
            content: {
                code: 9001,
                message: "You don't have a Discord account bound",
                data: null
            }
        }
    }
    
    static discordAlreadyBound() {
        return {
            status: 200,
            content: {
                code: 9002,
                message: "You already have a Discord account bound",
                data: null
            }
        }
    }

    
    static dispatchAuthFailed() {
        return {
            status: 200,
            content: {
                code: 1001,
                info: "Invalid userId or token"
            }
        }
    }

    static dispatchFailed(isFull) {
        return {
            status: 200,
            content: {
                code: 2,
                message: isFull ? "servers_full" : "create_game",
                data: null
            }
        }
    }

    static taskNotExists() {
        return {
            status: 200,
            content: {
                code: 7018,
                message: "This task doesn't exist or isn't generated yet",
                data: null
            }
        }
    }

    static taskAlreadyClaimed() {
        return {
            status: 200,
            content: {
                code: 7012,
                message: "The rewards for this task were already claimed",
                data: null
            }
        }
    }

    static taskNotFinished() {
        return {
            status: 200,
            content: {
                code: 7013,
                message: "You didn't finish the task",
                data: null
            }
        }
    }

    static activityFinished() {
        return {
            status: 200,
            content: {
                code: 8006,
                message: "Activity is finished",
                data: null
            }
        }
    }

    static emailAlreadyRegistered() {
        return {
            status: 200,
            content: {
                code: 113,
                message: "This email was already bound to an account",
                data: null
            }
        }
    }

    static emailVerificationError() {
        return {
            status: 200,
            content: {
                code: 107,
                message: "The provided code is invalid or no request has been made to bind an email",
                data: null
            }
        }
    }
}