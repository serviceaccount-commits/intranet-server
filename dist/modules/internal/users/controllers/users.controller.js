"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../../../shared/utils/logger");
const inversify_1 = require("inversify");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const CreateUserSchema_1 = require("../schema/users/CreateUserSchema");
const zod_1 = require("zod");
const FilterUserSchema_1 = require("../schema/users/FilterUserSchema");
const BusinessValidationError_1 = require("../../../../shared/errors/BusinessValidationError");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async createUser(req, res) {
        const validationResult = CreateUserSchema_1.CreateUserSchema.safeParse(req.body);
        if (!validationResult.success) {
            const formattedErrors = {};
            const fieldErrors = validationResult.error.flatten().fieldErrors;
            for (const key in fieldErrors) {
                const typedKey = key;
                const errorMessages = fieldErrors[typedKey];
                // This 'if' block is the key.
                // It checks that errorMessages is not undefined and not an empty array.
                if (errorMessages && errorMessages.length > 0) {
                    if (errorMessages[0]) {
                        formattedErrors[typedKey] = errorMessages[0];
                    }
                }
            }
            return res.status(422).json({
                message: 'The given data was invalid.',
                errors: formattedErrors,
            });
        }
        try {
            const newUser = await this.userService.createUser(validationResult.data);
            res.json(newUser);
        }
        catch (error) {
            if (error instanceof BusinessValidationError_1.BusinessValidationError) {
                return res.status(422).json({
                    message: error.message,
                    errors: error.errors,
                });
            }
            logger_1.logger.error('Unexpected error in UserController:', error);
            return res
                .status(500)
                .json({ message: 'An internal server error ocurred.' });
        }
    }
    async updateLastActivity(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(400).json({ error: 'Invalid user id' });
            }
            await this.userService.updateUserLastActivity(userId);
            res.sendStatus(200);
        }
        catch (error) {
            logger_1.logger.error('Unexpected error in UserController:', error);
            return res
                .status(500)
                .json({ message: 'An internal server error ocurred.' });
        }
    }
    async getSheetData(req, res, next) {
        try {
            const userId = req.user?.id;
            const { sheetOption } = req.params;
            if (sheetOption !== '1' && sheetOption !== '2') {
                res.sendStatus(400);
                return;
            }
            if (!userId) {
                res.sendStatus(400);
                return;
            }
            const sheetData = await this.userService.getSheetData(userId, +sheetOption);
            return res.json(sheetData);
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getUsers(req, res, next) {
        const validationResult = FilterUserSchema_1.FilterUserSchema.parse(req.query);
        try {
            const result = await this.userService.findUsers(validationResult);
            res.status(200).json({
                data: result,
                pagination: {
                    totalItems: result.total,
                    currentPage: validationResult.page,
                    itemsPerPage: validationResult.limit,
                    totalPages: Math.ceil(result.total / validationResult.limit),
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            next(error);
        }
    }
    async getUserById(req, res) {
        const { userid } = req.params;
        if (!userid) {
            return res.status(400).json({ error: 'Invalid user id' });
        }
        const user = await this.userService.getUserById(userid);
        res.json(user);
    }
    async getUserProfileById(req, res) {
        const { userId } = req.params;
        let withNoPhoneNumberCode = req.query['withNoPhoneNumberCode'] === 'true';
        if (withNoPhoneNumberCode === undefined) {
            withNoPhoneNumberCode = false;
        }
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const user = await this.userService.getUserProfileById(userId, withNoPhoneNumberCode);
        res.json(user);
    }
    async getMyUserProfile(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            res.sendStatus(400);
            return;
        }
        const user = await this.userService.getUserProfileById(userId, false);
        res.json(user);
    }
    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ error: 'Invalid user id' });
            }
            const input = req.body;
            const updatedUser = await this.userService.updateUser(userId, input);
            res.status(200).json(updatedUser);
        }
        catch (error) {
            if (error instanceof BusinessValidationError_1.BusinessValidationError) {
                return res.status(422).json({
                    message: error.message,
                    errors: error.errors,
                });
            }
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
        }
    }
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({ error: 'Invalid user id' });
            }
            const deletedUser = await this.userService.deleteUser(userId);
            res.status(200).json(deletedUser);
        }
        catch (error) {
            if (error instanceof BusinessValidationError_1.BusinessValidationError) {
                return res.status(422).json({
                    message: error.message,
                    errors: error.errors,
                });
            }
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json(error);
            }
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
        }
    }
};
UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserService)),
    __metadata("design:paramtypes", [Object])
], UserController);
exports.default = UserController;
//# sourceMappingURL=users.controller.js.map