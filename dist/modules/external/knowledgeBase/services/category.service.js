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
exports.CategoryService = void 0;
const inversify_1 = require("inversify");
const data_source_1 = require("../../../../shared/database/data-source");
const containerTypes_1 = require("../../../../shared/config/containerTypes");
const Category_entity_1 = require("../entities/Category.entity");
const CreateCategorySchema_1 = require("../schema/categories/CreateCategorySchema");
const NotFoundError_1 = require("../../../../shared/errors/NotFoundError");
const UpdateCategorySchema_1 = require("../schema/categories/UpdateCategorySchema");
const AuthenticationError_1 = require("../../../../shared/errors/AuthenticationError");
let CategoryService = class CategoryService {
    categoryRepository;
    clientRepository;
    userRepository;
    constructor(categoryRepository, clientRepository, userRepository) {
        this.categoryRepository = categoryRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }
    async createCategory(input) {
        const validatedData = CreateCategorySchema_1.CreateCategorySchema.parse(input);
        const userId = validatedData.userId;
        if (!userId) {
            throw new AuthenticationError_1.AuthenticationError('User not authenticated.');
        }
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundError_1.NotFoundError('User', validatedData.userId);
            }
            const exisitingClient = await this.clientRepository.findById(validatedData.clientId);
            if (!exisitingClient) {
                throw new NotFoundError_1.NotFoundError('Client', validatedData.clientId);
            }
            const newCategory = new Category_entity_1.Category();
            newCategory.category_name = validatedData.categoryName;
            return await this.categoryRepository.create(newCategory, exisitingClient, user);
        });
    }
    async updateCategory(input) {
        const validatedData = UpdateCategorySchema_1.UpdateCategorySchema.parse(input);
        return await data_source_1.AppDataSource.manager.transaction(async (_t) => {
            const category = await this.categoryRepository.findById(validatedData.categoryId);
            if (!category) {
                throw new NotFoundError_1.NotFoundError('Category', validatedData.categoryId);
            }
            category.category_name = validatedData.categoryName;
            return await this.categoryRepository.save(category);
        });
    }
    async getCategories(clientId) {
        return await this.categoryRepository.findAllByClientId(clientId);
    }
    async getCategoryById(categoryId) {
        const category = await this.categoryRepository.findById(categoryId);
        if (!category) {
            throw new Error(`Category with id ${categoryId} does not exist.`);
        }
        return category;
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(containerTypes_1.TYPES.ICategoryRepository)),
    __param(1, (0, inversify_1.inject)(containerTypes_1.TYPES.IClientRepository)),
    __param(2, (0, inversify_1.inject)(containerTypes_1.TYPES.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], CategoryService);
//# sourceMappingURL=category.service.js.map